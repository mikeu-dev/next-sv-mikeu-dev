import { json } from '@sveltejs/kit';
import { TechStackService } from '$lib/server/services/techstack.service';

const techStackService = new TechStackService();

export async function GET({ url }) {
    try {
        const lang = (url.searchParams.get('lang') || 'en') as 'en' | 'id';
        const data = await techStackService.getTechStack(lang);
        return json(data);
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
}
