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
					...logData,
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
}
