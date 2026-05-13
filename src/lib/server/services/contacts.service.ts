import { ContactsRepository } from '../repositories/contacts.repository';
import type { Contact, ContactLog } from '../../types';

export class ContactsService {
	private contactsRepository = new ContactsRepository();

	async createContact(data: Omit<Contact, 'id' | 'createdAt' | 'logs'>) {
		try {
			const initialLog: ContactLog = {
				id: crypto.randomUUID(),
				type: 'system',
				title: 'Contact Created',
				description: 'New contact submission received',
				createdAt: new Date(),
				author: 'System'
			};

			return await this.contactsRepository.create({
				...data,
				status: 'new',
				logs: [initialLog],
				createdAt: new Date()
			});
		} catch (error: unknown) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				(error as { code: number }).code === 8
			) {
				console.error('ContactsService: Quota exceeded while creating contact');
				throw new Error(
					'Service temporarily unavailable due to high traffic. Please try again later.'
				);
			}
			throw error;
		}
	}
	async getAllContacts() {
		try {
			return await this.contactsRepository.findAll();
		} catch (error: unknown) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				(error as { code: number }).code === 8
			) {
				console.error('ContactsService: Quota exceeded while fetching contacts');
				return [];
			}
			throw error;
		}
	}

	async updateContact(id: string, data: Partial<Contact>, actor: string = 'Admin') {
		try {
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

			if (data.tags) {
				const oldTags = current.tags || [];
				const newTags = data.tags;

				// Check for added tags
				const addedTags = newTags.filter((t) => !oldTags.includes(t));
				addedTags.forEach((tag) => {
					logs.push({
						id: crypto.randomUUID(),
						type: 'tag_added',
						title: 'Tag Added',
						description: `Tag '${tag}' was added`,
						createdAt: new Date(),
						author: actor
					});
				});

				// Check for removed tags
				const removedTags = oldTags.filter((t) => !newTags.includes(t));
				removedTags.forEach((tag) => {
					logs.push({
						id: crypto.randomUUID(),
						type: 'tag_removed',
						title: 'Tag Removed',
						description: `Tag '${tag}' was removed`,
						createdAt: new Date(),
						author: actor
					});
				});
			}

			return await this.contactsRepository.update(id, { ...data, logs });
		} catch (error: unknown) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				(error as { code: number }).code === 8
			) {
				console.error('ContactsService: Quota exceeded while updating contact');
				throw new Error('Action failed due to temporary service limits.');
			}
			throw error;
		}
	}
}
