import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { visitorService } from '$lib/server/services/visitor.service';
import { monitoringService } from '$lib/server/services/monitoring.service';
import { env } from '$env/dynamic/private';

/**
 * System Cleanup Endpoint
 * Designed to be called by Vercel Cron Jobs.
 * Cleans up old visitor logs and error logs.
 */
export const GET: RequestHandler = async ({ url, request }) => {
	// Security: Check for CRON_SECRET or Admin Authorization
	const authHeader = request.headers.get('authorization');
	const cronSecret = request.headers.get('x-vercel-cron'); // Auto-set by Vercel Cron

	// If not called by Vercel Cron and no secret provided, block it
	if (!cronSecret && env.CRON_SECRET && authHeader !== `Bearer ${env.CRON_SECRET}`) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const visitorDays = Number(url.searchParams.get('visitor_days')) || 30;
		const errorDays = Number(url.searchParams.get('error_days')) || 7;

		const visitorCleared = await visitorService.clearOldLogs(visitorDays);
		const errorCleared = await monitoringService.clearOldLogs(errorDays);

		return json({
			success: true,
			timestamp: new Date().toISOString(),
			summary: {
				visitor_logs: {
					cleared: visitorCleared,
					kept_days: visitorDays
				},
				error_logs: {
					cleared: errorCleared,
					kept_days: errorDays
				}
			}
		});
	} catch (error) {
		console.error('System Cleanup Failed:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
