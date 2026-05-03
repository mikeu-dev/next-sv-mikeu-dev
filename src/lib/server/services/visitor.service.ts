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
}

export interface VisitorAnalytics {
	topPages: [string, number][];
	deviceMix: [string, number][];
	browserMix: [string, number][];
	referrers: [string, number][];
}

import { sanitizeForFirestore } from '../utils/firestore';

export class VisitorService {
	private readonly collection = 'counters';
	private readonly logCollection = 'visitor_logs';
	private readonly docId = 'visitors';
	private repository = new VisitorRepository();

	/**
	 * Increment visitor count and log details.
	 */
	async increment(logData?: VisitorLogData): Promise<void> {
		const ref = db.collection(this.collection).doc(this.docId);
		const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }); // YYYY-MM-DD

		try {
			await db.runTransaction(async (t) => {
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
				await db.collection(this.logCollection).add({
					...sanitizeForFirestore(logData),
					timestamp: FieldValue.serverTimestamp()
				});
			}
		} catch (error) {
			console.error('VisitorService: Failed to increment visitor count', error);
		}
	}

	/**
	 * Get current visitor statistics
	 */
	async getStats(): Promise<VisitorStats> {
		try {
			const doc = await db.collection(this.collection).doc(this.docId).get();

			if (!doc.exists) {
				return { total: 0, today: 0, lastUpdated: '' };
			}

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
}
export const visitorService = new VisitorService();
