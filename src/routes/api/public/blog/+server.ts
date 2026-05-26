import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { blogService } from '$lib/server/services/blog.service';
import type { BlogPost } from '$lib/types';

export const GET: RequestHandler = async () => {
	try {
		// Mengambil semua post untuk pengecekan duplikat di eksternal (misal: n8n)
		const posts = await blogService.getAllPosts();
		return json({ data: posts });
	} catch (err) {
		console.error('Error in public blog GET API:', err);
		return json({ data: [] }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		// Parse tags jika dikirim sebagai string
		let parsedTags: string[] = [];
		if (Array.isArray(body.tags)) {
			parsedTags = body.tags;
		} else if (typeof body.tags === 'string') {
			try {
				parsedTags = JSON.parse(body.tags);
			} catch {
				parsedTags = body.tags.split(',').map((t: string) => t.trim());
			}
		}

		const postData: BlogPost = {
			slug: body.slug,
			locale: 'id', // Default bahasa Indonesia untuk artikel dari public API
			title: body.title,
			description: body.title, // Default description ke title jika tidak ada
			date: new Date().toISOString(),
			published: body.published === true || body.published === 'true',
			content: body.content,
			thumbnailUrl: body.thumbnail,
			tags: parsedTags
		};

		const post = await blogService.createPost(postData);

		return json({ success: true, data: post }, { status: 201 });
	} catch (err) {
		console.error('Error in public blog POST API:', err);
		return json({ success: false, error: 'Failed to create blog post' }, { status: 500 });
	}
};
