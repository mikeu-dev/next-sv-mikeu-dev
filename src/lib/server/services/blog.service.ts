import { BlogRepository } from '../repositories/blog.repository';
import { dev } from '$app/environment';
import { persistentCache } from '../utils/cache.util';
import type { BlogPost } from '$lib/types';
export type { BlogPost };

// Shared global cache to avoid SvelteKit/Vite module reload duplicates in development
const GLOBAL_CACHE_KEY = Symbol.for('mikeudev.blog.cache');
const GLOBAL_LAST_FETCH_KEY = Symbol.for('mikeudev.blog.lastFetch');

if (!(GLOBAL_CACHE_KEY in globalThis)) {
	(globalThis as Record<symbol, unknown>)[GLOBAL_CACHE_KEY] = {};
}
if (!(GLOBAL_LAST_FETCH_KEY in globalThis)) {
	(globalThis as Record<symbol, unknown>)[GLOBAL_LAST_FETCH_KEY] = {};
}

const getMemoryCache = (): Record<string, unknown> =>
	(globalThis as Record<symbol, Record<string, unknown>>)[GLOBAL_CACHE_KEY];
const getLastFetchCache = (): Record<string, number> =>
	(globalThis as Record<symbol, Record<string, number>>)[GLOBAL_LAST_FETCH_KEY];
const clearMemoryCache = () => {
	const cache = getMemoryCache();
	const lastFetch = getLastFetchCache();
	for (const key in cache) delete cache[key];
	for (const key in lastFetch) delete lastFetch[key];
};

export class BlogService {
	private repository = new BlogRepository();
	// Short-lived: this cache is per-process (globalThis), so on Vercel it never
	// sees invalidation from admin mutations handled by a different function
	// instance. Keeping the TTL short bounds worst-case staleness after a
	// create/update/delete; the CDN cache-control header on guest routes is
	// what actually protects the Firestore free tier.
	private readonly CACHE_TTL = 60 * 1000; // 60 seconds

	async getAllPosts() {
		const now = Date.now();
		const cacheKey = 'all_posts';
		const cache = getMemoryCache();
		const lastFetch = getLastFetchCache();

		if (cache[cacheKey] && now - (lastFetch[cacheKey] || 0) < this.CACHE_TTL) {
			return cache[cacheKey] as BlogPost[];
		}

		if (dev) {
			const cached = persistentCache.get<BlogPost[]>(cacheKey);
			if (cached) {
				cache[cacheKey] = cached;
				lastFetch[cacheKey] = now;
				return cached;
			}
		}

		try {
			const posts = await this.repository.findAll();
			cache[cacheKey] = posts;
			lastFetch[cacheKey] = now;
			if (dev) persistentCache.set(cacheKey, posts);
			return posts;
		} catch (error: unknown) {
			console.error('BlogService: Failed to get all posts', error);
			return persistentCache.get<BlogPost[]>(cacheKey) || [];
		}
	}

	async getPostByTitle(title: string) {
		try {
			return await this.repository.getByTitle(title);
		} catch (_error) {
			console.error('BlogService: Quota exceeded while fetching post by title');
			return null;
		}
	}

	async getPostBySlug(slug: string, locale?: string) {
		try {
			return await this.repository.getBySlugIndoEn(slug, locale);
		} catch (error: unknown) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				(error as { code: number }).code === 8
			) {
				console.error('BlogService: Quota exceeded while fetching post by slug');
				return null;
			}
			throw error;
		}
	}

	async getPostById(id: string) {
		return this.repository.findById(id);
	}

	async getPublishedPostsByLocale(
		locale: string,
		options: { limit?: number; lastDate?: string; search?: string } = {}
	) {
		const now = Date.now();
		const cacheKey = `posts_${locale}_${options.limit || 'all'}`;
		const cache = getMemoryCache();
		const lastFetch = getLastFetchCache();

		// Simple caching for the main list
		if (
			!options.search &&
			!options.lastDate &&
			cache[cacheKey] &&
			now - (lastFetch[cacheKey] || 0) < this.CACHE_TTL
		) {
			return cache[cacheKey] as { posts: BlogPost[]; nextCursor: string | null };
		}

		try {
			const result = await this.repository.getPublishedByLocale(locale, options);

			if (!options.search && !options.lastDate) {
				cache[cacheKey] = result;
				lastFetch[cacheKey] = now;
				if (dev) persistentCache.set(cacheKey, result);
			}

			return result;
		} catch (error: unknown) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				(error as { code: number }).code === 8
			) {
				console.error(`BlogService: Quota exceeded while fetching posts for ${locale}`);
				return (
					persistentCache.get<{ posts: BlogPost[]; nextCursor: string | null }>(cacheKey) || {
						posts: [],
						nextCursor: null
					}
				);
			}
			throw error;
		}
	}

	async createPost(data: BlogPost) {
		const id = `${data.slug}-${data.locale}`;
		const readingTime = this.calculateReadingTime(data.content);
		await this.repository.upsert(id, {
			...data,
			readingTime,
			updatedAt: new Date()
		} as Partial<BlogPost>);

		// Invalidate caches
		clearMemoryCache();
		if (dev) persistentCache.clear();

		return { id, ...data, readingTime };
	}

	async updatePost(id: string, data: Partial<BlogPost>) {
		const updateData: Partial<BlogPost> = { ...data, updatedAt: new Date() };
		if (data.content) {
			updateData.readingTime = this.calculateReadingTime(data.content);
		}
		const result = await this.repository.update(id, updateData);

		// Invalidate caches
		clearMemoryCache();
		if (dev) persistentCache.clear();

		return result;
	}

	async deletePost(id: string) {
		await this.repository.delete(id);
		// Invalidate caches
		clearMemoryCache();
		if (dev) persistentCache.clear();
		return true;
	}

	private calculateReadingTime(content: string): number {
		const wordsPerMinute = 200;
		const words = content.trim().split(/\s+/).length;
		return Math.ceil(words / wordsPerMinute);
	}

	async getRelatedPosts(currentSlug: string, tags: string[], locale: string, limit = 3) {
		const { posts: allPosts } = await this.getPublishedPostsByLocale(locale, { limit: 20 });

		let related = allPosts.filter(
			(post: BlogPost) =>
				post.slug !== currentSlug && post.tags?.some((tag: string) => tags.includes(tag))
		);

		if (related.length < limit) {
			const latestFallback = allPosts
				.filter(
					(post: BlogPost) =>
						post.slug !== currentSlug && !related.some((r: BlogPost) => r.slug === post.slug)
				)
				.slice(0, limit - related.length);

			related = [...related, ...latestFallback];
		}

		return related.slice(0, limit);
	}
}

export const blogService = new BlogService();
