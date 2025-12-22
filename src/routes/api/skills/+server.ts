import { json } from '@sveltejs/kit';
import { SkillsService } from '$lib/server/services/skills.service';
import { logError } from '$lib/server/utils/logger';

const skillsService = new SkillsService();

export async function GET({ url }) {
    try {
        const lang = (url.searchParams.get('lang') || 'en') as 'en' | 'id';
        const data = await skillsService.getSkills(lang);
        return json(data);
    } catch (error: any) {
        logError('API:Skills:GET', error);
        return json({ error: error.message }, { status: 500 });
    }
}

export const prerender = false;
