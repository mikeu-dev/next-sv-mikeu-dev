import type { LayoutServerLoad } from './$types';
import { SocialsService } from '$lib/server/services/socials.service';

export const load: LayoutServerLoad = async ({ locals }) => {
    const socialsService = new SocialsService();
    let socials = [];

    try {
        const socialData = await socialsService.getSocials();
        // Assuming socialService returns { links: [...] } based on previous findings
        socials = (socialData as any).links || [];
    } catch (error) {
        console.error('Failed to fetch socials:', error);
    }

    return {
        socials,
        user: locals.user
    };
};
