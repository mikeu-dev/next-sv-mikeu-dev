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
	userId?: string;
	context?: Record<string, unknown>;
	status?: number;
}

export class MonitoringService {
	private collection = db.collection(COLLECTIONS.ERROR_LOGS);

	async logError(log: Omit<AppErrorLog, 'timestamp'>) {
		try {
			const fullLog: AppErrorLog = {
				...log,
				timestamp: new Date()
			};

			// Auto-clean: Limit to reasonable stack size
			if (fullLog.stack && fullLog.stack.length > 5000) {
				fullLog.stack = fullLog.stack.substring(0, 5000) + '... [truncated]';
			}

			const docRef = await this.collection.add(fullLog);
			return docRef.id;
		} catch (error) {
			// Fail silently to avoid infinite error loops
			console.error('CRITICAL: MonitoringService failed to log error', error);
			return null;
		}
	}

	async getLogs(limit = 50) {
		const snapshot = await this.collection.orderBy('timestamp', 'desc').limit(limit).get();

		return snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
			timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
		})) as AppErrorLog[];
	}

	async clearOldLogs(daysToKeep = 7) {
		const cutoff = new Date();
		cutoff.setDate(cutoff.getDate() - daysToKeep);

		const snapshot = await this.collection.where('timestamp', '<', cutoff).get();

		const batch = db.batch();
		snapshot.docs.forEach((doc) => batch.delete(doc.ref));
		await batch.commit();

		return snapshot.size;
	}
}

export const monitoringService = new MonitoringService();
