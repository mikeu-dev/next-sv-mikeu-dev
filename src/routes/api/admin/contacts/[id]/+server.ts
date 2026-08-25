import { ContactsService } from '@/lib/server/services/contacts.service';
import type { RequestHandler } from './$types';
import { logError } from '#lib/server/utils/logger.js';
import { env } from '#lib/server/config/env.js';

const contactsService = new ContactsService();

// GET: Fetch single contact
export const GET: RequestHandler = async ({ params, locals }) => {
	// Auth check
	if (!locals.user) {
		return Response.json({ message: 'Unauthorized' }, { status: 401 });
	}

	// Owner check
	if (locals.user.email !== env.OWNER_EMAIL) {
		return Response.json({ message: 'Forbidden' }, { status: 403 });
	}

	try {
		const { id } = params;
		if (!id) {
			return Response.json({ message: 'Missing contact ID' }, { status: 400 });
		}

		// We need findById in service
		// I will add it to service in next step or use repository directly if I change service to public
		// I will update service in parallel or usage

		// For now, let's assume service.getContactById(id) exists
		const allContacts = await contactsService.getAllContacts();
		const contact = allContacts.find((c) => c.id === id);

		if (!contact) {
			return Response.json({ message: 'Contact not found' }, { status: 404 });
		}

		return Response.json({ contact });
	} catch (error) {
		logError('API:Admin:Contacts:GET:ById', error);
		return Response.json({ message: 'Internal Server Error' }, { status: 500 });
	}
};

export const prerender = false;
