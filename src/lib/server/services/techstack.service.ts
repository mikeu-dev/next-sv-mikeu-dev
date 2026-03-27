import { TechStackRepository, type TechStackData } from '../repositories/techstack.repository';

export class TechStackService {
	private repository = new TechStackRepository();

	async getTechStack(lang: 'en' | 'id' = 'en'): Promise<TechStackData> {
		try {
			const data = await this.repository.getByLang(lang);

			if (!data) {
				return { categories: [] };
			}

			return data;
		} catch (error) {
			console.error('Error fetching techstack:', error);
			throw error;
		}
	}
}
