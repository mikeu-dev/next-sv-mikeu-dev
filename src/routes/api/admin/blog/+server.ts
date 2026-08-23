import type { RequestEvent } from '@sveltejs/kit';
import { blogService } from '#lib/server/services/blog.service.js';

export async function GET({ url }: RequestEvent) {
	try {
		const id = url.searchParams.get('id');
		const slug = url.searchParams.get('slug');
		const locale = url.searchParams.get('locale');

		if (id) {
			const post = await blogService.getPostById(id);
			if (!post) {
				return Response.json({ error: 'Post not found' }, { status: 404 });
			}
			return Response.json(post);
		}

		if (slug) {
			const post = await blogService.getPostBySlug(slug, locale || undefined);
			if (!post) {
				return Response.json({ error: 'Post not found' }, { status: 404 });
			}
			return Response.json(post);
		}

		const posts = await blogService.getAllPosts();
		return Response.json(posts);
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return Response.json({ error: message }, { status: 500 });
	}
}

export async function POST({ request }: RequestEvent) {
	try {
		const data = await request.json();

		// Validation (basic)
		if (!data.slug || !data.title || !data.locale) {
			return Response.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const result = await blogService.createPost(data);
		return Response.json(result);
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return Response.json({ error: message }, { status: 500 });
	}
}

export async function PUT({ request }: RequestEvent) {
	try {
		const data = await request.json();
		if (!data.id) {
			return Response.json({ error: 'Missing ID' }, { status: 400 });
		}

		const { id, ...updateData } = data;
		const result = await blogService.updatePost(id, updateData);
		return Response.json(result);
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return Response.json({ error: message }, { status: 500 });
	}
}

export async function DELETE({ url }: RequestEvent) {
	try {
		const id = url.searchParams.get('id');
		if (!id) {
			return Response.json({ error: 'Missing ID' }, { status: 400 });
		}

		await blogService.deletePost(id);
		return Response.json({ success: true });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return Response.json({ error: message }, { status: 500 });
	}
}

export const prerender = false;
