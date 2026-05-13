import { IconRepository } from '../repositories/icon.repository';
import type { DynamicIcon } from '$lib/types';
import { dev } from '$app/environment';
import { persistentCache } from '../utils/cache.util';

export class IconService {
	private repository = new IconRepository();

	// In-memory cache for icons
	private static cache: DynamicIcon[] | null = null;
	private static lastFetch: number = 0;
	private static CACHE_TTL = 3600000; // 1 hour

	async getCustomIcons(): Promise<DynamicIcon[]> {
		const now = Date.now();
		const cacheKey = 'custom_icons';

		if (IconService.cache && now - IconService.lastFetch < IconService.CACHE_TTL) {
			return IconService.cache;
		}

		if (dev) {
			const cached = persistentCache.get<DynamicIcon[]>(cacheKey);
			if (cached) {
				IconService.cache = cached;
				IconService.lastFetch = now;
				return cached;
			}
		}

		try {
			const icons = await this.repository.getAll();
			IconService.cache = icons;
			IconService.lastFetch = now;
			if (dev) persistentCache.set(cacheKey, icons);
			return icons;
		} catch (error: unknown) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				(error as { code: number }).code === 8
			) {
				console.error('IconService: Quota exceeded while fetching custom icons');
				return persistentCache.get<DynamicIcon[]>(cacheKey) || IconService.cache || [];
			}
			console.error('Error fetching custom icons:', error);
			return persistentCache.get<DynamicIcon[]>(cacheKey) || [];
		}
	}

	async addCustomIcon(icon: DynamicIcon) {
		const result = await this.repository.create(icon);
		// Invalidate caches
		IconService.cache = null;
		IconService.lastFetch = 0;
		if (dev) persistentCache.clear('custom_icons');
		return result;
	}

	async deleteCustomIcon(id: string) {
		const result = await this.repository.delete(id);
		// Invalidate caches
		IconService.cache = null;
		IconService.lastFetch = 0;
		if (dev) persistentCache.clear('custom_icons');
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

			// Invalidate caches
			IconService.cache = null;
			IconService.lastFetch = 0;
			if (dev) persistentCache.clear('custom_icons');
		} catch (error) {
			console.error(`Error reporting missing icon ${name}:`, error);
		}
	}
}
