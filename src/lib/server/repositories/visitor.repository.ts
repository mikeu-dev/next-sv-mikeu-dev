import { BaseRepository } from '../core/base.repository';
import type { VisitorLogData } from '../services/visitor.service';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

/**
 * Repository untuk menangani log pengunjung.
 */
export class VisitorRepository extends BaseRepository<VisitorLogData> {
	constructor() {
		super('visitor_logs');
	}

	async getRecent(limit: number = 20): Promise<VisitorLogData[]> {
		const col = this.getCollection();
		if (!col) return [];

		const snapshot = await col.orderBy('timestamp', 'desc').limit(limit).get();

		return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
			...this.toPOJO(doc.data()),
			id: doc.id
		})) as VisitorLogData[];
	}

	/**
	 * Fetch visitor logs yang memiliki geo data (country + coordinates).
	 * Digunakan untuk Folded World visualization.
	 */
	async getWithGeoData(limit: number = 2000): Promise<VisitorLogData[]> {
		const col = this.getCollection();
		if (!col) return [];

		// Firestore doesn't support != null natively for multiple fields,
		// so we filter by country existence and limit generously.
		const snapshot = await col
			.where('country', '!=', null)
			.orderBy('timestamp', 'desc')
			.limit(limit)
			.get();

		return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
			...this.toPOJO(doc.data()),
			id: doc.id
		})) as VisitorLogData[];
	}
}
