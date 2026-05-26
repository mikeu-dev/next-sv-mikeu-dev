import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { blogService } from '$lib/server/services/blog.service';
import type { BlogPost } from '$lib/types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Mengambil semua post untuk pengecekan duplikat di eksternal (misal: n8n)
		const title = url.searchParams.get('title');
		if (title) {
			const post = await blogService.getPostByTitle(title);
			return json({ data: post ? [post] : [] });
		}
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

		// Handle dual language payload from n8n (adopted from admin)
		if (body.title_id && body.title_en) {
			const postDataId: BlogPost = {
				slug: body.slug,
				locale: 'id',
				title: body.title_id,
				description: body.description_id || body.title_id,
				date: body.date || new Date().toISOString(),
				published: body.published === true || body.published === 'true',
				content: body.content_id,
				thumbnailUrl: body.thumbnail,
				tags: parsedTags
			};

			const postDataEn: BlogPost = {
				slug: body.slug,
				locale: 'en',
				title: body.title_en,
				description: body.description_en || body.title_en,
				date: body.date || new Date().toISOString(),
				published: body.published === true || body.published === 'true',
				content: body.content_en,
				thumbnailUrl: body.thumbnail,
				tags: parsedTags
			};

			await blogService.createPost(postDataId);
			const postEn = await blogService.createPost(postDataEn);

			return json({ success: true, data: [postDataId, postEn] }, { status: 201 });
		}

		// Fallback for single language payload
		const postData: BlogPost = {
			slug: body.slug,
			locale: body.locale || 'id',
			title: body.title,
			description: body.description || body.title,
			date: body.date || new Date().toISOString(),
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
