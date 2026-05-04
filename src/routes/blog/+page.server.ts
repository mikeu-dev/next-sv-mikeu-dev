import type { PageServerLoad } from './$types';
import { blogService } from '$lib/server/services/blog.service';

export const prerender = false;

export const load: PageServerLoad = async ({ locals, url }) => {
	const locale = locals.paraglide.locale;
	const search = url.searchParams.get('q') || '';

	const { posts, nextCursor } = await blogService.getPublishedPostsByLocale(locale, {
		limit: 12,
		search: search || undefined
	});

	return { posts, search, nextCursor };
};
