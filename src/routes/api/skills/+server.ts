import { json } from '@sveltejs/kit';
import { SkillsService } from '$lib/server/services/skills.service';
import { logError } from '$lib/server/utils/logger';

const skillsService = new SkillsService();

export async function GET({ url }) {
	try {
		const lang = (url.searchParams.get('lang') || 'en') as 'en' | 'id';
		const data = await skillsService.getSkills(lang);
		return json(data);
	} catch (error: unknown) {
		logError('API:Skills:GET', error);
		const message = error instanceof Error ? error.message : 'Unknown error';
		return json({ error: message }, { status: 500 });
	}
}

export const prerender = false;
