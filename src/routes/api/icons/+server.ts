import { IconService } from '#lib/server/services/icon.service.js';
import { logError } from '#lib/server/utils/logger.js';

const iconService = new IconService();

export async function GET() {
	try {
		const icons = await iconService.getCustomIcons();
		return Response.json(icons);
	} catch (error: unknown) {
		logError('API:Icons:GET', error);
		return Response.json({ error: 'Failed to fetch icons' }, { status: 500 });
	}
}

export const prerender = false;
