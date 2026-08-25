import { PushSubscriptionService } from '#lib/server/services/push-subscription.service.js';
import type { RequestHandler } from './$types';
import { logError } from '#lib/server/utils/logger.js';

const pushService = new PushSubscriptionService();

export const POST: RequestHandler = async ({ request }) => {
	try {
		const subscription = await request.json();

		if (!subscription || !subscription.endpoint || !subscription.keys) {
			return Response.json({ message: 'Invalid subscription data' }, { status: 400 });
		}

		const saved = await pushService.saveSubscription(subscription);

		return Response.json({ message: 'Subscription saved successfully', data: saved });
	} catch (error) {
		logError('API:Admin:Push:POST', error);
		return Response.json({ message: 'Internal Server Error' }, { status: 500 });
	}
};
