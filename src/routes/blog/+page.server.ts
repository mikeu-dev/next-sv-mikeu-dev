import type { PageServerLoad } from './$types';
import { blogService } from '$lib/server/services/blog.service';

export const load: PageServerLoad = async ({ locals }) => {
	const locale = locals.paraglide.locale;
	const posts = await blogService.getPublishedPostsByLocale(locale);

	return { posts };
};
