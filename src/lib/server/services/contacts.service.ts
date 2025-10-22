import { ContactsRepository } from '../repositories/contacts.repository';
import type { Contact } from '../../types';

export class ContactsService {
	private contactsRepository = new ContactsRepository();

	async createContact(data: Omit<Contact, 'id' | 'createdAt'>) {
		return this.contactsRepository.create({
			...data,
			createdAt: new Date()
		});
	}
}
