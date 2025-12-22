import { json } from '@sveltejs/kit';
import { ContactsService } from '@/lib/server/services/contacts.service';
import type { RequestHandler } from './$types';
import { logError } from '$lib/server/utils/logger';
import { env } from '$lib/server/config/env';

const contactsService = new ContactsService();

// GET: Fetch all contacts
export const GET: RequestHandler = async ({ locals }) => {
    // Auth check
    if (!locals.user) {
        return json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Owner check
    if (locals.user.email !== env.OWNER_EMAIL) {
        return json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const contacts = await contactsService.getAllContacts();
        return json({ contacts });
    } catch (error) {
        logError('API:Admin:Contacts:GET', error);
        return json({ message: 'Internal Server Error' }, { status: 500 });
    }
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
    // Auth check
    if (!locals.user) {
        return json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Owner check
    if (locals.user.email !== env.OWNER_EMAIL) {
        return json({ message: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return json({ message: 'Missing contact ID' }, { status: 400 });
        }

        const updatedContact = await contactsService.updateContact(id, data);
        return json({ message: 'Contact updated', contact: updatedContact });
    } catch (error) {
        logError('API:Admin:Contacts:PATCH', error);
        return json({ message: 'Internal Server Error' }, { status: 500 });
    }
};
