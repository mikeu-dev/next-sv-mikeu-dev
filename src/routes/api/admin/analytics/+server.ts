import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { VisitorService } from '$lib/server/services/visitor.service';

export const GET: RequestHandler = async ({ url }) => {
	try {
        const days = Number(url.searchParams.get('days')) || 30;
		const visitorService = new VisitorService();
		const analytics = await visitorService.getAnalytics(days);
		return json(analytics);
	} catch (error) {
		console.error('Failed to fetch analytics:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
