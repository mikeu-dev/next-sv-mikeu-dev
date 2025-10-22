import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const post = await import(`../../../lib/posts/${params.slug}.md`);
		const { title, description, date } = post.metadata;
		const content = post.default;

		return {
			content,
			title,
			description,
			date
		};
	} catch (e) {
		error(404, `Could not find ${params.slug}`);
	}
};
