import type { LayoutServerLoad } from './$types';
import { SocialsService } from '$lib/server/services/socials.service';
import { VisitorService } from '$lib/server/services/visitor.service';

export const load: LayoutServerLoad = async ({ locals }) => {
	const socialsService = new SocialsService();
	const visitorService = new VisitorService();

	// Melakukan fetch secara paralel untuk efisiensi.
	// Kita tidak melakukan 'await' langsung pada return untuk mengaktifkan streaming di SvelteKit.
	return {
		socials: socialsService.getSocials().then((data) => (data as { links: unknown[] }).links || []),
		visitorStats: visitorService.getStats().then((stats) => ({
			total: stats?.total || 0,
			today: stats?.today || 0
		})),
		user: locals.user
	};
};
