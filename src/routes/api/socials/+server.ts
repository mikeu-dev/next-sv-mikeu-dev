import { json } from '@sveltejs/kit';
import { SocialsService } from '$lib/server/services/socials.service';

const socialsService = new SocialsService();

export async function GET() {
    try {
        const data = await socialsService.getSocials();
        return json(data);
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
}
