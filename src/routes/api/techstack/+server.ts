import { TechStackService } from '#lib/server/services/techstack.service.js';
import { logError } from '#lib/server/utils/logger.js';

const techStackService = new TechStackService();

export async function GET({ url }) {
	try {
		const lang = (url.searchParams.get('lang') || 'id') as 'en' | 'id';
		const data = await techStackService.getTechStack(lang);
		return Response.json(data);
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		logError('API:TechStack:GET', error);
		return Response.json({ error: errorMessage }, { status: 500 });
	}
}

export const prerender = false;
