import { BaseRepository } from '../core/base.repository';
import { COLLECTIONS } from '../firebase/collections';

export interface PushSubscription {
	id?: string;
	endpoint: string;
	keys: {
		p256dh: string;
		auth: string;
	};
	createdAt?: Date;
	updatedAt?: Date;
}

export class PushSubscriptionRepository extends BaseRepository<PushSubscription> {
	constructor() {
		super(COLLECTIONS.PUSH_SUBSCRIPTIONS);
	}

	async saveSubscription(subscription: PushSubscription): Promise<PushSubscription | null> {
		const existing = await this.findWithQuery({
			where: [['endpoint', '==', subscription.endpoint]]
		});
		if (existing && existing.length > 0) {
			return this.update(existing[0].id!, { ...subscription, updatedAt: new Date() });
		}
		return this.create({ ...subscription, createdAt: new Date(), updatedAt: new Date() });
	}

	async getAllSubscriptions(): Promise<PushSubscription[]> {
		return this.findAll();
	}
}
