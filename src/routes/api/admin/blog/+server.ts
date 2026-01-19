
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { blogService } from '$lib/server/services/blog.service';

export async function GET({ url }: RequestEvent) {
    try {
        const id = url.searchParams.get('id');
        const slug = url.searchParams.get('slug');
        const locale = url.searchParams.get('locale');

        if (id) {
            const post = await blogService.getPostById(id);
            if (!post) {
                return json({ error: 'Post not found' }, { status: 404 });
            }
            return json(post);
        }

        if (slug) {
            const post = await blogService.getPostBySlug(slug, locale || undefined);
            if (!post) {
                return json({ error: 'Post not found' }, { status: 404 });
            }
            return json(post);
        }

        const posts = await blogService.getAllPosts();
        return json(posts);
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
}

export async function POST({ request }: RequestEvent) {
    try {
        const data = await request.json();

        // Validation (basic)
        if (!data.slug || !data.title || !data.locale) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await blogService.createPost(data);
        return json(result);
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
}

export async function PUT({ request }: RequestEvent) {
    try {
        const data = await request.json();
        if (!data.id) {
            return json({ error: 'Missing ID' }, { status: 400 });
        }

        const { id, ...updateData } = data;
        const result = await blogService.updatePost(id, updateData);
        return json(result);
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE({ url }: RequestEvent) {
    try {
        const id = url.searchParams.get('id');
        if (!id) {
            return json({ error: 'Missing ID' }, { status: 400 });
        }

        await blogService.deletePost(id);
        return json({ success: true });
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
}

export const prerender = false;
