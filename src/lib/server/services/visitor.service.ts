/**
 * VisitorService
 *
 * CRITICAL QUOTA NOTE (2026-05-07):
 * Previously, this service triggered "Quota Exceeded" errors because it performed
 * heavy queries on `visitor_logs` with large limits (1000-2000 docs) on every dashboard load.
 * Example: 25 dashboard loads x 2000 limit = 50,000 reads (Daily Free Tier Limit).
 *
 * RESOLUTION:
 * We now use the "Summary Document Pattern" (Pre-aggregation).
 * 1. Analytics and Geo data are updated INCREMENTALLY on every visit via `updateGeoSummary` and `updateAnalyticsSummary`.
 * 2. The dashboard reads only the summary documents (1 read each) instead of raw logs.
 * 3. Result: Read operations reduced by 99.8% (from 3000+ per load to ~3 per load).
 */

import { db } from '$lib/server/firebase/firebase.server';
import { FieldValue } from 'firebase-admin/firestore';
import { VisitorRepository } from '../repositories/visitor.repository';
import { persistentCache } from '../utils/cache.util';

export interface VisitorStats {
	total: number;
	today: number;
	lastUpdated: string; // ISO date string YYYY-MM-DD
}

export interface VisitorLogData {
	ip: string;
	browser: string;
	os: string;
	device: string;
	referer: string | null;
	language: string | null;
	path: string;
	timestamp?: Date | null;
	// Geo fields â€” populated via GeoIP service
	country?: string | null;
	city?: string | null;
	region?: string | null;
	latitude?: number | null;
	longitude?: number | null;
}

export interface VisitorAnalytics {
	topPages: [string, number][];
	deviceMix: [string, number][];
	browserMix: [string, number][];
	referrers: [string, number][];
}

/** Aggregated geo node untuk Folded World visualization */
export interface GeoNode {
	readonly id: string;
	readonly country: string;
	readonly city: string | null;
	readonly latitude: number;
	readonly longitude: number;
	readonly count: number;
	readonly lastVisit: string;
	readonly browsers: string[];
	readonly devices: string[];
}

import { sanitizeForFirestore } from '../utils/firestore';

export class VisitorService {
	private readonly collectionName = 'counters';
	private readonly logCollectionName = 'visitor_logs';
	private readonly summaryCollectionName = 'summaries';
	private readonly docId = 'visitors';
	private readonly geoSummaryDocId = 'geo_aggregation';
	private readonly analyticsSummaryDocId = 'analytics_aggregation';
	private repository = new VisitorRepository();

	private get db() {
		return db;
	}

	/**
	 * Increment visitor count and log details.
	 */
	async increment(logData?: VisitorLogData): Promise<void> {
		const currentDb = this.db;
		if (!currentDb) {
			console.warn('VisitorService: Database not initialized, skipping increment.');
			return;
		}

		// Invalidate caches on increment
		persistentCache.clear('visitor_stats');
		persistentCache.clear('geo_aggregation');
		persistentCache.clear('analytics_summary');

		const ref = currentDb.collection(this.collectionName).doc(this.docId);
		const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }); // YYYY-MM-DD

		try {
			await currentDb.runTransaction(async (t) => {
				const doc = await t.get(ref);

				if (!doc.exists) {
					t.set(ref, {
						total: 1,
						today: 1,
						lastUpdated: todayDate
					});
					return;
				}

				const data = doc.data() as VisitorStats;
				const isNewDay = data.lastUpdated !== todayDate;

				t.update(ref, {
					total: FieldValue.increment(1),
					today: isNewDay ? 1 : FieldValue.increment(1),
					lastUpdated: todayDate
				});
			});

			if (logData) {
				// 1. Save detailed log
				await currentDb.collection(this.logCollectionName).add({
					...sanitizeForFirestore(logData),
					timestamp: FieldValue.serverTimestamp()
				});

				// 2. Update Geo Summary (Pre-aggregation)
				if (logData.country && logData.latitude != null && logData.longitude != null) {
					await this.updateGeoSummary(logData);
				}

				// 3. Update Analytics Summary (Pre-aggregation)
				await this.updateAnalyticsSummary(logData);
			}
		} catch (error) {
			console.error('VisitorService: Error during increment', error);
		}
	}

	/**
	 * Updates the pre-aggregated geo summary document.
	 * This turns thousands of reads into just 1 read for the map visualization.
	 */
	private async updateGeoSummary(log: VisitorLogData): Promise<void> {
		const currentDb = this.db;
		if (!currentDb) return;

		const summaryRef = currentDb.collection(this.summaryCollectionName).doc(this.geoSummaryDocId);
		const key = `${log.country}::${log.city || 'unknown'}`.replace(/\//g, '_'); // Sanitize key

		try {
			await currentDb.runTransaction(async (t) => {
				const doc = await t.get(summaryRef);
				const now = new Date().toISOString();

				if (!doc.exists) {
					t.set(summaryRef, {
						[key]: {
							country: log.country,
							city: log.city || null,
							latitude: log.latitude,
							longitude: log.longitude,
							count: 1,
							lastVisit: now,
							browsers: log.browser ? [log.browser] : [],
							devices: log.device ? [log.device] : []
						},
						updatedAt: now
					});
				} else {
					const data = doc.data() || {};
					const existing = data[key] || {
						country: log.country,
						city: log.city || null,
						latitude: log.latitude,
						longitude: log.longitude,
						count: 0,
						browsers: [],
						devices: []
					};

					// Limit array sizes to keep document small
					const browsers = Array.from(new Set([...existing.browsers, log.browser])).slice(0, 5);
					const devices = Array.from(new Set([...existing.devices, log.device])).slice(0, 5);

					t.update(summaryRef, {
						[`${key}.count`]: FieldValue.increment(1),
						[`${key}.lastVisit`]: now,
						[`${key}.browsers`]: browsers,
						[`${key}.devices`]: devices,
						updatedAt: now
					});
				}
			});
		} catch (error) {
			console.error('VisitorService: Failed to update geo summary', error);
		}
	}

	/**
	 * Updates the pre-aggregated analytics summary document.
	 */
	private async updateAnalyticsSummary(log: VisitorLogData): Promise<void> {
		const currentDb = this.db;
		if (!currentDb) return;

		const summaryRef = currentDb
			.collection(this.summaryCollectionName)
			.doc(this.analyticsSummaryDocId);

		try {
			await currentDb.runTransaction(async (t) => {
				const doc = await t.get(summaryRef);
				const now = new Date().toISOString();

				// Simplified Referrer
				let ref = 'Direct';
				try {
					if (log.referer) {
						const url = new URL(log.referer);
						ref = url.hostname;
						if (ref.includes('google')) ref = 'Google';
						if (ref.includes('linkedin')) ref = 'LinkedIn';
						if (ref.includes('facebook')) ref = 'Facebook';
						if (ref.includes('twitter') || ref.includes('x.com')) ref = 'Twitter/X';
					}
				} catch {
					ref = 'Other';
				}

				const pathKey = log.path.replace(/\//g, '_') || 'home';
				const deviceKey = log.device || 'Desktop';
				const browserKey = log.browser || 'Unknown';
				const referrerKey = ref.replace(/\./g, '_');

				if (!doc.exists) {
					t.set(summaryRef, {
						topPages: { [pathKey]: 1 },
						deviceMix: { [deviceKey]: 1 },
						browserMix: { [browserKey]: 1 },
						referrers: { [referrerKey]: 1 },
						updatedAt: now
					});
				} else {
					t.update(summaryRef, {
						[`topPages.${pathKey}`]: FieldValue.increment(1),
						[`deviceMix.${deviceKey}`]: FieldValue.increment(1),
						[`browserMix.${browserKey}`]: FieldValue.increment(1),
						[`referrers.${referrerKey}`]: FieldValue.increment(1),
						updatedAt: now
					});
				}
			});
		} catch (error) {
			console.error('VisitorService: Failed to update analytics summary', error);
		}
	}

	async getStats(): Promise<VisitorStats | null> {
		return persistentCache.getWithFetch(
			'visitor_stats',
			async () => {
				const currentDb = this.db;
				if (!currentDb) return null;

				try {
					const doc = await currentDb.collection(this.collectionName).doc(this.docId).get();
					if (!doc.exists) return null;
					const data = doc.data() as VisitorStats;
					const todayDate = new Date().toLocaleDateString('en-CA', {
						timeZone: 'Asia/Jakarta'
					});

					if (data.lastUpdated !== todayDate) {
						return { ...data, today: 0 };
					}
					return data;
				} catch (error: unknown) {
					if (
						error &&
						typeof error === 'object' &&
						'code' in error &&
						(error as { code: number }).code === 8
					) {
						console.error('VisitorService: Quota exceeded while fetching stats');
						return persistentCache.get<VisitorStats>('visitor_stats');
					}
					console.error('VisitorService: Failed to get stats', error);
					return { total: 0, today: 0, lastUpdated: '' };
				}
			},
			5 * 60 * 1000 // 5 minutes
		);
	}

	async getRecentLogs(limit: number = 20): Promise<VisitorLogData[]> {
		try {
			// Limit always small for recent logs
			return await this.repository.getRecent(Math.min(limit, 50));
		} catch (error: unknown) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				(error as { code: number }).code === 8
			) {
				return [];
			}
			console.error('VisitorService: Failed to get recent logs', error);
			return [];
		}
	}

	/**
	 * Get aggregated analytics for the dashboard.
	 * Now uses summary document to avoid expensive log queries.
	 */
	async getAnalytics(): Promise<VisitorAnalytics> {
		const cacheKey = 'analytics_summary';

		return persistentCache.getWithFetch(
			cacheKey,
			async () => {
				const currentDb = this.db;
				if (!currentDb) return { topPages: [], deviceMix: [], browserMix: [], referrers: [] };

				try {
					const doc = await currentDb
						.collection(this.summaryCollectionName)
						.doc(this.analyticsSummaryDocId)
						.get();

					if (!doc.exists) {
						return { topPages: [], deviceMix: [], browserMix: [], referrers: [] };
					}

					const data = doc.data() || {};

					const format = (obj: Record<string, number> = {}) =>
						Object.entries(obj).sort((a, b) => b[1] - a[1]);

					return {
						topPages: format(data.topPages)
							.map(([k, v]) => [k.replace(/_/g, '/'), v] as [string, number])
							.slice(0, 10),
						deviceMix: format(data.deviceMix),
						browserMix: format(data.browserMix).slice(0, 5),
						referrers: format(data.referrers)
							.map(([k, v]) => [k.replace(/_/g, '.'), v] as [string, number])
							.slice(0, 5)
					};
				} catch (error: unknown) {
					console.error('VisitorService: Failed to get analytics', error);
					return (
						persistentCache.get<VisitorAnalytics>(cacheKey) || {
							topPages: [],
							deviceMix: [],
							browserMix: [],
							referrers: []
						}
					);
				}
			},
			30 * 60 * 1000 // 30 minutes
		);
	}

	/**
	 * Get aggregated geo data for Folded World visualization.
	 * Now uses the Pre-aggregated Summary document (1 Read) instead of querying thousands of logs.
	 */
	async getGeoAggregation(limit: number = 500): Promise<GeoNode[]> {
		const cacheKey = 'geo_aggregation';

		return persistentCache.getWithFetch(
			cacheKey,
			async () => {
				const currentDb = this.db;
				if (!currentDb) return [];

				try {
					// Read from the pre-aggregated summary document (ONLY 1 READ!)
					const summaryDoc = await currentDb
						.collection(this.summaryCollectionName)
						.doc(this.geoSummaryDocId)
						.get();

					if (!summaryDoc.exists) {
						console.log('Geo Summary not found, falling back to log aggregation');
						return this.fallbackGeoAggregation(Math.min(limit, 50));
					}

					const data = summaryDoc.data() || {};
					delete data.updatedAt;

					return Object.entries(data)
						.map(([id, node]: [string, unknown]) => {
							const nodeData = node as Omit<GeoNode, 'id'>;
							return {
								id,
								...nodeData
							};
						})
						.sort((a, b) => b.count - a.count)
						.slice(0, limit);
				} catch (error: unknown) {
					if (
						error &&
						typeof error === 'object' &&
						'code' in error &&
						(error as { code: number }).code === 8
					) {
						console.error('VisitorService: Quota exceeded while fetching geo aggregation');
						return persistentCache.get<GeoNode[]>(cacheKey) || [];
					}
					console.error('VisitorService: Failed to get geo aggregation', error);
					return [];
				}
			},
			30 * 60 * 1000 // 30 minutes
		);
	}

	/**
	 * Limited fallback to avoid quota kill.
	 */
	private async fallbackGeoAggregation(limit: number): Promise<GeoNode[]> {
		try {
			// Limit drastically reduced from 1000 to 50
			const logs = await this.repository.getWithGeoData(limit);
			const geoMap = new Map<
				string,
				{
					country: string;
					city: string | null;
					latitude: number;
					longitude: number;
					count: number;
					lastVisit: Date;
					browsers: string[];
					devices: string[];
				}
			>();

			for (const log of logs) {
				if (!log.country || log.latitude == null || log.longitude == null) continue;
				const key = `${log.country}::${log.city || 'unknown'}`;
				const existing = geoMap.get(key);
				const logDate = log.timestamp instanceof Date ? log.timestamp : new Date();

				if (existing) {
					existing.count++;
					if (logDate > existing.lastVisit) existing.lastVisit = logDate;
				} else {
					geoMap.set(key, {
						country: log.country,
						city: log.city || null,
						latitude: log.latitude,
						longitude: log.longitude,
						count: 1,
						lastVisit: logDate,
						browsers: log.browser ? [log.browser] : [],
						devices: log.device ? [log.device] : []
					});
				}
			}

			return Array.from(geoMap.entries())
				.map(([key, data]) => ({
					id: key,
					...data,
					lastVisit: data.lastVisit.toISOString()
				}))
				.sort((a, b) => b.count - a.count);
		} catch {
			return [];
		}
	}
	/**
	 * Clean up old visitor logs to keep the database lean.
	 * Limited to 500 deletions per call to avoid quota spikes.
	 */
	async clearOldLogs(daysToKeep = 30) {
		const currentDb = this.db;
		if (!currentDb) return 0;

		const cutoff = new Date();
		cutoff.setDate(cutoff.getDate() - daysToKeep);

		try {
			const snapshot = await currentDb
				.collection(this.logCollectionName)
				.where('timestamp', '<', cutoff)
				.limit(500)
				.get();

			if (snapshot.empty) return 0;

			const batch = currentDb.batch();
			snapshot.docs.forEach((doc) => batch.delete(doc.ref));
			await batch.commit();

			return snapshot.size;
		} catch (error) {
			console.error('VisitorService: Failed to clear old logs', error);
			return 0;
		}
	}
}
export const visitorService = new VisitorService();
