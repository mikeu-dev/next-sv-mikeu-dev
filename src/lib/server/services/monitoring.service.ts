import { db } from '../firebase/firebase.server';
import { COLLECTIONS } from '../firebase/collections';

export interface AppErrorLog {
	id?: string;
	timestamp: Date;
	type: 'server' | 'client';
	message: string;
	stack?: string;
	url: string;
	userAgent?: string;
	locale?: string;
	userId?: string | null;
	context?: Record<string, unknown>;
	status?: number;
}

import { sanitizeForFirestore } from '../utils/firestore';

export class MonitoringService {
	private get collection() {
		if (!db) return null;
		return db.collection(COLLECTIONS.ERROR_LOGS);
	}

	async logError(log: Omit<AppErrorLog, 'timestamp'>) {
		const col = this.collection;
		if (!col) {
			console.warn('⚠️ MonitoringService: Database not initialized, skipping log.');
			return null;
		}

		try {
			const fullLog: AppErrorLog = {
				...log,
				timestamp: new Date()
			};

			const sanitizedLog = sanitizeForFirestore(fullLog);

			// Auto-clean: Limit to reasonable stack size
			if (sanitizedLog.stack && (sanitizedLog.stack as string).length > 5000) {
				sanitizedLog.stack = (sanitizedLog.stack as string).substring(0, 5000) + '... [truncated]';
			}

			const docRef = await col.add(sanitizedLog);
			return docRef.id;
		} catch (error) {
			// Fail silently to avoid infinite error loops
			console.error('CRITICAL: MonitoringService failed to log error', error);
			return null;
		}
	}

	async getLogs(limit = 50) {
		const col = this.collection;
		if (!col) return [];

		const snapshot = await col.orderBy('timestamp', 'desc').limit(limit).get();

		return snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
			timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
		})) as AppErrorLog[];
	}

	async clearOldLogs(daysToKeep = 7) {
		const col = this.collection;
		if (!col || !db) return 0;

		const cutoff = new Date();
		cutoff.setDate(cutoff.getDate() - daysToKeep);

		const snapshot = await col.where('timestamp', '<', cutoff).get();

		const batch = db.batch();
		snapshot.docs.forEach((doc) => batch.delete(doc.ref));
		await batch.commit();

		return snapshot.size;
	}
}

export const monitoringService = new MonitoringService();
