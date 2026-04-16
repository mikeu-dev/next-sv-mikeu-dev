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

	async reportMissingIcon(name: string) {
		if (!name) return;

		try {
			// Check if already in collection
			const existing = await this.repository.findById(name);
			if (existing) return;

			// Add as placeholder using name as ID
			await this.repository.upsert(name, {
				svg: '', // Empty SVG placeholder
				viewBox: '0 0 24 24'
			});

			// Reset cache
			IconService.cache = null;
			IconService.lastFetch = 0;
		} catch (error) {
			console.error(`Error reporting missing icon ${name}:`, error);
		}
	}
}
