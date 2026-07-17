import { BaseRepository } from '../core/base.repository';
import { COLLECTIONS } from '../firebase/collections';
import type { BlogPost } from '$lib/types';
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
		options: { limit?: number; lastDate?: string; search?: string; tag?: string } = {}
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

		// If a tag is specified, we fetch all posts matching search/locale,
		// and filter/paginate in-memory to prevent requiring composite indexes.
		const limitApplied = !options.tag && options.limit;
		if (options.lastDate && !options.tag) {
			query = query.startAfter(options.lastDate);
		}
		if (limitApplied) {
			query = query.limit(options.limit!);
		}

		const snapshot = await query.get();
		let posts = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
			...this.toPOJO(doc.data()),
			id: doc.id
		})) as BlogPost[];

		// Apply tag filter and pagination in memory if tag is requested
		if (options.tag) {
			posts = posts.filter((post) => post.tags?.includes(options.tag!));
			if (options.lastDate) {
				const startIndex = posts.findIndex((p) => p.date === options.lastDate);
				if (startIndex !== -1) {
					posts = posts.slice(startIndex + 1);
				}
			}
			if (options.limit) {
				posts = posts.slice(0, options.limit);
			}
		}

		const lastPost = posts[posts.length - 1];
		return {
			posts,
			nextCursor: lastPost ? lastPost.date : null
		};
	}

	async getByTitle(title: string): Promise<BlogPost | null> {
		const col = this.getCollection();
		if (!col) return null;
		const query = col.where('title', '==', title).limit(1);
		const snapshot = await query.get();
		if (snapshot.empty) return null;
		return { ...this.toPOJO(snapshot.docs[0].data()), id: snapshot.docs[0].id } as BlogPost;
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
