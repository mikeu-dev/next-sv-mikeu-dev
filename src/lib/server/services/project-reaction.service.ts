import {
	ProjectReactionRepository,
	type ProjectReaction
} from '../repositories/project-reaction.repository';
import { dev } from '$app/environment';
import { persistentCache } from '../utils/cache.util';

export class ProjectReactionService {
	private repository = new ProjectReactionRepository();

	// In-memory cache
	private static cache: Record<string, ProjectReaction> = {};
	private static lastFetch: Record<string, number> = {};
	private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

	async getReactions(slug: string): Promise<ProjectReaction | null> {
		const now = Date.now();
		const cacheKey = `project_reaction_${slug}`;

		if (
			ProjectReactionService.cache[slug] &&
			now - (ProjectReactionService.lastFetch[slug] || 0) < this.CACHE_TTL
		) {
			return ProjectReactionService.cache[slug];
		}

		if (dev) {
			const cached = persistentCache.get<ProjectReaction>(cacheKey);
			if (cached) {
				ProjectReactionService.cache[slug] = cached;
				ProjectReactionService.lastFetch[slug] = now;
				return cached;
			}
		}

		try {
			const data = await this.repository.findById(slug);
			if (data) {
				ProjectReactionService.cache[slug] = data;
				ProjectReactionService.lastFetch[slug] = now;
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
				console.error(`ProjectReactionService: Quota exceeded for ${slug}`);
				return (
					persistentCache.get<ProjectReaction>(cacheKey) ||
					ProjectReactionService.cache[slug] ||
					null
				);
			}
			console.error('Error fetching project reactions:', error);
			return persistentCache.get<ProjectReaction>(cacheKey) || null;
		}
	}

	async like(slug: string) {
		try {
			await this.repository.incrementLikes(slug);

			// Invalidate caches
			delete ProjectReactionService.cache[slug];
			if (dev) persistentCache.clear(`project_reaction_${slug}`);

			return this.getReactions(slug);
		} catch (error) {
			console.error('Error liking project:', error);
			return this.getReactions(slug);
		}
	}

	async trackView(slug: string) {
		try {
			await this.repository.incrementViews(slug);

			// Invalidate caches
			delete ProjectReactionService.cache[slug];
			if (dev) persistentCache.clear(`project_reaction_${slug}`);

			return this.getReactions(slug);
		} catch (error) {
			console.error('Error tracking project view:', error);
			return this.getReactions(slug);
		}
	}
}

export const projectReactionService = new ProjectReactionService();
