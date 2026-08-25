import type { RequestHandler } from '@sveltejs/kit';
import { TechStackService } from '#lib/server/services/techstack.service.js';

const techStackService = new TechStackService();

export const PUT: RequestHandler = async ({ params, request }) => {
	const { lang } = params;

	if (lang !== 'en' && lang !== 'id') {
		return Response.json({ error: 'Invalid language' }, { status: 400 });
	}

	try {
		const { categories } = await request.json();

		// Validate data structure
		if (!Array.isArray(categories)) {
			return Response.json({ error: 'Invalid data structure' }, { status: 400 });
		}

		// Validate each category
		for (const category of categories) {
			if (!category.category || !category.description || !Array.isArray(category.items)) {
				return Response.json({ error: 'Invalid category structure' }, { status: 400 });
			}

			// Validate each item
			for (const item of category.items) {
				if (!item.name || !item.iconName || !item.color || !item.url) {
					return Response.json({ error: 'Invalid item structure' }, { status: 400 });
				}
			}
		}

		// Update via Service
		await techStackService.updateTechStack(lang as 'en' | 'id', { categories });

		return Response.json({ success: true, message: 'Techstack updated successfully' });
	} catch (error: unknown) {
		console.error('Update techstack error:', error);
		const message = error instanceof Error ? error.message : 'Failed to update techstack';
		return Response.json({ error: message }, { status: 500 });
	}
};

export const prerender = false;
