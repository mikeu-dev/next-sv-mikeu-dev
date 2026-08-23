import { IconService } from '#lib/server/services/icon.service.js';
import { logError } from '#lib/server/utils/logger.js';

const iconService = new IconService();

export async function POST({ request }) {
	try {
		const { name } = await request.json();
		if (!name) {
			return Response.json({ error: 'Name is required' }, { status: 400 });
		}

		await iconService.reportMissingIcon(name);
		return Response.json({ success: true });
	} catch (error: unknown) {
		logError('API:Icons:Report:POST', error);
		return Response.json({ error: 'Failed to report icon' }, { status: 500 });
	}
}

export const prerender = false;
