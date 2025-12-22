import { json } from '@sveltejs/kit';
import { ContactsService } from '@/lib/server/services/contacts.service';
import type { RequestHandler } from './$types';

const contactsService = new ContactsService();

// GET: Fetch all contacts
export const GET: RequestHandler = async () => {
    // TODO: Auth check
    try {
        const contacts = await contactsService.getAllContacts();
        return json({ contacts });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return json({ message: 'Internal Server Error' }, { status: 500 });
    }
};

export const PATCH: RequestHandler = async ({ request }) => {
    // TODO: Auth check
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) {
            return json({ message: 'Missing contact ID' }, { status: 400 });
        }

        const updatedContact = await contactsService.updateContact(id, data);
        return json({ message: 'Contact updated', contact: updatedContact });
    } catch (error) {
        console.error('Error updating contact:', error);
        return json({ message: 'Internal Server Error' }, { status: 500 });
    }
};
