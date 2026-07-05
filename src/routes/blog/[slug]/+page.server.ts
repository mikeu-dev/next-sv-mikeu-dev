import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { blogService } from '$lib/server/services/blog.service';
import { renderMarkdown } from '$lib/server/utils/markdown';
import { reactionService } from '$lib/server/services/reaction.service';

export const load: PageServerLoad = async (event) => {
	const { params, locals, setHeaders, cookies } = event;
	const locale = locals.paraglide.locale;
	const slug = params.slug;

	// Set short CDN cache to protect Firebase Free Tier, disable when logged in
	setHeaders({
		'cache-control': locals.user
			? 'private, no-store'
			: 'public, s-maxage=10, stale-while-revalidate=30'
	});

	try {
		const post = await blogService.getPostBySlug(slug, locale);

		if (!post) {
			throw error(404, `Artikel "${slug}" tidak ditemukan`);
		}

		if (!post.published) {
			throw error(404, `Artikel "${slug}" belum dipublikasikan`);
		}

		// Render markdown on the server
		const { html, headings } = await renderMarkdown(post.content || '');

		// Get related posts
		const relatedPosts = await blogService.getRelatedPosts(slug, post.tags || [], locale);

		// Track view and get reactions
		const viewedCookie = cookies.get('viewed_posts') || '';
		const viewedPosts = viewedCookie ? viewedCookie.split(',') : [];

		let reactions;
		if (viewedPosts.includes(slug)) {
			reactions = await reactionService.getReactions(slug);
		} else {
			reactions = await reactionService.trackView(slug);
			viewedPosts.push(slug);
			if (viewedPosts.length > 50) {
				viewedPosts.shift();
			}
			cookies.set('viewed_posts', viewedPosts.join(','), {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 // 24 hours
			});
		}

		return {
			slug,
			locale,
			meta: {
				title: post.title,
				date: post.date,
				description: post.description,
				readingTime: post.readingTime,
				tags: post.tags,
				image: post.thumbnailUrl
			},
			content: html,
			headings,
			relatedPosts,
			reactions: reactions || { slug, likes: 0, views: 1 }
		};
	} catch (err: unknown) {
		if ((err as { status?: number }).status === 404) throw err;
		console.error('Error fetching blog post:', err);
		throw error(500, 'Terjadi kesalahan saat memuat artikel');
	}
};
