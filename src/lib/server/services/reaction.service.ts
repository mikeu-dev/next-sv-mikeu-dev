import { ReactionRepository, type BlogReaction } from '../repositories/reaction.repository';
import { dev } from '$app/environment';
import { persistentCache } from '../utils/cache.util';

export class ReactionService {
	private repository = new ReactionRepository();

	// In-memory cache
	private static cache: Record<string, BlogReaction> = {};
	private static lastFetch: Record<string, number> = {};
	private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

	async getReactions(slug: string): Promise<BlogReaction | null> {
		const now = Date.now();
		const cacheKey = `reaction_${slug}`;

		if (ReactionService.cache[slug] && now - (ReactionService.lastFetch[slug] || 0) < this.CACHE_TTL) {
			return ReactionService.cache[slug];
		}

		if (dev) {
			const cached = persistentCache.get<BlogReaction>(cacheKey);
			if (cached) {
				ReactionService.cache[slug] = cached;
				ReactionService.lastFetch[slug] = now;
				return cached;
			}
		}

		try {
			const data = await this.repository.findById(slug);
			if (data) {
				ReactionService.cache[slug] = data;
				ReactionService.lastFetch[slug] = now;
				if (dev) persistentCache.set(cacheKey, data);
			}
			return data;
		} catch (error: unknown) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				(error as { code: number }).code === 8
			) {
				console.error(`ReactionService: Quota exceeded for ${slug}`);
				return persistentCache.get<BlogReaction>(cacheKey) || ReactionService.cache[slug] || null;
			}
			console.error('Error fetching reactions:', error);
			return persistentCache.get<BlogReaction>(cacheKey) || null;
		}
	}

	async like(slug: string) {
		try {
			await this.repository.incrementLikes(slug);
			
			// Invalidate caches
			delete ReactionService.cache[slug];
			if (dev) persistentCache.clear(`reaction_${slug}`);
			
			return this.getReactions(slug);
		} catch (error) {
			console.error('Error liking post:', error);
			return this.getReactions(slug);
		}
	}

	async trackView(slug: string) {
		try {
			await this.repository.incrementViews(slug);
			
			// Invalidate caches
			delete ReactionService.cache[slug];
			if (dev) persistentCache.clear(`reaction_${slug}`);
			
			return this.getReactions(slug);
		} catch (error) {
			console.error('Error tracking view:', error);
			return this.getReactions(slug);
		}
	}
}

export const reactionService = new ReactionService();
