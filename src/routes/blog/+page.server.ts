import type { PageServerLoad } from './$types';
import { blogService } from '$lib/server/services/blog.service';

export const prerender = false;

export const load: PageServerLoad = async ({ locals, url, setHeaders }) => {
	const locale = locals.paraglide.locale;
	const search = url.searchParams.get('q') || '';

	// Set short CDN cache to protect Firebase Free Tier, disable when logged in
	setHeaders({
		'cache-control': locals.user
			? 'private, no-store'
			: 'public, s-maxage=10, stale-while-revalidate=30'
	});

	const { posts, nextCursor } = await blogService.getPublishedPostsByLocale(locale, {
		limit: 12,
		search: search || undefined
	});

	return { posts, search, nextCursor };
};
