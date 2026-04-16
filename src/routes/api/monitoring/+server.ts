import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { monitoringService } from '$lib/server/services/monitoring.service';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();

		// Basic validation
		if (!data.type || !data.message) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		await monitoringService.logError({
			type: data.type,
			message: data.message,
			stack: data.stack,
			url: data.url,
			userAgent: data.userAgent,
			context: data.context
		});

		return json({ success: true });
	} catch (error) {
		console.error('Failed to process monitoring log:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
