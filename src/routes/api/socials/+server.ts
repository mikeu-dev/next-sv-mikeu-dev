import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { SocialsService } from '$lib/server/services/socials.service';
import { logError } from '$lib/server/utils/logger';
import { env } from '$lib/server/config/env';

const socialsService = new SocialsService();

export async function GET() {
	try {
		const data = await socialsService.getSocials();
		return json(data);
	} catch (error: unknown) {
		logError('API:Socials:GET', error);
		const message = error instanceof Error ? error.message : 'Unknown error';
		return json({ error: message }, { status: 500 });
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
		const body = await request.json();
		const { links } = body;

		// console.log('DEBUG: Received links payload:', JSON.stringify(links, null, 2));

		// Validate data structure
		if (!Array.isArray(links)) {
			console.error('API:Socials:PUT - Invalid structure, not an array');
			return json({ error: 'Invalid data structure' }, { status: 400 });
		}

		// Validate and Sanitize each link
		const sanitizedLinks = links.map((link, index) => {
			const sanitized = { ...link };

			// Auto-fix missing fields with defaults instead of failing
			if (!sanitized.iconName) {
				console.warn(`API:Socials:PUT - Auto-fixing missing iconName at index ${index}`);
				sanitized.iconName = sanitized.label?.toLowerCase().includes('email')
					? 'SiMaildotru'
					: 'SiGoogle';
			}
			if (!sanitized.color) {
				console.warn(`API:Socials:PUT - Auto-fixing missing color at index ${index}`);
				sanitized.color = '#000000';
			}
			if (!sanitized.label) sanitized.label = 'Untitled';
			if (!sanitized.href) sanitized.href = '#';

			return sanitized;
		});

		// Update via Service with sanitized data
		await socialsService.updateSocials({ links: sanitizedLinks });

		return json({ success: true, message: 'Socials updated successfully' });
	} catch (error: unknown) {
		logError('API:Socials:PUT', error);
		const message = error instanceof Error ? error.message : 'Failed to update socials';
		return json({ error: message }, { status: 500 });
	}
};

// Disable prerendering for this endpoint
export const prerender = false;
