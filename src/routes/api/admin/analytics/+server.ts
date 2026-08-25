import type { RequestHandler } from './$types';
import { VisitorService } from '#lib/server/services/visitor.service.js';

export const GET: RequestHandler = async () => {
	try {
		const visitorService = new VisitorService();
		const analytics = await visitorService.getAnalytics();
		return Response.json(analytics);
	} catch (error) {
		console.error('Failed to fetch analytics:', error);
		return Response.json({ error: 'Internal server error' }, { status: 500 });
	}
};
