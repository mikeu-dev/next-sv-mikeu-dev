import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/firebase/firebase.server';
import { COLLECTIONS } from '$lib/server/firebase/collections';

export const PUT: RequestHandler = async ({ params, request }) => {
	const { lang } = params;

	if (lang !== 'en' && lang !== 'id') {
		return json({ error: 'Invalid language' }, { status: 400 });
	}

	try {
		const { categories } = await request.json();

		// Validate data structure
		if (!Array.isArray(categories)) {
			return json({ error: 'Invalid data structure' }, { status: 400 });
		}

		// Validate each category
		for (const category of categories) {
			if (!category.category || !category.description || !Array.isArray(category.items)) {
				return json({ error: 'Invalid category structure' }, { status: 400 });
			}

			// Validate each item
			for (const item of category.items) {
				if (!item.name || !item.iconName || !item.color || !item.url) {
					return json({ error: 'Invalid item structure' }, { status: 400 });
				}
			}
		}

		// Update Firestore
		await db.collection(COLLECTIONS.TECHSTACK).doc(lang).set({
			categories,
			updatedAt: new Date()
		});

		return json({ success: true, message: 'Techstack updated successfully' });
	} catch (error: unknown) {
		console.error('Update techstack error:', error);
		const message = error instanceof Error ? error.message : 'Failed to update techstack';
		return json({ error: message }, { status: 500 });
	}
};

// Disable prerendering for this endpoint
export const prerender = false;
