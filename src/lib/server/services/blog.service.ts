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

	async getPublishedPostsByLocale(locale: string) {
		return this.repository.getPublishedByLocale(locale);
	}

	async createPost(data: BlogPost) {
		const id = `${data.slug}-${data.locale}`;
		// We use upsert to ensure document is created if it doesn't exist
		await this.repository.upsert(id, { ...data, updatedAt: new Date() } as Partial<BlogPost>);
		return { id, ...data };
	}

	async updatePost(id: string, data: Partial<BlogPost>) {
		return this.repository.update(id, { ...data, updatedAt: new Date() });
	}

	async deletePost(id: string) {
		await this.repository.delete(id);
		return true;
	}

	async getRelatedPosts(currentSlug: string, tags: string[], locale: string, limit = 3) {
		const allPosts = await this.getPublishedPostsByLocale(locale);
		return allPosts
			.filter((post) => post.slug !== currentSlug && post.tags?.some((tag) => tags.includes(tag)))
			.slice(0, limit);
	}
}

export const blogService = new BlogService();
