import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { blogService } from '$lib/server/services/blog.service';

export const GET: RequestHandler = async ({ url, locals }) => {
	const locale = locals.paraglide.locale;
	const limit = Number(url.searchParams.get('limit')) || 12;
	const lastDate = url.searchParams.get('lastDate') || undefined;
	const search = url.searchParams.get('q') || undefined;
	const tag = url.searchParams.get('tag') || undefined;

	try {
		const result = await blogService.getPublishedPostsByLocale(locale, {
			limit,
			lastDate,
			search,
			tag
		});

		return json(result);
	} catch (err) {
		console.error('Error in blog API:', err);
		return json({ posts: [], nextCursor: null }, { status: 500 });
	}
};
