import { getLocale } from '@/lib/paraglide/runtime';
import type { PageServerLoad, RouteParams } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { db } from '$lib/server/firebase/firebase.server';
import { COLLECTIONS } from '$lib/server/firebase/collections';

export interface Post {
	slug: string;
	title: string;
	description?: string;
	date: string;
	published: boolean;
	locale: string;
}

async function getPosts(locale: string): Promise<Post[]> {
	try {
		// Fetch posts from Firestore filtering by locale
		// If we want to support fallback or all posts if not found, we would need more logic.
		// For now, strict locale match.

		const snapshot = await db
			.collection(COLLECTIONS.BLOG_POSTS)
			.where('locale', '==', locale)
			.where('published', '==', true)
			.get();

		const posts: Post[] = snapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				slug: data.slug,
				title: data.title,
				description: data.description,
				date: data.date,
				published: data.published,
				locale: data.locale
			} as Post;
		});

		return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	} catch (error) {
		console.error('Error fetching blog posts:', error);
		return [];
	}
}

export const load: PageServerLoad = async (event) => {
	const localsLocale = (event as ServerLoadEvent<RouteParams>).locals?.paraglide?.locale;

	const locale = localsLocale ?? getLocale();
	const posts = await getPosts(locale);

	return { posts };
};
