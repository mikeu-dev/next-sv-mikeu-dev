import { BaseRepository } from '../core/base.repository';
import { COLLECTIONS } from '../firebase/collections';

import type { Project } from '../../types';


export class ProjectsRepository extends BaseRepository<Project> {
	constructor() {
		super(COLLECTIONS.PROJECTS);
	}

	async findBySlug(slug: string): Promise<Project | null> {
		const col = this.getCollection();
		if (!col) return null;

		const snapshot = await col.where('slug', '==', slug).limit(1).get();
		if (snapshot.empty) return null;
		const doc = snapshot.docs[0];
		if (!doc) return null;
		return { ...this.toPOJO(doc.data()), id: doc.id };
	}
}
