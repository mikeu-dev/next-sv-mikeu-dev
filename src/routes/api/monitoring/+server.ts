import type { RequestHandler } from './$types';
import { monitoringService } from '#lib/server/services/monitoring.service.js';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();

		// Basic validation
		if (!data.type || !data.message) {
			return Response.json({ error: 'Missing required fields' }, { status: 400 });
		}

		await monitoringService.logError({
			type: data.type,
			message: data.message,
			stack: data.stack,
			url: data.url,
			userAgent: data.userAgent,
			context: data.context
		});

		return Response.json({ success: true });
	} catch (error) {
		console.error('Failed to process monitoring log:', error);
		return Response.json({ error: 'Internal server error' }, { status: 500 });
	}
};
