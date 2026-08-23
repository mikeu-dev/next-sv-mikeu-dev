import { VisitorService } from '#lib/server/services/visitor.service.js';

export async function GET() {
	const visitorService = new VisitorService();
	try {
		const stats = await visitorService.getStats();
		return Response.json(stats, {
			headers: {
				'cache-control': 'public, s-maxage=120, stale-while-revalidate=600'
			}
		});
	} catch {
		return Response.json({ total: 0, today: 0 }, { status: 500 });
	}
}
