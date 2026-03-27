import { SkillsRepository } from '../repositories/skills.repository';

export class SkillsService {
	private repository = new SkillsRepository();

	// In-Memory Cache
	private static cache: Record<string, { items: string[] }> = {};
	private static lastFetch: Record<string, number> = {};
	private static CACHE_TTL = 3600000; // 1 jam

	async getSkills(lang: 'en' | 'id' = 'en') {
		const now = Date.now();

		if (
			SkillsService.cache[lang] &&
			now - (SkillsService.lastFetch[lang] || 0) < SkillsService.CACHE_TTL
		) {
			return SkillsService.cache[lang];
		}

		try {
			const data = await this.repository.getByLang(lang);

			if (!data) {
				const empty = { items: [] };
				SkillsService.cache[lang] = empty;
				SkillsService.lastFetch[lang] = now;
				return empty;
			}

			SkillsService.cache[lang] = data;
			SkillsService.lastFetch[lang] = now;
			return data;
		} catch (error) {
			console.error('Error fetching skills:', error);
			throw error;
		}
	}

	async updateSkills(lang: 'en' | 'id', items: string[]) {
		try {
			const result = await this.repository.update(lang, { items, updatedAt: new Date() });

			// Reset cache
			delete SkillsService.cache[lang];
			delete SkillsService.lastFetch[lang];

			return result;
		} catch (error) {
			console.error('Error updating skills:', error);
			throw error;
		}
	}
}
