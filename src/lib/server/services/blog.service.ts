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
		// We use set() in repository for specific ID if needed, 
		// but BaseRepository.create uses add(). 
		// We can add a saveWithId to BaseRepository or just use db here.
		// For consistency with existing logic:
		await this.repository.update(id, { ...data, updatedAt: new Date() } as Partial<BlogPost>);
		return { id, ...data };
	}

	async updatePost(id: string, data: Partial<BlogPost>) {
		return this.repository.update(id, { ...data, updatedAt: new Date() });
	}

	async deletePost(id: string) {
		await this.repository.delete(id);
		return true;
	}
}

export const blogService = new BlogService();
