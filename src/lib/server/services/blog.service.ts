import { db } from '$lib/server/firebase/firebase.server';
import { COLLECTIONS } from '$lib/server/firebase/collections';

export interface BlogPost {
	id?: string;
	slug: string;
	locale: string;
	title: string;
	description: string;
	date: string;
	published: boolean;
	content: string;
	updatedAt?: any;
}

export const blogService = {
	async getAllPosts() {
		const snapshot = await db.collection(COLLECTIONS.BLOG_POSTS).get();
		return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as BlogPost);
	},

	async getPostBySlug(slug: string, locale?: string) {
		let query = db.collection(COLLECTIONS.BLOG_POSTS).where('slug', '==', slug);
		if (locale) {
			query = query.where('locale', '==', locale);
		}

		const snapshot = await query.get();
		if (snapshot.empty) return null;

		return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as BlogPost;
	},

	async getPostById(id: string) {
		const doc = await db.collection(COLLECTIONS.BLOG_POSTS).doc(id).get();
		if (!doc.exists) return null;
		return { id: doc.id, ...doc.data() } as BlogPost;
	},

	async createPost(data: BlogPost) {
		// Use slug-locale as ID to allow same slug for different languages
		const id = `${data.slug}-${data.locale}`;

		// Check if ID exists to avoid overwrite?
		// set() with merge:false overwrites.
		// For now, let's assume overwrite is intended or user checks existence.

		await db
			.collection(COLLECTIONS.BLOG_POSTS)
			.doc(id)
			.set({
				...data,
				updatedAt: new Date()
			});
		return { id, ...data };
	},

	async updatePost(id: string, data: Partial<BlogPost>) {
		// If slug or locale connects to ID, changing them might require ID change (migration).
		// But for simpler update, we assume ID is constant.
		// If user changes locale/slug in edit, it would technically be a "Move".
		// But for now, let's just update the doc.
		// WARNING: If ID is slug-locale, and we change slug, ID should change.
		// This is complex. Let's assume for now we just update the fields.
		// The ID remains the same, which might de-sync from slug-locale.
		// Ideally, we should delete old and create new if slug/locale changes.
		// But let's stick to update for now to avoid data loss risk on refactor.

		await db
			.collection(COLLECTIONS.BLOG_POSTS)
			.doc(id)
			.update({
				...data,
				updatedAt: new Date()
			});
		return { id, ...data };
	},

	async deletePost(id: string) {
		await db.collection(COLLECTIONS.BLOG_POSTS).doc(id).delete();
		return true;
	}
};
