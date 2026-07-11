import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContactsService } from './contacts.service';
import { ContactsRepository } from '../repositories/contacts.repository';
import type { Contact } from '../../types';

vi.mock('../repositories/contacts.repository', () => {
	const mockRepositoryInstance = {
		create: vi.fn(),
		findAll: vi.fn(),
		findById: vi.fn(),
		update: vi.fn()
	};
	return {
		ContactsRepository: vi.fn().mockImplementation(() => mockRepositoryInstance)
	};
});

describe('ContactsService', () => {
	let service: ContactsService;
	let mockRepo: Record<string, any>;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new ContactsService();
		// Extract the mocked repository instance
		mockRepo = (service as any).contactsRepository;
	});

	describe('createContact', () => {
		it('should create a contact with status new and initial system logs', async () => {
			const contactInput = {
				name: 'John Doe',
				email: 'john@example.com',
				message: 'Hello World',
				company: 'Acme Corp',
				budget: '$1000'
			};

			const mockCreatedContact: Contact = {
				...contactInput,
				id: 'mock-contact-id',
				status: 'new',
				createdAt: new Date(),
				logs: [
					{
						id: 'mock-log-id',
						type: 'system',
						title: 'Contact Created',
						description: 'New contact submission received',
						createdAt: new Date(),
						author: 'System'
					}
				]
			};

			mockRepo.create.mockResolvedValue(mockCreatedContact);

			const result = await service.createContact(contactInput);

			expect(mockRepo.create).toHaveBeenCalledTimes(1);
			expect(mockRepo.create).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'John Doe',
					email: 'john@example.com',
					message: 'Hello World',
					status: 'new',
					logs: expect.arrayContaining([
						expect.objectContaining({
							type: 'system',
							title: 'Contact Created',
							author: 'System'
						})
					]),
					createdAt: expect.any(Date)
				})
			);
			expect(result.id).toBe('mock-contact-id');
		});

		it('should wrap Firestore quota error and throw user friendly message', async () => {
			const quotaError = new Error('Quota Exceeded');
			(quotaError as any).code = 8;
			mockRepo.create.mockRejectedValue(quotaError);

			await expect(
				service.createContact({
					name: 'John',
					email: 'john@example.com',
					message: 'Hello'
				})
			).rejects.toThrow('Service temporarily unavailable due to high traffic');
		});
	});

	describe('updateContact', () => {
		const existingContact: Contact = {
			id: 'contact-1',
			name: 'John Doe',
			email: 'john@example.com',
			message: 'Hello World',
			status: 'new',
			createdAt: new Date(),
			logs: [],
			tags: ['important']
		};

		it('should return null if contact does not exist', async () => {
			mockRepo.findById.mockResolvedValue(null);

			const result = await service.updateContact('contact-1', { status: 'in-review' });
			expect(result).toBeNull();
			expect(mockRepo.update).not.toHaveBeenCalled();
		});

		it('should log status changes correctly', async () => {
			mockRepo.findById.mockResolvedValue(existingContact);
			mockRepo.update.mockImplementation((id: string, data: any) =>
				Promise.resolve({ ...existingContact, ...data })
			);

			const result = await service.updateContact(
				'contact-1',
				{ status: 'in-review' },
				'Admin Actor'
			);

			expect(mockRepo.update).toHaveBeenCalledWith(
				'contact-1',
				expect.objectContaining({
					status: 'in-review',
					logs: expect.arrayContaining([
						expect.objectContaining({
							type: 'status_change',
							title: 'Status Updated',
							description: "Status changed from 'new' to 'in-review'",
							author: 'Admin Actor'
						})
					])
				})
			);
			expect(result?.status).toBe('in-review');
		});

		it('should log notes updates correctly', async () => {
			mockRepo.findById.mockResolvedValue(existingContact);
			mockRepo.update.mockImplementation((id: string, data: any) =>
				Promise.resolve({ ...existingContact, ...data })
			);

			await service.updateContact('contact-1', { notes: 'New custom note' }, 'Admin Actor');

			expect(mockRepo.update).toHaveBeenCalledWith(
				'contact-1',
				expect.objectContaining({
					notes: 'New custom note',
					logs: expect.arrayContaining([
						expect.objectContaining({
							type: 'note_added',
							title: 'Notes Updated',
							description: 'Internal notes were updated',
							author: 'Admin Actor'
						})
					])
				})
			);
		});

		it('should log added and removed tags correctly', async () => {
			mockRepo.findById.mockResolvedValue(existingContact); // tags is ['important']
			mockRepo.update.mockImplementation((id: string, data: any) =>
				Promise.resolve({ ...existingContact, ...data })
			);

			// Adding tag 'follow_up' and removing 'important'
			await service.updateContact('contact-1', { tags: ['follow_up', 'new_tag'] }, 'Admin Actor');

			expect(mockRepo.update).toHaveBeenCalledWith(
				'contact-1',
				expect.objectContaining({
					tags: ['follow_up', 'new_tag'],
					logs: expect.arrayContaining([
						expect.objectContaining({
							type: 'tag_added',
							title: 'Tag Added',
							description: "Tag 'follow_up' was added"
						}),
						expect.objectContaining({
							type: 'tag_added',
							title: 'Tag Added',
							description: "Tag 'new_tag' was added"
						}),
						expect.objectContaining({
							type: 'tag_removed',
							title: 'Tag Removed',
							description: "Tag 'important' was removed"
						})
					])
				})
			);
		});
	});
});
