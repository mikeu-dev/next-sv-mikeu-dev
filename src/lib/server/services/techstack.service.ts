import { TechStackRepository, type TechStackData } from '../repositories/techstack.repository';

export class TechStackService {
	private repository = new TechStackRepository();

	// In-Memory Cache
	private static cache: Record<string, TechStackData> = {};
	private static lastFetch: Record<string, number> = {};
	private static CACHE_TTL = 3600000; // 1 jam

	async getTechStack(lang: 'en' | 'id' = 'en'): Promise<TechStackData> {
		const now = Date.now();

		if (
			TechStackService.cache[lang] &&
			now - (TechStackService.lastFetch[lang] || 0) < TechStackService.CACHE_TTL
		) {
			return TechStackService.cache[lang];
		}

		try {
			const data = await this.repository.getByLang(lang);

			if (!data) {
				const empty = { categories: [] };
				TechStackService.cache[lang] = empty;
				TechStackService.lastFetch[lang] = now;
				return empty;
			}

			TechStackService.cache[lang] = data;
			TechStackService.lastFetch[lang] = now;

			return data;
		} catch (error) {
			console.error('Error fetching techstack:', error);
			throw error;
		}
	}

	async updateTechStack(lang: 'en' | 'id', data: TechStackData) {
		try {
			const result = await this.repository.update(lang, { ...data, updatedAt: new Date() });

			// Reset cache
			delete TechStackService.cache[lang];
			delete TechStackService.lastFetch[lang];

			return result;
		} catch (error) {
			console.error('Error updating techstack:', error);
			throw error;
		}
	}
}
