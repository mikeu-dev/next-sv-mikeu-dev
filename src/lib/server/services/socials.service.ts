import { db } from '../firebase/firebase.server';
import { COLLECTIONS } from '../firebase/collections';

export class SocialsService {
	async getSocials() {
		try {
			const doc = await db.collection(COLLECTIONS.SOCIALS).doc('default').get();

			if (!doc.exists) {
				return { links: [] };
			}

			return doc.data();
		} catch (error) {
			console.error('Error fetching socials:', error);
			throw error;
		}
	}
}
