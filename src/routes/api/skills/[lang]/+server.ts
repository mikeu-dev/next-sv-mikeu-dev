import type { RequestHandler } from '@sveltejs/kit';
import { SkillsService } from '#lib/server/services/skills.service.js';

const skillsService = new SkillsService();

export const PUT: RequestHandler = async ({ params, request }) => {
	const { lang } = params;

	if (lang !== 'en' && lang !== 'id') {
		return Response.json({ error: 'Invalid language' }, { status: 400 });
	}

	try {
		const { items } = await request.json();

		// Validate data structure
		if (!Array.isArray(items)) {
			return Response.json({ error: 'Invalid data structure' }, { status: 400 });
		}

		// Validate each item is a string
		for (const item of items) {
			if (typeof item !== 'string' || item.trim() === '') {
				return Response.json({ error: 'Invalid skill item' }, { status: 400 });
			}
		}

		// Update via Service
		await skillsService.updateSkills(lang as 'en' | 'id', items);

		return Response.json({ success: true, message: 'Skills updated successfully' });
	} catch (error: unknown) {
		console.error('Update skills error:', error);
		const message = error instanceof Error ? error.message : 'Failed to update skills';
		return Response.json({ error: message }, { status: 500 });
	}
};

// Disable prerendering for this endpoint
export const prerender = false;
