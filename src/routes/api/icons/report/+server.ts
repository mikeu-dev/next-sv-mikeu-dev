import { json } from '@sveltejs/kit';
import { IconService } from '$lib/server/services/icon.service';
import { logError } from '$lib/server/utils/logger';

const iconService = new IconService();

export async function POST({ request }) {
	try {
		const { name } = await request.json();
		if (!name) {
			return json({ error: 'Name is required' }, { status: 400 });
		}

		await iconService.reportMissingIcon(name);
		return json({ success: true });
	} catch (error: unknown) {
		logError('API:Icons:Report:POST', error);
		return json({ error: 'Failed to report icon' }, { status: 500 });
	}
}

export const prerender = false;
