import { db } from '$lib/server/firebase/firebase.server';
import { FieldValue } from 'firebase-admin/firestore';

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
	timestamp?: object | null;
}

export class VisitorService {
	private readonly collection = 'counters';
	private readonly logCollection = 'visitor_logs';
	private readonly docId = 'visitors';

	/**
	 * Increment visitor count and log details.
	 * Logic:
	 * - Always increment 'total'
	 * - Check 'lastUpdated'
	 * - If date changed: set 'today' = 1, update 'lastUpdated'
	 * - If same date: increment 'today'
	 */
	async increment(logData?: VisitorLogData): Promise<void> {
		const ref = db.collection(this.collection).doc(this.docId);
		const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }); // YYYY-MM-DD

		try {
			await db.runTransaction(async (t) => {
				const doc = await t.get(ref);

				if (!doc.exists) {
					// Initialize if not exists
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

			// Optional: If reading on a new day but no write happened yet, 'today' might be stale in DB.
			// However, for display purposes, we might want to return 0 if date mismatch,
			// OR just return what is in DB.
			// For a accurate "today" view without write, we should check date.

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
			const snapshot = await db
				.collection(this.logCollection)
				.orderBy('timestamp', 'desc')
				.limit(limit)
				.get();

			return snapshot.docs.map((doc) => {
				const data = doc.data();
				return {
					...data,
					timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString()
				} as VisitorLogData;
			});
		} catch (error) {
			console.error('VisitorService: Failed to get recent logs', error);
			return [];
		}
	}
}
