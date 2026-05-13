import { SkillsRepository } from '../repositories/skills.repository';
import { dev } from '$app/environment';
import { persistentCache } from '../utils/cache.util';

export class SkillsService {
	private repository = new SkillsRepository();

	// In-Memory Cache
	private static cache: Record<string, { items: string[] }> = {};
	private static lastFetch: Record<string, number> = {};
	private static CACHE_TTL = 3600000; // 1 jam

	async getSkills(lang: 'en' | 'id' = 'en') {
		const now = Date.now();

		// 1. Memory Cache
		if (
			SkillsService.cache[lang] &&
			now - (SkillsService.lastFetch[lang] || 0) < SkillsService.CACHE_TTL
		) {
			return SkillsService.cache[lang];
		}

		// 2. Persistent File Cache (Dev only)
		if (dev) {
			const cached = persistentCache.get<{ items: string[] }>(`skills_${lang}`);
			if (cached) {
				SkillsService.cache[lang] = cached;
				SkillsService.lastFetch[lang] = now;
				return cached;
			}
		}

		try {
			const data = await this.repository.getByLang(lang);

			if (!data) {
				const empty = { items: [] };
				SkillsService.cache[lang] = empty;
				SkillsService.lastFetch[lang] = now;
				return empty;
			}

			// Update caches
			SkillsService.cache[lang] = data;
			SkillsService.lastFetch[lang] = now;
			if (dev) persistentCache.set(`skills_${lang}`, data);

			return data;
		} catch (error: unknown) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				(error as { code: number }).code === 8
			) {
				console.error(`SkillsService: Quota exceeded while fetching skills for ${lang}`);
				return (
					persistentCache.get<{ items: string[] }>(`skills_${lang}`) ||
					SkillsService.cache[lang] || { items: [] }
				);
			}
			console.error('Error fetching skills:', error);
			throw error;
		}
	}

	async updateSkills(lang: 'en' | 'id', items: string[]) {
		try {
			const result = await this.repository.update(lang, { items, updatedAt: new Date() });

			// Invalidate caches
			delete SkillsService.cache[lang];
			delete SkillsService.lastFetch[lang];
			if (dev) persistentCache.clear(`skills_${lang}`);

			return result;
		} catch (error) {
			console.error('Error updating skills:', error);
			throw error;
		}
	}
}
export const skillsService = new SkillsService();
