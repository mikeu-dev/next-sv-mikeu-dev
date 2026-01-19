import { error } from '@sveltejs/kit';
import { getLocale } from '@/lib/paraglide/runtime';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/firebase/firebase.server';
import { COLLECTIONS } from '$lib/server/firebase/collections';

export interface BlogPageData {
	slug: string;
	locale: string;
	meta: Record<string, string>;
	content: string;
}

export const load: PageServerLoad = async (event) => {
	const { params, locals } = event;
	const locale = locals.paraglide.locale ?? getLocale();
	const slug = params.slug;

	try {
		// Find post by slug and locale
		// Since we migrated utilizing slug as ID, we might try to fetch by ID first if slug matches ID
		// But better to query by slug field to be sure.
		// Wait, migration: doc(slug).set(postData).
		// If "slug" is unique across ALL locales, then doc(slug) works.
		// But "hello-world" (en) and "halo-dunia" (id) have different slugs.
		// If "why-moved..." (en) and "kenapa-pindah..." (id) have different slugs, then they are different docs.
		// So query by slug field should work and be correct.

		const snapshot = await db
			.collection(COLLECTIONS.BLOG_POSTS)
			.where('slug', '==', slug)
			.where('locale', '==', locale)
			.limit(1)
			.get();

		if (snapshot.empty) {
			// Fallback: try finding by slug only (maybe user visited direct link without locale context or vice versa)
			// But strict locale is safer for now.
			throw error(404, `Artikel "${slug}" tidak ditemukan`);
		}

		const doc = snapshot.docs[0];
		const data = doc.data();

		if (!data.published) {
			throw error(404, `Artikel "${slug}" belum dipublikasikan`);
		}

		return {
			slug,
			locale,
			meta: {
				title: data.title,
				date: data.date,
				description: data.description
			},
			content: data.content || ''
		};
	} catch (err: any) {
		if (err.status === 404) throw err;
		console.error('Error fetching blog post:', err);
		throw error(500, 'Terjadi kesalahan saat memuat artikel');
	}
};
