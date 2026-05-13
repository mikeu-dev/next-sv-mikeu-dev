import { JourneyRepository } from '../repositories/journey.repository';
import type { JourneyItem } from '$lib/types';
import { dev } from '$app/environment';
import { persistentCache } from '../utils/cache.util';

export class JourneyService {
	private repository = new JourneyRepository();

	// In-memory cache
	private static cache: Record<string, unknown> = {};
	private static lastFetch: Record<string, number> = {};
	private readonly CACHE_TTL = 3600000; // 1 hour

	async getJourney(lang: 'en' | 'id' = 'en') {
		const now = Date.now();
		const cacheKey = `journey_${lang}`;

		if (
			JourneyService.cache[cacheKey] &&
			now - (JourneyService.lastFetch[cacheKey] || 0) < this.CACHE_TTL
		) {
			return JourneyService.cache[cacheKey] as { items: JourneyItem[] };
		}

		if (dev) {
			const cached = persistentCache.get<{ items: JourneyItem[] }>(cacheKey);
			if (cached) {
				JourneyService.cache[cacheKey] = cached;
				JourneyService.lastFetch[cacheKey] = now;
				return cached;
			}
		}

		try {
			const data = await this.repository.getByLang(lang);

			if (!data) {
				return { items: [] };
			}

			// Update caches
			JourneyService.cache[cacheKey] = data;
			JourneyService.lastFetch[cacheKey] = now;
			if (dev) persistentCache.set(cacheKey, data);

			return data;
		} catch (error: unknown) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				(error as { code: number }).code === 8
			) {
				console.error(`JourneyService: Quota exceeded while fetching journey for ${lang}`);
				return (
					persistentCache.get<{ items: JourneyItem[] }>(cacheKey) ||
					(JourneyService.cache[cacheKey] as { items: JourneyItem[] }) || { items: [] }
				);
			}
			console.error('Error fetching journey:', error);
			throw error;
		}
	}

	async updateJourney(lang: 'en' | 'id', items: JourneyItem[]) {
		try {
			const result = await this.repository.update(lang, { items, updatedAt: new Date() });

			// Invalidate caches
			delete JourneyService.cache[`journey_${lang}`];
			if (dev) persistentCache.clear(`journey_${lang}`);

			return result;
		} catch (error) {
			console.error('Error updating journey:', error);
			throw error;
		}
	}
}
