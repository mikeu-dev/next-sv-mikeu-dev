import { JourneyService } from '#lib/server/services/journey.service.js';
import { logError } from '#lib/server/utils/logger.js';

const journeyService = new JourneyService();

export async function GET({ url }) {
	try {
		const lang = (url.searchParams.get('lang') || 'id') as 'en' | 'id';
		const data = await journeyService.getJourney(lang);
		return Response.json(data);
	} catch (error: unknown) {
		logError('API:Journey:GET', error);
		const message = error instanceof Error ? error.message : 'Unknown error';
		return Response.json({ error: message }, { status: 500 });
	}
}

export const prerender = false;
