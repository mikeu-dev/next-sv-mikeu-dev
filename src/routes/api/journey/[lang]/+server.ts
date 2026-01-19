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

		// Update Firestore
		await db.collection(COLLECTIONS.JOURNEY).doc(lang).set({
			items,
			updatedAt: new Date()
		});

		return json({ success: true, message: 'Journey updated successfully' });
	} catch (error: any) {
		console.error('Update journey error:', error);
		return json({ error: error.message || 'Failed to update journey' }, { status: 500 });
	}
};

// Disable prerendering for this endpoint
export const prerender = false;
