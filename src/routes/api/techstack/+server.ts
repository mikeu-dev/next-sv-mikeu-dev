import { json } from '@sveltejs/kit';
import { TechStackService } from '$lib/server/services/techstack.service';
import { logError } from '$lib/server/utils/logger';

const techStackService = new TechStackService();

export async function GET({ url }) {
	try {
		const lang = (url.searchParams.get('lang') || 'en') as 'en' | 'id';
		const data = await techStackService.getTechStack(lang);
		return json(data);
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		logError('API:TechStack:GET', error);
		return json({ error: errorMessage }, { status: 500 });
	}
}

export const prerender = false;
