import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { JourneyService } from '$lib/server/services/journey.service';

const journeyService = new JourneyService();

export const PUT: RequestHandler = async ({ params, request }) => {
	const { lang } = params;

	if (lang !== 'en' && lang !== 'id') {
		return json({ error: 'Invalid language' }, { status: 400 });
	}

	try {
		const { items } = await request.json();

		// Validate data structure
		if (!Array.isArray(items)) {
			return json({ error: 'Invalid data structure' }, { status: 400 });
		}

		// Validate each item
		for (const item of items) {
			if (
				!item.year ||
				!item.title_id ||
				!item.title_en ||
				!item.description_id ||
				!item.description_en
			) {
				return json({ error: 'Invalid item structure' }, { status: 400 });
			}
		}

		// Update via Service
		await journeyService.updateJourney(lang as 'en' | 'id', items);

		return json({ success: true, message: 'Journey updated successfully' });
	} catch (error: unknown) {
		console.error('Update journey error:', error);
		const message = error instanceof Error ? error.message : 'Failed to update journey';
		return json({ error: message }, { status: 500 });
	}
};

export const prerender = false;
