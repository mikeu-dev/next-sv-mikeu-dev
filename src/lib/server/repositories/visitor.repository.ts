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
		const snapshot = await this.getCollection()
			.orderBy('timestamp', 'desc')
			.limit(limit)
			.get();

		return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
			...this.toPOJO(doc.data()),
			id: doc.id
		})) as VisitorLogData[];
	}
}
