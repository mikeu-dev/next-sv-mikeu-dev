import { db } from '../firebase/firebase.server';
import { COLLECTIONS } from '../firebase/collections';

export class TechStackService {
	async getTechStack(lang: 'en' | 'id' = 'en') {
		try {
			const doc = await db.collection(COLLECTIONS.TECHSTACK).doc(lang).get();

			if (!doc.exists) {
				return { categories: [] };
			}

			return doc.data();
		} catch (error) {
			console.error('Error fetching techstack:', error);
			throw error;
		}
	}
}
