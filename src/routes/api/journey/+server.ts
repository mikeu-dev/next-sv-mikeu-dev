import { json } from '@sveltejs/kit';
import { JourneyService } from '$lib/server/services/journey.service';
import { logError } from '$lib/server/utils/logger';

const journeyService = new JourneyService();

export async function GET({ url }) {
	try {
		const lang = (url.searchParams.get('lang') || 'en') as 'en' | 'id';
		const data = await journeyService.getJourney(lang);
		return json(data);
	} catch (error: any) {
		logError('API:Journey:GET', error);
		return json({ error: error.message }, { status: 500 });
	}
}

export const prerender = false;
