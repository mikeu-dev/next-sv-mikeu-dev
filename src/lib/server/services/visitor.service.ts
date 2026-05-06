import { db } from '$lib/server/firebase/firebase.server';
import { FieldValue } from 'firebase-admin/firestore';
import { VisitorRepository } from '../repositories/visitor.repository';

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
	// Geo fields — populated via GeoIP service
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
	private readonly docId = 'visitors';
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
			console.warn('⚠️ VisitorService: Database not initialized, skipping increment.');
			return;
		}

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
				await currentDb.collection(this.logCollectionName).add({
					...sanitizeForFirestore(logData),
					timestamp: FieldValue.serverTimestamp()
				});
			}
		} catch (error) {
			console.error('VisitorService: Error during increment', error);
		}
	}

	async getStats(): Promise<VisitorStats | null> {
		const currentDb = this.db;
		if (!currentDb) return null;

		try {
			const doc = await currentDb.collection(this.collectionName).doc(this.docId).get();
			if (!doc.exists) return null;
			const data = doc.data() as VisitorStats;
			const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
			if (data.lastUpdated !== todayDate) {
				return { ...data, today: 0 };
			}
			return data;
		} catch (error) {
			console.error('VisitorService: Failed to get stats', error);
			return { total: 0, today: 0, lastUpdated: '' };
		}
	}

	async getRecentLogs(limit: number = 20): Promise<VisitorLogData[]> {
		try {
			return await this.repository.getRecent(limit);
		} catch (error) {
			console.error('VisitorService: Failed to get recent logs', error);
			return [];
		}
	}

	/**
	 * Get aggregated analytics for the dashboard
	 */
	async getAnalytics(days: number = 30): Promise<VisitorAnalytics> {
		try {
			// Calculate cutoff date
			const cutoff = new Date();
			cutoff.setDate(cutoff.getDate() - days);

			// Fetch more logs for aggregation (up to 1000)
			const logs = await this.repository.getRecent(1000);

			// Filter logs by date
			const filteredLogs = logs.filter((log) => {
				if (!log.timestamp) return false;
				const logDate = log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp);
				return logDate >= cutoff;
			});

			const topPages: Record<string, number> = {};
			const deviceMix: Record<string, number> = {};
			const browserMix: Record<string, number> = {};
			const referrers: Record<string, number> = {};

			filteredLogs.forEach((log) => {
				// Count pages
				topPages[log.path] = (topPages[log.path] || 0) + 1;

				// Count devices
				const device = log.device || 'Desktop';
				deviceMix[device] = (deviceMix[device] || 0) + 1;

				// Count browsers
				const browser = log.browser || 'Unknown';
				browserMix[browser] = (browserMix[browser] || 0) + 1;

				// Count referrers
				let ref = 'Direct';
				try {
					if (log.referer) {
						const url = new URL(log.referer);
						ref = url.hostname;
						// Clean up common ones
						if (ref.includes('google')) ref = 'Google';
						if (ref.includes('linkedin')) ref = 'LinkedIn';
						if (ref.includes('facebook')) ref = 'Facebook';
						if (ref.includes('twitter') || ref.includes('x.com')) ref = 'Twitter/X';
						if (ref === 'localhost') ref = 'Development';
					}
				} catch {
					ref = 'Other';
				}
				referrers[ref] = (referrers[ref] || 0) + 1;
			});

			return {
				topPages: Object.entries(topPages)
					.sort((a, b) => b[1] - a[1])
					.slice(0, 10),
				deviceMix: Object.entries(deviceMix).sort((a, b) => b[1] - a[1]),
				browserMix: Object.entries(browserMix)
					.sort((a, b) => b[1] - a[1])
					.slice(0, 5),
				referrers: Object.entries(referrers)
					.sort((a, b) => b[1] - a[1])
					.slice(0, 5)
			};
		} catch (error) {
			console.error('VisitorService: Failed to get analytics', error);
			return { topPages: [], deviceMix: [], browserMix: [], referrers: [] };
		}
	}

	/**
	 * Get aggregated geo data for Folded World visualization.
	 * Groups visitor logs by country+city and returns geo nodes.
	 */
	async getGeoAggregation(limit: number = 500): Promise<GeoNode[]> {
		try {
			const logs = await this.repository.getWithGeoData(2000);

			// Aggregate by country + city
			const geoMap = new Map<
				string,
				{
					country: string;
					city: string | null;
					latitude: number;
					longitude: number;
					count: number;
					lastVisit: Date;
					browsers: Set<string>;
					devices: Set<string>;
				}
			>();

			for (const log of logs) {
				if (!log.country || log.latitude == null || log.longitude == null) continue;

				const key = `${log.country}::${log.city || 'unknown'}`;
				const existing = geoMap.get(key);

				const logDate =
					log.timestamp instanceof Date
						? log.timestamp
						: log.timestamp
							? new Date(log.timestamp)
							: new Date();

				if (existing) {
					existing.count++;
					if (logDate > existing.lastVisit) {
						existing.lastVisit = logDate;
					}
					if (log.browser) existing.browsers.add(log.browser);
					if (log.device) existing.devices.add(log.device);
				} else {
					geoMap.set(key, {
						country: log.country,
						city: log.city || null,
						latitude: log.latitude,
						longitude: log.longitude,
						count: 1,
						lastVisit: logDate,
						browsers: new Set(log.browser ? [log.browser] : []),
						devices: new Set(log.device ? [log.device] : [])
					});
				}
			}

			// Convert to array and sort by count descending
			const nodes: GeoNode[] = Array.from(geoMap.entries())
				.map(([key, data]) => ({
					id: key,
					country: data.country,
					city: data.city,
					latitude: data.latitude,
					longitude: data.longitude,
					count: data.count,
					lastVisit: data.lastVisit.toISOString(),
					browsers: Array.from(data.browsers),
					devices: Array.from(data.devices)
				}))
				.sort((a, b) => b.count - a.count)
				.slice(0, limit);

			return nodes;
		} catch (error) {
			console.error('VisitorService: Failed to get geo aggregation', error);
			return [];
		}
	}
}
export const visitorService = new VisitorService();
