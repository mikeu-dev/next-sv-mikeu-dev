import { BaseRepository } from '../core/base.repository';
import { COLLECTIONS } from '../firebase/collections';
import { admin } from '../firebase/firebase.server';

export interface ProjectReaction {
	slug: string;
	likes: number;
	views: number;
}

export class ProjectReactionRepository extends BaseRepository<ProjectReaction> {
	constructor() {
		super(COLLECTIONS.PROJECT_REACTIONS);
	}

	async incrementLikes(slug: string) {
		const docRef = this.getCollection()?.doc(slug);
		if (!docRef) return;

		await docRef.set(
			{
				slug,
				likes: admin.firestore.FieldValue.increment(1) as unknown as number
			},
			{ merge: true }
		);
	}

	async incrementViews(slug: string) {
		const docRef = this.getCollection()?.doc(slug);
		if (!docRef) return;

		await docRef.set(
			{
				slug,
				views: admin.firestore.FieldValue.increment(1) as unknown as number
			},
			{ merge: true }
		);
	}
}
