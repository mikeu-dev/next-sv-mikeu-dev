import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { reactionService } from '$lib/server/services/reaction.service';

export const POST: RequestHandler = async ({ params }) => {
	const { slug } = params;

	if (!slug) {
		return json({ error: 'Missing slug' }, { status: 400 });
	}

	try {
		const result = await reactionService.like(slug);
		return json(result);
	} catch (error) {
		console.error('Error liking blog post:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
