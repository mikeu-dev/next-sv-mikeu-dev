import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PushSubscriptionService } from './push-subscription.service';
import webpush from 'web-push';
import { PushSubscriptionRepository } from '../repositories/push-subscription.repository';

// Mock the environment variables
vi.mock('$env/dynamic/private', () => ({
	env: {
		PUBLIC_VAPID_KEY: 'test-public-key',
		PRIVATE_VAPID_KEY: 'test-private-key',
		OWNER_EMAIL: 'test@example.com'
	}
}));

// Mock the web-push library
vi.mock('web-push', () => ({
	default: {
		setVapidDetails: vi.fn(),
		sendNotification: vi.fn()
	}
}));

// Mock the repository
vi.mock('../repositories/push-subscription.repository', () => {
	return {
		PushSubscriptionRepository: vi.fn().mockImplementation(() => ({
			saveSubscription: vi.fn(),
			getAllSubscriptions: vi.fn(),
			delete: vi.fn()
		}))
	};
});

describe('PushSubscriptionService', () => {
	let service: PushSubscriptionService;
	let mockRepository: any;

	beforeEach(() => {
		vi.clearAllMocks();

		// Create a new instance of the service
		service = new PushSubscriptionService();

		// Get the mock instance of the repository
		mockRepository = (service as any).repository;
	});

	describe('constructor', () => {
		it('should set vapid details with correct environment variables', () => {
			expect(webpush.setVapidDetails).toHaveBeenCalledWith(
				'mailto:test@example.com',
				'test-public-key',
				'test-private-key'
			);
		});
	});

	describe('saveSubscription', () => {
		it('should call repository.saveSubscription with correct data', async () => {
			const mockSubscription = {
				endpoint: 'https://test-endpoint.com',
				keys: { p256dh: 'p256dh', auth: 'auth' }
			};

			mockRepository.saveSubscription.mockResolvedValue(mockSubscription);

			const result = await service.saveSubscription(mockSubscription);

			expect(mockRepository.saveSubscription).toHaveBeenCalledWith(mockSubscription);
			expect(result).toEqual(mockSubscription);
		});
	});

	describe('notifyAll', () => {
		it('should not send notifications if there are no subscriptions', async () => {
			mockRepository.getAllSubscriptions.mockResolvedValue([]);

			await service.notifyAll({ title: 'Test' });

			expect(webpush.sendNotification).not.toHaveBeenCalled();
		});

		it('should send notifications to all active subscriptions', async () => {
			const mockSubscriptions = [
				{ id: '1', endpoint: 'https://test1.com', keys: { p256dh: 'k1', auth: 'a1' } },
				{ id: '2', endpoint: 'https://test2.com', keys: { p256dh: 'k2', auth: 'a2' } }
			];

			mockRepository.getAllSubscriptions.mockResolvedValue(mockSubscriptions);
			(webpush.sendNotification as any).mockResolvedValue(true);

			const payload = { title: 'New Message', body: 'Test body' };
			await service.notifyAll(payload);

			expect(webpush.sendNotification).toHaveBeenCalledTimes(2);
			expect(webpush.sendNotification).toHaveBeenNthCalledWith(
				1,
				{ endpoint: 'https://test1.com', keys: { p256dh: 'k1', auth: 'a1' } },
				JSON.stringify(payload)
			);
			expect(webpush.sendNotification).toHaveBeenNthCalledWith(
				2,
				{ endpoint: 'https://test2.com', keys: { p256dh: 'k2', auth: 'a2' } },
				JSON.stringify(payload)
			);
		});

		it('should delete subscription if error status is 410 (Gone)', async () => {
			const mockSubscriptions = [
				{ id: '1', endpoint: 'https://test1.com', keys: { p256dh: 'k1', auth: 'a1' } }
			];

			mockRepository.getAllSubscriptions.mockResolvedValue(mockSubscriptions);

			// Simulate a WebPushError with statusCode 410
			const webPushError = new Error('Subscription expired');
			(webPushError as any).statusCode = 410;
			(webpush.sendNotification as any).mockRejectedValue(webPushError);

			await service.notifyAll({ title: 'Test' });

			expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
			expect(mockRepository.delete).toHaveBeenCalledWith('1');
		});

		it('should delete subscription if error status is 404 (Not Found)', async () => {
			const mockSubscriptions = [
				{ id: '1', endpoint: 'https://test1.com', keys: { p256dh: 'k1', auth: 'a1' } }
			];

			mockRepository.getAllSubscriptions.mockResolvedValue(mockSubscriptions);

			// Simulate a WebPushError with statusCode 404
			const webPushError = new Error('Subscription not found');
			(webPushError as any).statusCode = 404;
			(webpush.sendNotification as any).mockRejectedValue(webPushError);

			await service.notifyAll({ title: 'Test' });

			expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
			expect(mockRepository.delete).toHaveBeenCalledWith('1');
		});

		it('should not delete subscription for other error statuses', async () => {
			const mockSubscriptions = [
				{ id: '1', endpoint: 'https://test1.com', keys: { p256dh: 'k1', auth: 'a1' } }
			];

			mockRepository.getAllSubscriptions.mockResolvedValue(mockSubscriptions);

			// Simulate a WebPushError with statusCode 500
			const webPushError = new Error('Server error');
			(webPushError as any).statusCode = 500;
			(webpush.sendNotification as any).mockRejectedValue(webPushError);

			await service.notifyAll({ title: 'Test' });

			expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
			expect(mockRepository.delete).not.toHaveBeenCalled();
		});
	});
});
