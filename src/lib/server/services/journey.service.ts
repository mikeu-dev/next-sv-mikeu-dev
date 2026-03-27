import { JourneyRepository } from '../repositories/journey.repository';
import type { JourneyItem } from '$lib/types';

export class JourneyService {
	private repository = new JourneyRepository();

	async getJourney(lang: 'en' | 'id' = 'en') {
		try {
			const data = await this.repository.getByLang(lang);

			if (!data) {
				return { items: [] };
			}

			return data;
		} catch (error) {
			console.error('Error fetching journey:', error);
			throw error;
		}
	}

	async updateJourney(lang: 'en' | 'id', items: JourneyItem[]) {
		try {
			return await this.repository.update(lang, { items, updatedAt: new Date() });
		} catch (error) {
			console.error('Error updating journey:', error);
			throw error;
		}
	}
}
