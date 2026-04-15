import { json } from '@sveltejs/kit';
import { seedBlogPosts } from '$lib/server/services/migration/blog-seeder';
import type { RequestHandler } from './$types';

/**
 * Endpoint to seed professional blog content for AdSense approval.
 * Recommended to be run once.
 */
export const GET: RequestHandler = async () => {
	try {
		const result = await seedBlogPosts();
		return json(result);
	} catch (error: unknown) {
		console.error('Seeding error:', error);
		return json(
			{
				success: false,
				error: (error as Error).message
			},
			{ status: 500 }
		);
	}
};
