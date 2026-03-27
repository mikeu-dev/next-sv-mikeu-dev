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

	async getPublishedByLocale(locale: string): Promise<BlogPost[]> {
		const snapshot = await this.getCollection()
			.where('locale', '==', locale)
			.where('published', '==', true)
			.orderBy('date', 'desc')
			.get();

		return snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
			...this.toPOJO(doc.data()),
			id: doc.id
		})) as BlogPost[];
	}

	async getBySlugIndoEn(slug: string, locale?: string): Promise<BlogPost | null> {
		let query = this.getCollection().where('slug', '==', slug);
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
