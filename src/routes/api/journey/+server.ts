import { json } from '@sveltejs/kit';
import { JourneyService } from '$lib/server/services/journey.service';

const journeyService = new JourneyService();

export async function GET({ url }) {
    try {
        const lang = (url.searchParams.get('lang') || 'en') as 'en' | 'id';
        const data = await journeyService.getJourney(lang);
        return json(data);
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
}
