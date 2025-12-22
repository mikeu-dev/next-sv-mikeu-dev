export const prerender = false;

import { json } from '@sveltejs/kit';
import { ContactsService } from '@/lib/server/services/contacts.service';
import type { RequestHandler } from './$types';
import { contactSchema } from '$lib/server/schemas/contact.schema';
import { checkRateLimit, RateLimitPresets } from '$lib/server/middleware/rate-limit';
import { logError } from '$lib/server/utils/logger';
import { z } from 'zod';

const contactsService = new ContactsService();

export const POST: RequestHandler = async (event) => {
	// Rate limiting - 3 requests per 5 minutes
	const rateLimitResult = checkRateLimit(event, RateLimitPresets.CONTACT);
	if (rateLimitResult) return rateLimitResult;

	try {
		const body = await event.request.json();

		// Validate input with Zod
		const validatedData = contactSchema.parse(body);

		const contact = await contactsService.createContact(validatedData);

		return json(
			{ message: 'Contact created successfully', contactId: contact.id },
			{ status: 201 }
		);
	} catch (error) {
		// Handle validation errors
		if (error instanceof z.ZodError) {
			return json(
				{
					message: 'Validation error',
					errors: error.issues.map((e) => ({ path: e.path.join('.'), message: e.message }))
				},
				{ status: 400 }
			);
		}

		logError('API:Contact:POST', error);
		return json({ message: 'Internal Server Error' }, { status: 500 });
	}
};
