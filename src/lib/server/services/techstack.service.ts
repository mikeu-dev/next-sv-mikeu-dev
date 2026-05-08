import { TechStackRepository, type TechStackData } from '../repositories/techstack.repository';
import { dev } from '$app/environment';
import { persistentCache } from '../utils/cache.util';

export class TechStackService {
	private repository = new TechStackRepository();

	// In-Memory Cache
	private static cache: Record<string, TechStackData> = {};
	private static lastFetch: Record<string, number> = {};
	private static CACHE_TTL = 3600000; // 1 jam

	async getTechStack(lang: 'en' | 'id' = 'en'): Promise<TechStackData> {
		const now = Date.now();

		// 1. Memory Cache
		if (
			TechStackService.cache[lang] &&
			now - (TechStackService.lastFetch[lang] || 0) < TechStackService.CACHE_TTL
		) {
			return TechStackService.cache[lang];
		}

		// 2. Persistent File Cache (Dev only)
		if (dev) {
			const cached = persistentCache.get<TechStackData>(`techstack_${lang}`);
			if (cached) {
				TechStackService.cache[lang] = cached;
				TechStackService.lastFetch[lang] = now;
				return cached;
			}
		}

		try {
			const data = await this.repository.getByLang(lang);

			if (!data) {
				const empty = { categories: [] };
				TechStackService.cache[lang] = empty;
				TechStackService.lastFetch[lang] = now;
				return empty;
			}

			// Update caches
			TechStackService.cache[lang] = data;
			TechStackService.lastFetch[lang] = now;
			if (dev) persistentCache.set(`techstack_${lang}`, data);

			return data;
		} catch (error: unknown) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				(error as { code: number }).code === 8
			) {
				console.error(`TechStackService: Quota exceeded while fetching techstack for ${lang}`);
				return (
					persistentCache.get<TechStackData>(`techstack_${lang}`) ||
					TechStackService.cache[lang] || { categories: [] }
				);
			}
			console.error('Error fetching techstack:', error);
			throw error;
		}
	}

	async updateTechStack(lang: 'en' | 'id', data: TechStackData) {
		try {
			const result = await this.repository.update(lang, { ...data, updatedAt: new Date() });

			// Invalidate caches
			delete TechStackService.cache[lang];
			delete TechStackService.lastFetch[lang];
			if (dev) persistentCache.clear(`techstack_${lang}`);

			return result;
		} catch (error) {
			console.error('Error updating techstack:', error);
			throw error;
		}
	}
}
