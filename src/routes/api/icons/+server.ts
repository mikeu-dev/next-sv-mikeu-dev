import { json } from '@sveltejs/kit';
import { IconService } from '$lib/server/services/icon.service';
import { logError } from '$lib/server/utils/logger';

const iconService = new IconService();

export async function GET() {
	try {
		const icons = await iconService.getCustomIcons();
		return json(icons);
	} catch (error: unknown) {
		logError('API:Icons:GET', error);
		return json({ error: 'Failed to fetch icons' }, { status: 500 });
	}
}

export const prerender = false;
