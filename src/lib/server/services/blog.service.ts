
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
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
    },

    async getPostBySlug(slug: string) {
        const snapshot = await db.collection(COLLECTIONS.BLOG_POSTS).where('slug', '==', slug).get();
        if (snapshot.empty) return null;
        // Assuming slug is unique enough, but we might have multiple locales.
        // Ideally we fetch by ID if we know it.
        // If we use slug as ID (which migration script does), then:
        const doc = await db.collection(COLLECTIONS.BLOG_POSTS).doc(slug).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() } as BlogPost;
    },

    async getPostById(id: string) {
        const doc = await db.collection(COLLECTIONS.BLOG_POSTS).doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() } as BlogPost;
    },

    async createPost(data: BlogPost) {
        // We typically want slug to be the ID, effectively.
        // But if slug changes, we need to handle that.
        // For now, let's assume manual ID or slug-based ID.
        // Migration used slug as ID.
        const id = data.slug;
        await db.collection(COLLECTIONS.BLOG_POSTS).doc(id).set({
            ...data,
            updatedAt: new Date()
        });
        return { id, ...data };
    },

    async updatePost(id: string, data: Partial<BlogPost>) {
        await db.collection(COLLECTIONS.BLOG_POSTS).doc(id).update({
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
