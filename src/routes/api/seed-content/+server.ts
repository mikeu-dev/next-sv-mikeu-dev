import { seedBlogPosts } from '#lib/server/services/migration/blog-seeder.js';
import type { RequestHandler } from './$types';

/**
 * Endpoint to seed professional blog content for AdSense approval.
 * Recommended to be run once.
 */
export const GET: RequestHandler = async () => {
	try {
		const result = await seedBlogPosts();
		return Response.json(result);
	} catch (error: unknown) {
		console.error('Seeding error:', error);
		return Response.json(
			{
				success: false,
				error: (error as Error).message
			},
			{ status: 500 }
		);
	}
};
