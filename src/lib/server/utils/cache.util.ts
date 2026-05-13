import fs from 'fs';
import path from 'path';
import { dev } from '$app/environment';

interface CacheItem<T> {
	data: T;
	expiry: number;
}

const CACHE_DIR = path.join(process.cwd(), '.cache');
const memoryCache = new Map<string, CacheItem<unknown>>();

if (dev && !fs.existsSync(CACHE_DIR)) {
	try {
		fs.mkdirSync(CACHE_DIR, { recursive: true });
	} catch (err) {
		console.warn('Failed to create cache directory:', err);
	}
}

/**
 * Tiered Cache Utility
 * Tier 1: In-Memory (Fastest, transient)
 * Tier 2: File System (Persistent in dev mode)
 */
export const persistentCache = {
	/**
	 * Get data from cache. Checks memory first, then file system.
	 */
	get<T>(key: string): T | null {
		const now = Date.now();

		// Tier 1: Memory
		const memItem = memoryCache.get(key) as CacheItem<T> | undefined;
		if (memItem) {
			if (memItem.expiry > now) {
				return memItem.data;
			}
			memoryCache.delete(key);
		}

		// Tier 2: File (only in dev)
		if (dev) {
			const filePath = path.join(CACHE_DIR, `${key}.json`);
			if (fs.existsSync(filePath)) {
				try {
					const content = fs.readFileSync(filePath, 'utf-8');
					const item = JSON.parse(content) as CacheItem<T>;
					if (item.expiry > now) {
						// Hydrate memory cache
						memoryCache.set(key, item);
						return item.data;
					}
					fs.unlinkSync(filePath);
				} catch {
					return null;
				}
			}
		}

		return null;
	},

	/**
	 * Set data to cache with a TTL (default 30 mins).
	 */
	set<T>(key: string, data: T, ttlMs: number = 30 * 60 * 1000): void {
		const expiry = Date.now() + ttlMs;
		const item: CacheItem<T> = { data, expiry };

		// Tier 1: Memory
		memoryCache.set(key, item as CacheItem<unknown>);

		// Tier 2: File (only in dev)
		if (dev) {
			const filePath = path.join(CACHE_DIR, `${key}.json`);
			try {
				fs.writeFileSync(filePath, JSON.stringify(item, null, 2), 'utf-8');
			} catch (error) {
				console.error(`Failed to write persistent cache for ${key}:`, error);
			}
		}
	},

	/**
	 * Atomic fetch: gets from cache or fetches and sets.
	 */
	async getWithFetch<T>(key: string, fetcher: () => Promise<T>, ttlMs?: number): Promise<T> {
		const cached = this.get<T>(key);
		if (cached !== null) return cached;

		const data = await fetcher();
		this.set(key, data, ttlMs);
		return data;
	},

	/**
	 * Clear cache for a specific key or all.
	 */
	clear(key?: string): void {
		if (key) {
			memoryCache.delete(key);
			if (dev) {
				const filePath = path.join(CACHE_DIR, `${key}.json`);
				if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
			}
		} else {
			memoryCache.clear();
			if (dev && fs.existsSync(CACHE_DIR)) {
				fs.readdirSync(CACHE_DIR).forEach((file) => {
					fs.unlinkSync(path.join(CACHE_DIR, file));
				});
			}
		}
	}
};
