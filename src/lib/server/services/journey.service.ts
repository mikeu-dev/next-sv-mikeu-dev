import { JourneyRepository } from '../repositories/journey.repository';

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
}
