import type { LayoutServerLoad } from './$types';
import { SocialsService } from '$lib/server/services/socials.service';
import { VisitorService } from '$lib/server/services/visitor.service';

export const load: LayoutServerLoad = async ({ locals }) => {
	const socialsService = new SocialsService();
	const visitorService = new VisitorService();
	let socials = [];
	let visitorStats = { total: 0, today: 0 };

	try {
		const socialData = await socialsService.getSocials();
		// Assuming socialService returns { links: [...] } based on previous findings
		socials = (socialData as any).links || [];
	} catch (error) {
		console.error('Failed to fetch socials:', error);
	}

	try {
		const stats = await visitorService.getStats();
		if (stats) {
			visitorStats = { total: stats.total, today: stats.today };
		}
	} catch (error) {
		console.error('Failed to fetch visitor stats:', error);
	}

	return {
		socials,
		user: locals.user,
		visitorStats
	};
};
