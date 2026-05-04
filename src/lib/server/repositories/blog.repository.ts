import { BaseRepository } from '../core/base.repository';
import { COLLECTIONS } from '../firebase/collections';
import type { BlogPost } from '../services/blog.service';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';

/**
 * Repository untuk menangani blog posts.
 * Menggunakan BaseRepository untuk mendapatkan fitur toPOJO otomatis.
 */
export class BlogRepository extends BaseRepository<BlogPost> {
	constructor() {
		super(COLLECTIONS.BLOG_POSTS);
	}

	async getPublishedByLocale(
		locale: string,
		options: { limit?: number; lastDate?: string; search?: string } = {}
	): Promise<{ posts: BlogPost[]; nextCursor: string | null }> {
		const col = this.getCollection();
		if (!col) return { posts: [], nextCursor: null };

		let query = col
			.where('locale', '==', locale)
			.where('published', '==', true)
			.orderBy('date', 'desc');

		// Handle Search (Simple title search)
		if (options.search) {
			query = query
				.where('title', '>=', options.search)
				.where('title', '<=', options.search + '\uf8ff');
		}

		if (options.lastDate) {
			query = query.startAfter(options.lastDate);
		}

		if (options.limit) {
			query = query.limit(options.limit);
		}

		const snapshot = await query.get();
		const posts = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
			...this.toPOJO(doc.data()),
			id: doc.id
		})) as BlogPost[];

		const lastPost = posts[posts.length - 1];
		return {
			posts,
			nextCursor: lastPost ? lastPost.date : null
		};
	}

	async getBySlugIndoEn(slug: string, locale?: string): Promise<BlogPost | null> {
		const col = this.getCollection();
		if (!col) return null;

		let query = col.where('slug', '==', slug);
		if (locale) {
			query = query.where('locale', '==', locale);
		}

		const snapshot = await query.get();
		if (snapshot.empty) return null;

		return {
			...this.toPOJO(snapshot.docs[0].data()),
			id: snapshot.docs[0].id
		} as BlogPost;
	}
}
