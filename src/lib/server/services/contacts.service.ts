import { ContactsRepository } from '../repositories/contacts.repository';
import type { Contact, ContactLog } from '../../types';

export class ContactsService {
	private contactsRepository = new ContactsRepository();

	async createContact(data: Omit<Contact, 'id' | 'createdAt' | 'logs'>) {
		const initialLog: ContactLog = {
			id: crypto.randomUUID(),
			type: 'system',
			title: 'Contact Created',
			description: 'New contact submission received',
			createdAt: new Date(),
			author: 'System'
		};

		return this.contactsRepository.create({
			...data,
			status: 'new',
			logs: [initialLog],
			createdAt: new Date()
		});
	}
	async getAllContacts() {
		return this.contactsRepository.findAll();
	}

	async updateContact(id: string, data: Partial<Contact>, actor: string = 'Admin') {
		const current = await this.contactsRepository.findById(id);
		if (!current) return null;

		const logs: ContactLog[] = current.logs || [];

		// Auto-generate logs based on changes
		if (data.status && data.status !== current.status) {
			logs.push({
				id: crypto.randomUUID(),
				type: 'status_change',
				title: 'Status Updated',
				description: `Status changed from '${current.status}' to '${data.status}'`,
				createdAt: new Date(),
				author: actor
			});
		}

		if (data.notes && data.notes !== current.notes) {
			logs.push({
				id: crypto.randomUUID(),
				type: 'note_added',
				title: 'Notes Updated',
				description: 'Internal notes were updated',
				createdAt: new Date(),
				author: actor
			});
		}

		return this.contactsRepository.update(id, { ...data, logs });
	}
}
