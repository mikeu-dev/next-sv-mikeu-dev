import type { PageServerLoad } from './$types';
import { VisitorService } from '$lib/server/services/visitor.service';

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
