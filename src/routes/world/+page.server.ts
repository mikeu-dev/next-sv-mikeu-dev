import type { PageServerLoad } from './$types';
import { VisitorService } from '#lib/server/services/visitor.service.js';

// Live data: never prerender (the root layout's prerender = 'auto' froze this
// page at build time, so the map only changed on each deploy).
export const prerender = false;

/**
 * Server load function untuk /world page.
 * Fetch aggregated geo data dan stats untuk Folded World visualization.
 */
export const load: PageServerLoad = async () => {
	const visitorService = new VisitorService();

	const [geoNodes, stats] = await Promise.all([
		visitorService.getGeoAggregation(500),
		visitorService.getStats()
	]);

	return {
		geoNodes,
		stats: {
			total: stats?.total ?? 0,
			today: stats?.today ?? 0
		}
	};
};
