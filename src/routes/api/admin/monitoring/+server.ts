import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { monitoringService } from '$lib/server/services/monitoring.service';

export const GET: RequestHandler = async () => {
	try {
		const logs = await monitoringService.getLogs(100);
		return json(logs);
	} catch (error) {
		console.error('Failed to fetch monitoring logs:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ url }: { url: URL }) => {
	try {
        const days = Number(url.searchParams.get('days')) || 7;
		const cleared = await monitoringService.clearOldLogs(days);
		return json({ success: true, cleared });
	} catch (error) {
		console.error('Failed to clear monitoring logs:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
