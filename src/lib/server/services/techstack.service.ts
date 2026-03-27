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

	async updateTechStack(lang: 'en' | 'id', data: TechStackData) {
		try {
			return await this.repository.update(lang, { ...data, updatedAt: new Date() });
		} catch (error) {
			console.error('Error updating techstack:', error);
			throw error;
		}
	}
}
