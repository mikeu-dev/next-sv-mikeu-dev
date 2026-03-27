import { error } from '@sveltejs/kit';
import { getLocale } from '@/lib/paraglide/runtime';
import type { PageServerLoad } from './$types';
import { blogService } from '$lib/server/services/blog.service';

export const config = {
	isr: {
		expiration: 300 // Revalidate every 5 minutes
	}
};

export const load: PageServerLoad = async (event) => {
	const { params, locals } = event;
	const locale = locals.paraglide.locale ?? getLocale();
	const slug = params.slug;

	try {
		const post = await blogService.getPostBySlug(slug, locale);

		if (!post) {
			throw error(404, `Artikel "${slug}" tidak ditemukan`);
		}

		if (!post.published) {
			throw error(404, `Artikel "${slug}" belum dipublikasikan`);
		}

		return {
			slug,
			locale,
			meta: {
				title: post.title,
				date: post.date,
				description: post.description
			},
			content: post.content || ''
		};
	} catch (err: unknown) {
		if ((err as { status?: number }).status === 404) throw err;
		console.error('Error fetching blog post:', err);
		throw error(500, 'Terjadi kesalahan saat memuat artikel');
	}
};
