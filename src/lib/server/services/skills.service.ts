import { SkillsRepository } from '../repositories/skills.repository';

export class SkillsService {
	private repository = new SkillsRepository();

	async getSkills(lang: 'en' | 'id' = 'en') {
		try {
			const data = await this.repository.getByLang(lang);

			if (!data) {
				return { items: [] };
			}

			return data;
		} catch (error) {
			console.error('Error fetching skills:', error);
			throw error;
		}
	}
}
