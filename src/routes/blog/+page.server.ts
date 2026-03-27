import { getLocale } from '@/lib/paraglide/runtime';
import type { PageServerLoad, RouteParams } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';
import { blogService } from '$lib/server/services/blog.service';

export const load: PageServerLoad = async (event) => {
	const localsLocale = (event as ServerLoadEvent<RouteParams>).locals?.paraglide?.locale;

	const locale = localsLocale ?? getLocale();
	const posts = await blogService.getPublishedPostsByLocale(locale);

	return { posts };
};
