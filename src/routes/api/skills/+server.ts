import { SkillsService } from '#lib/server/services/skills.service.js';
import { logError } from '#lib/server/utils/logger.js';

const skillsService = new SkillsService();

export async function GET({ url }) {
	try {
		const lang = (url.searchParams.get('lang') || 'id') as 'en' | 'id';
		const data = await skillsService.getSkills(lang);
		return Response.json(data);
	} catch (error: unknown) {
		logError('API:Skills:GET', error);
		const message = error instanceof Error ? error.message : 'Unknown error';
		return Response.json({ error: message }, { status: 500 });
	}
}

export const prerender = false;
