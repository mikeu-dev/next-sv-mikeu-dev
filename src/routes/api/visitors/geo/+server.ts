import { VisitorService } from '#lib/server/services/visitor.service.js';
import type { GeoVisitorResponse } from '#lib/components/guest/sections/world/folded-world.types.js';

/**
 * GET /api/visitors/geo
 * Public endpoint â€” returns aggregated geo data for Folded World visualization.
 * Does NOT expose IP addresses or sensitive data.
 */
export async function GET() {
	const visitorService = new VisitorService();

	try {
		const [geoNodes, stats] = await Promise.all([
			visitorService.getGeoAggregation(500),
			visitorService.getStats()
		]);

		const response: GeoVisitorResponse = {
			nodes: geoNodes,
			totalVisitors: stats?.total ?? 0,
			lastUpdated: new Date().toISOString()
		};

		return Response.json(response, {
			headers: {
				'cache-control': 'public, max-age=300' // Cache 5 minutes
			}
		});
	} catch {
		const fallback: GeoVisitorResponse = {
			nodes: [],
			totalVisitors: 0,
			lastUpdated: new Date().toISOString()
		};
		return Response.json(fallback, { status: 500 });
	}
}
