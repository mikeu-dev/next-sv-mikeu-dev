import { BlogRepository } from '../repositories/blog.repository';
import { dev } from '$app/environment';
import { persistentCache } from '../utils/cache.util';

export interface BlogPost {
	id?: string;
	slug: string;
	locale: string;
	title: string;
	description: string;
	date: string;
	published: boolean;
	content: string;
	thumbnailUrl?: string;
	tags?: string[];
	readingTime?: number;
	updatedAt?: Date;
}

export class BlogService {
	private repository = new BlogRepository();

	// In-memory cache
	private static cache: Record<string, any> = {};
	private static lastFetch: Record<string, number> = {};
	private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

	async getAllPosts() {
		const now = Date.now();
		const cacheKey = 'all_posts';

		if (
			BlogService.cache[cacheKey] &&
			now - (BlogService.lastFetch[cacheKey] || 0) < this.CACHE_TTL
		) {
			return BlogService.cache[cacheKey];
		}

		if (dev) {
			const cached = persistentCache.get<any[]>(cacheKey);
			if (cached) {
				BlogService.cache[cacheKey] = cached;
				BlogService.lastFetch[cacheKey] = now;
				return cached;
			}
		}

		try {
			const posts = await this.repository.findAll();
			BlogService.cache[cacheKey] = posts;
			BlogService.lastFetch[cacheKey] = now;
			if (dev) persistentCache.set(cacheKey, posts);
			return posts;
		} catch (error: unknown) {
			console.error('BlogService: Failed to get all posts', error);
			return persistentCache.get<any[]>(cacheKey) || [];
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

		// Simple caching for the main list
		if (
			!options.search &&
			!options.lastDate &&
			BlogService.cache[cacheKey] &&
			now - (BlogService.lastFetch[cacheKey] || 0) < this.CACHE_TTL
		) {
			return BlogService.cache[cacheKey];
		}

		try {
			const result = await this.repository.getPublishedByLocale(locale, options);

			if (!options.search && !options.lastDate) {
				BlogService.cache[cacheKey] = result;
				BlogService.lastFetch[cacheKey] = now;
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
				return persistentCache.get<any>(cacheKey) || { posts: [], total: 0 };
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
		BlogService.cache = {};
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
		BlogService.cache = {};
		if (dev) persistentCache.clear();

		return result;
	}

	async deletePost(id: string) {
		await this.repository.delete(id);
		// Invalidate caches
		BlogService.cache = {};
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
			(post) => post.slug !== currentSlug && post.tags?.some((tag) => tags.includes(tag))
		);

		if (related.length < limit) {
			const latestFallback = allPosts
				.filter((post) => post.slug !== currentSlug && !related.some((r) => r.slug === post.slug))
				.slice(0, limit - related.length);

			related = [...related, ...latestFallback];
		}

		return related.slice(0, limit);
	}
}

export const blogService = new BlogService();
