import { ContactsService } from '@/lib/server/services/contacts.service';
import type { RequestHandler } from './$types';
import { logError } from '#lib/server/utils/logger.js';
import { env } from '#lib/server/config/env.js';

const contactsService = new ContactsService();

// GET: Fetch all contacts
export const GET: RequestHandler = async ({ locals }) => {
	// Auth check
	if (!locals.user) {
		return Response.json({ message: 'Unauthorized' }, { status: 401 });
	}

	// Owner check
	if (locals.user.email !== env.OWNER_EMAIL) {
		return Response.json({ message: 'Forbidden' }, { status: 403 });
	}

	try {
		const contacts = await contactsService.getAllContacts();
		return Response.json({ contacts });
	} catch (error) {
		logError('API:Admin:Contacts:GET', error);
		return Response.json({ message: 'Internal Server Error' }, { status: 500 });
	}
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
	// Auth check
	if (!locals.user) {
		return Response.json({ message: 'Unauthorized' }, { status: 401 });
	}

	// Owner check
	if (locals.user.email !== env.OWNER_EMAIL) {
		return Response.json({ message: 'Forbidden' }, { status: 403 });
	}

	try {
		const body = await request.json();
		const { id, ...data } = body;

		if (!id) {
			return Response.json({ message: 'Missing contact ID' }, { status: 400 });
		}

		const updatedContact = await contactsService.updateContact(id, data);
		return Response.json({ message: 'Contact updated', contact: updatedContact });
	} catch (error) {
		logError('API:Admin:Contacts:PATCH', error);
		return Response.json({ message: 'Internal Server Error' }, { status: 500 });
	}
};

export const prerender = false;
