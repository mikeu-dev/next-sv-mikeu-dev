import { json } from '@sveltejs/kit';
import { ContactsService } from '@/lib/server/services/contacts.service';
import type { RequestHandler } from './$types';

const contactsService = new ContactsService();

// GET: Fetch single contact
export const GET: RequestHandler = async ({ params }) => {
    try {
        const { id } = params;
        if (!id) {
            return json({ message: 'Missing contact ID' }, { status: 400 });
        }

        // We need findById in service
        // I will add it to service in next step or use repository directly if I change service to public
        // I will update service in parallel or usage

        // For now, let's assume service.getContactById(id) exists
        const allContacts = await contactsService.getAllContacts();
        const contact = allContacts.find(c => c.id === id);

        if (!contact) {
            return json({ message: 'Contact not found' }, { status: 404 });
        }

        return json({ contact });
    } catch (error) {
        console.error('Error fetching contact:', error);
        return json({ message: 'Internal Server Error' }, { status: 500 });
    }
};
