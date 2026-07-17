import type { PageServerLoad } from './$types';
import { blogService } from '$lib/server/services/blog.service';

export const prerender = false;

export const load: PageServerLoad = async ({ locals, url, setHeaders }) => {
	const locale = locals.paraglide.locale;
	const search = url.searchParams.get('q') || '';
	const tag = url.searchParams.get('tag') || '';

	// Set short CDN cache to protect Firebase Free Tier, disable when logged in
	setHeaders({
		'cache-control': locals.user
			? 'private, no-store'
			: 'public, s-maxage=10, stale-while-revalidate=30'
	});

	const [postsResult, allPostsForTags] = await Promise.all([
		blogService.getPublishedPostsByLocale(locale, {
			limit: 12,
			search: search || undefined,
			tag: tag || undefined
		}),
		blogService.getAllPosts().catch(() => [])
	]);

	const allTags = Array.from(
		new Set(
			allPostsForTags.filter((p) => p.published && p.locale === locale).flatMap((p) => p.tags || [])
		)
	);

	return {
		posts: postsResult.posts,
		tags: allTags,
		tag,
		search,
		nextCursor: postsResult.nextCursor
	};
};
