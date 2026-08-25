import type { RequestHandler } from './$types';
import { projectReactionService } from '#lib/server/services/project-reaction.service.js';

export const POST: RequestHandler = async ({ params }) => {
	const { slug } = params;

	if (!slug) {
		return Response.json({ error: 'Missing slug' }, { status: 400 });
	}

	try {
		const result = await projectReactionService.like(slug);
		return Response.json(result);
	} catch (error) {
		console.error('Error liking project:', error);
		return Response.json({ error: 'Internal server error' }, { status: 500 });
	}
};
