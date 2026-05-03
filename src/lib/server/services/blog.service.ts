import { BlogRepository } from '../repositories/blog.repository';

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

	async getAllPosts() {
		return this.repository.findAll();
	}

	async getPostBySlug(slug: string, locale?: string) {
		return this.repository.getBySlugIndoEn(slug, locale);
	}

	async getPostById(id: string) {
		return this.repository.findById(id);
	}

	async getPublishedPostsByLocale(
		locale: string,
		options: { limit?: number; lastDate?: string; search?: string } = {}
	) {
		return this.repository.getPublishedByLocale(locale, options);
	}

	async createPost(data: BlogPost) {
		const id = `${data.slug}-${data.locale}`;
		const readingTime = this.calculateReadingTime(data.content);
		// We use upsert to ensure document is created if it doesn't exist
		await this.repository.upsert(id, {
			...data,
			readingTime,
			updatedAt: new Date()
		} as Partial<BlogPost>);
		return { id, ...data, readingTime };
	}

	async updatePost(id: string, data: Partial<BlogPost>) {
		const updateData: Partial<BlogPost> = { ...data, updatedAt: new Date() };
		if (data.content) {
			updateData.readingTime = this.calculateReadingTime(data.content);
		}
		return this.repository.update(id, updateData);
	}

	async deletePost(id: string) {
		await this.repository.delete(id);
		return true;
	}

	private calculateReadingTime(content: string): number {
		const wordsPerMinute = 200;
		const words = content.trim().split(/\s+/).length;
		return Math.ceil(words / wordsPerMinute);
	}

	async getRelatedPosts(currentSlug: string, tags: string[], locale: string, limit = 3) {
		// For related posts, we still fetch a reasonable amount to filter in memory
		// or we could optimize this later with a dedicated tag query
		const { posts: allPosts } = await this.getPublishedPostsByLocale(locale, { limit: 20 });

		// 1. Filter by tags first (same tags as current post)
		let related = allPosts.filter(
			(post) => post.slug !== currentSlug && post.tags?.some((tag) => tags.includes(tag))
		);

		// 2. If not enough related posts, add latest posts as fallback
		if (related.length < limit) {
			const latestFallback = allPosts
				.filter(
					(post) => post.slug !== currentSlug && !related.some((r) => r.slug === post.slug)
				)
				// allPosts is already sorted by date in repository
				.slice(0, limit - related.length);

			related = [...related, ...latestFallback];
		}

		return related.slice(0, limit);
	}
}

export const blogService = new BlogService();
