import { db } from '../firebase/firebase.server';
import { COLLECTIONS } from '../firebase/collections';

export class SkillsService {
	async getSkills(lang: 'en' | 'id' = 'en') {
		try {
			const doc = await db.collection(COLLECTIONS.SKILLS).doc(lang).get();

			if (!doc.exists) {
				return { items: [] };
			}

			return doc.data();
		} catch (error) {
			console.error('Error fetching skills:', error);
			throw error;
		}
	}
}
