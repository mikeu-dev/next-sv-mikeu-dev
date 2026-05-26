import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { blogService } from '$lib/server/services/blog.service';
import type { BlogPost } from '$lib/types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const isN8n = url.searchParams.get('source') === 'n8n';

	if (isN8n) {
		try {
			// Mengambil semua post untuk pengecekan duplikat di n8n
			const posts = await blogService.getAllPosts();
			return json({ data: posts });
		} catch (err) {
			console.error('Error in blog GET API (n8n):', err);
			return json({ data: [] }, { status: 500 });
		}
	}

	const locale = locals.paraglide.locale;
	const limit = Number(url.searchParams.get('limit')) || 12;
	const lastDate = url.searchParams.get('lastDate') || undefined;
	const search = url.searchParams.get('q') || undefined;

	try {
		const result = await blogService.getPublishedPostsByLocale(locale, {
			limit,
			lastDate,
			search
		});

		return json(result);
	} catch (err) {
		console.error('Error in blog API:', err);
		return json({ posts: [], nextCursor: null }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		// Parse tags jika n8n mengirimkannya sebagai string
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
			locale: 'id', // Default bahasa Indonesia untuk artikel RAG
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
		console.error('Error in blog POST API:', err);
		return json({ success: false, error: 'Failed to create blog post' }, { status: 500 });
	}
};
