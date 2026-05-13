import { SocialsRepository } from '../repositories/socials.repository';
import type { Socials } from '$lib/types';
import { sanitizeForFirestore } from '../utils/firestore';
import { dev } from '$app/environment';
import { persistentCache } from '../utils/cache.util';

export class SocialsService {
	private repository = new SocialsRepository();

	// In-Memory Cache
	private static cache: Socials | null = null;
	private static lastFetch: number = 0;
	private static CACHE_TTL = 3600000; // 1 hour

	async getSocials(): Promise<Socials | null> {
		const now = Date.now();
		const cacheKey = 'socials_default';

		// 1. Memory Cache
		if (SocialsService.cache && now - SocialsService.lastFetch < SocialsService.CACHE_TTL) {
			return SocialsService.cache;
		}

		// 2. Persistent File Cache (Dev only)
		if (dev) {
			const cached = persistentCache.get<Socials>(cacheKey);
			if (cached) {
				console.log('ðŸ“‚ SocialsService: File Cache Hit');
				SocialsService.cache = cached;
				SocialsService.lastFetch = now;
				return cached;
			}
		}

		try {
			const data = await this.repository.getDefault();

			// Update caches
			SocialsService.cache = data;
			SocialsService.lastFetch = now;
			if (dev && data) persistentCache.set(cacheKey, data);

			return data;
		} catch (error: unknown) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				(error as { code: number }).code === 8
			) {
				console.error('SocialsService: Quota exceeded while fetching socials');
				return persistentCache.get<Socials>(cacheKey) || SocialsService.cache;
			}
			console.error('Error fetching socials:', error);
			return persistentCache.get<Socials>(cacheKey) || null;
		}
	}

	async updateSocials(data: Socials): Promise<Socials | null> {
		try {
			const sanitizedData = sanitizeForFirestore(data);
			const result = await this.repository.upsert('default', {
				...sanitizedData,
				updatedAt: new Date()
			} as Partial<Socials>);

			// Invalidate caches
			SocialsService.cache = null;
			SocialsService.lastFetch = 0;
			if (dev) persistentCache.clear('socials_default');

			return result;
		} catch (error) {
			console.error('Error updating socials:', error);
			throw error;
		}
	}
}
export const socialsService = new SocialsService();
