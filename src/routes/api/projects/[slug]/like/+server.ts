import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { projectReactionService } from '$lib/server/services/project-reaction.service';

export const POST: RequestHandler = async ({ params }) => {
	const { slug } = params;

	if (!slug) {
		return json({ error: 'Missing slug' }, { status: 400 });
	}

	try {
		const result = await projectReactionService.like(slug);
		return json(result);
	} catch (error) {
		console.error('Error liking project:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
