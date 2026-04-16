import { IconRepository } from '../repositories/icon.repository';
import type { DynamicIcon } from '$lib/types';

export class IconService {
	private repository = new IconRepository();

	// In-memory cache for icons
	private static cache: DynamicIcon[] | null = null;
	private static lastFetch: number = 0;
	private static CACHE_TTL = 3600000; // 1 hour

	async getCustomIcons(): Promise<DynamicIcon[]> {
		const now = Date.now();

		if (IconService.cache && now - IconService.lastFetch < IconService.CACHE_TTL) {
			return IconService.cache;
		}

		try {
			const icons = await this.repository.getAll();
			IconService.cache = icons;
			IconService.lastFetch = now;
			return icons;
		} catch (error) {
			console.error('Error fetching custom icons:', error);
			throw error;
		}
	}

	async addCustomIcon(icon: DynamicIcon) {
		const result = await this.repository.create(icon);
		// Reset cache
		IconService.cache = null;
		IconService.lastFetch = 0;
		return result;
	}

	async deleteCustomIcon(id: string) {
		const result = await this.repository.delete(id);
		// Reset cache
		IconService.cache = null;
		IconService.lastFetch = 0;
		return result;
	}
}
