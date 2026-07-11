import {
	PushSubscriptionRepository,
	type PushSubscription
} from '../repositories/push-subscription.repository';
import webpush from 'web-push';
import { env } from '$env/dynamic/private';
import { logError } from '../utils/logger';

export class PushSubscriptionService {
	private repository: PushSubscriptionRepository;

	constructor() {
		this.repository = new PushSubscriptionRepository();

		const publicKey = env.PUBLIC_VAPID_KEY || '';
		const privateKey = env.PRIVATE_VAPID_KEY || '';
		const ownerEmail = env.OWNER_EMAIL || 'admin@example.com';

		if (publicKey && privateKey) {
			webpush.setVapidDetails(`mailto:${ownerEmail}`, publicKey, privateKey);
		} else {
			console.warn('Web Push VAPID keys are missing from environment variables.');
		}
	}

	async saveSubscription(subscription: PushSubscription): Promise<PushSubscription | null> {
		return this.repository.saveSubscription(subscription);
	}

	async notifyAll(payload: any): Promise<void> {
		try {
			const subscriptions = await this.repository.getAllSubscriptions();
			if (!subscriptions || subscriptions.length === 0) return;

			const payloadString = JSON.stringify(payload);

			const promises = subscriptions.map(async (sub) => {
				try {
					await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payloadString);
				} catch (error: any) {
					// If subscription is invalid/expired (HTTP 410 or 404), delete it
					if (error.statusCode === 410 || error.statusCode === 404) {
						if (sub.id) await this.repository.delete(sub.id);
					} else {
						logError('PushSubscriptionService:notifyAll:send', error);
					}
				}
			});

			await Promise.allSettled(promises);
		} catch (error) {
			logError('PushSubscriptionService:notifyAll', error);
		}
	}
}
