import { json } from '@sveltejs/kit';
import { PushSubscriptionService } from '@/lib/server/services/push-subscription.service';
import type { RequestHandler } from './$types';
import { logError } from '$lib/server/utils/logger';

const pushService = new PushSubscriptionService();

export const POST: RequestHandler = async ({ request }) => {
	try {
		const subscription = await request.json();

		if (!subscription || !subscription.endpoint || !subscription.keys) {
			return json({ message: 'Invalid subscription data' }, { status: 400 });
		}

		const saved = await pushService.saveSubscription(subscription);

		return json({ message: 'Subscription saved successfully', data: saved });
	} catch (error) {
		logError('API:Admin:Push:POST', error);
		return json({ message: 'Internal Server Error' }, { status: 500 });
	}
};
