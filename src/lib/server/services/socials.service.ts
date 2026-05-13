import { SocialsRepository } from '../repositories/socials.repository';
import type { Socials } from '$lib/types';
import { sanitizeForFirestore } from '../utils/firestore';
import { persistentCache } from '../utils/cache.util';

export class SocialsService {
	private repository = new SocialsRepository();
	private static CACHE_KEY = 'socials_default';
	private static CACHE_TTL = 3600000; // 1 hour

	async getSocials(): Promise<Socials | null> {
		return persistentCache.getWithFetch(
			SocialsService.CACHE_KEY,
			async () => {
				try {
					return await this.repository.getDefault();
				} catch (error: unknown) {
					if (
						error &&
						typeof error === 'object' &&
						'code' in error &&
						(error as { code: number }).code === 8
					) {
						console.error('SocialsService: Quota exceeded while fetching socials');
						return persistentCache.get<Socials>(SocialsService.CACHE_KEY);
					}
					console.error('Error fetching socials:', error);
					return persistentCache.get<Socials>(SocialsService.CACHE_KEY);
				}
			},
			SocialsService.CACHE_TTL
		);
	}

	async updateSocials(data: Socials): Promise<Socials | null> {
		try {
			const sanitizedData = sanitizeForFirestore(data);
			const result = await this.repository.upsert('default', {
				...sanitizedData,
				updatedAt: new Date()
			} as Partial<Socials>);

			// Invalidate cache
			persistentCache.clear(SocialsService.CACHE_KEY);

			return result;
		} catch (error) {
			console.error('Error updating socials:', error);
			throw error;
		}
	}
}
export const socialsService = new SocialsService();
