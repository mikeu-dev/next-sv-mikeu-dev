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

	async updateSkills(lang: 'en' | 'id', items: string[]) {
		try {
			// Using update() in BaseRepository for consistency.
			// BaseRepository.update(id, data) uses doc(id).update(data).
			// If doc doesn't exist, we might need set().
			// But for simplicity, we assume doc exists since we migrated it.
			return await this.repository.update(lang, { items, updatedAt: new Date() });
		} catch (error) {
			console.error('Error updating skills:', error);
			throw error;
		}
	}
}
