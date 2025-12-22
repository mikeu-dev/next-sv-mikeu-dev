import { ContactsRepository } from '../repositories/contacts.repository';
import type { Contact } from '../../types';

export class ContactsService {
	private contactsRepository = new ContactsRepository();

	async createContact(data: Omit<Contact, 'id' | 'createdAt'>) {
		return this.contactsRepository.create({
			...data,
			status: 'new',
			createdAt: new Date()
		});
	}
	async getAllContacts() {
		return this.contactsRepository.findAll();
	}

	async updateContact(id: string, data: Partial<Contact>) {
		return this.contactsRepository.update(id, data);
	}
}
