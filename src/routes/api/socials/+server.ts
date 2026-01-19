import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { SocialsService } from '$lib/server/services/socials.service';
import { db } from '$lib/server/firebase/firebase.server';
import { COLLECTIONS } from '$lib/server/firebase/collections';
import { logError } from '$lib/server/utils/logger';
import { env } from '$lib/server/config/env';

const socialsService = new SocialsService();

export async function GET() {
	try {
		const data = await socialsService.getSocials();
		return json(data);
	} catch (error: any) {
		logError('API:Socials:GET', error);
		return json({ error: error.message }, { status: 500 });
	}
}

export const PUT: RequestHandler = async ({ request, locals }) => {
	// Auth check - only owner can update socials
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (locals.user.email !== env.OWNER_EMAIL) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	try {
		const { links } = await request.json();

		// Validate data structure
		if (!Array.isArray(links)) {
			return json({ error: 'Invalid data structure' }, { status: 400 });
		}

		// Validate each link
		for (const link of links) {
			if (!link.label || !link.href || !link.iconName || !link.color) {
				return json({ error: 'Invalid link structure' }, { status: 400 });
			}
		}

		// Update Firestore
		await db.collection(COLLECTIONS.SOCIALS).doc('default').set({
			links,
			updatedAt: new Date()
		});

		return json({ success: true, message: 'Socials updated successfully' });
	} catch (error: any) {
		logError('API:Socials:PUT', error);
		return json({ error: error.message || 'Failed to update socials' }, { status: 500 });
	}
};

// Disable prerendering for this endpoint
export const prerender = false;
