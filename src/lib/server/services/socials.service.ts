import { SocialsRepository } from '../repositories/socials.repository';
import type { Socials } from '$lib/types';

export class SocialsService {
	private repository = new SocialsRepository();

	// In-Memory Cache
	private static cache: Socials | null = null;
	private static lastFetch: number = 0;
	private static CACHE_TTL = 3600000; // 1 jam dalam milidetik

	async getSocials(): Promise<Socials | null> {
		const now = Date.now();

		// Menggunakan cache jika masih valid
		if (SocialsService.cache && now - SocialsService.lastFetch < SocialsService.CACHE_TTL) {
			return SocialsService.cache;
		}

		try {
			const data = await this.repository.getDefault();

			// Simpan ke cache
			SocialsService.cache = data;
			SocialsService.lastFetch = now;

			return data;
		} catch (error) {
			console.error('Error fetching socials:', error);
			throw error;
		}
	}

	async updateSocials(data: Socials): Promise<Socials | null> {
		try {
			const result = await this.repository.update('default', data);

			// Reset cache setelah update
			SocialsService.cache = null;
			SocialsService.lastFetch = 0;

			return result;
		} catch (error) {
			console.error('Error updating socials:', error);
			throw error;
		}
	}
}
