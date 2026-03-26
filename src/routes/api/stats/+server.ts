import { json } from '@sveltejs/kit';
import { VisitorService } from '$lib/server/services/visitor.service';

export async function GET() {
	const visitorService = new VisitorService();
	try {
		const stats = await visitorService.getStats();
		return json(stats, {
			headers: {
				'cache-control': 'public, max-age=60' // Cache for 1 minute
			}
		});
	} catch {
		return json({ total: 0, today: 0 }, { status: 500 });
	}
}
