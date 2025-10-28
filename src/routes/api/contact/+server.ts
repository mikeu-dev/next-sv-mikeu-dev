export const prerender = false;

import { json } from '@sveltejs/kit';
import { ContactsService } from '@/lib/server/services/contacts.service';
import type { RequestHandler } from './$types';

const contactsService = new ContactsService();

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { name, email, message } = body;

		if (!name || !email || !message) {
			return json({ message: 'Missing required fields' }, { status: 400 });
		}

		const contact = await contactsService.createContact({ name, email, message });

		return json({ message: 'Contact created successfully', contactId: contact.id }, { status: 201 });
	} catch (error) {
		console.error('Error creating contact:', error);
		return json({ message: 'Internal Server Error' }, { status: 500 });
	}
};
