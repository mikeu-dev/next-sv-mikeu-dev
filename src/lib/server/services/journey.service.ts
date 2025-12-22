import { db } from '../firebase/firebase.server';
import { COLLECTIONS } from '../firebase/collections';

export class JourneyService {
    async getJourney(lang: 'en' | 'id' = 'en') {
        try {
            const doc = await db.collection(COLLECTIONS.JOURNEY).doc(lang).get();

            if (!doc.exists) {
                return { items: [] };
            }

            return doc.data();
        } catch (error) {
            console.error('Error fetching journey:', error);
            throw error;
        }
    }
}
