import type { RequestHandler } from './$types';
import { ProjectsService } from '$lib/server/services/projects.service';
import { ProjectsRepository } from '$lib/server/repositories/projects.repository';

export const GET: RequestHandler = async ({ url }) => {
	const projectsService = new ProjectsService(new ProjectsRepository());
	const projects = await projectsService.findAll();

	const siteUrl = url.origin;

	// Static pages to include
	const staticPages = ['', '/about', '/projects', '/contact', '/blog'];

	// Get blog posts
	const allPostsModules = import.meta.glob('/src/lib/posts/**/*.svx', { eager: true });
	const blogPosts: string[] = [];

	for (const path in allPostsModules) {
		const mod = allPostsModules[path] as { metadata: { published: string } };
		if (mod.metadata && mod.metadata.published === 'true') {
			const slug = path.split('/').pop()?.replace('.svx', '');
			if (slug) {
				blogPosts.push(slug);
			}
		}
	}

	const urls: string[] = [];

	// Add static pages
	for (const page of staticPages) {
		urls.push(`${siteUrl}${page}`);
	}

	// Add project pages
	for (const project of projects) {
		if (project.published) {
			urls.push(`${siteUrl}/project/${project.slug}`);
		}
	}

	// Add blog posts
	for (const slug of blogPosts) {
		urls.push(`${siteUrl}/blog/${slug}`);
	}

	const sitemapEntries = urls
		.map(
			(loc) => `
			<url>
				<loc>${loc}</loc>
				<changefreq>weekly</changefreq>
				<priority>0.7</priority>
			</url>`
		)
		.join('');

	const sitemap = `<?xml version="1.0" encoding="UTF-8" ?>
		<urlset
			xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
			xmlns:xhtml="http://www.w3.org/1999/xhtml"
			xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
			xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
			xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
			xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
		>
			${sitemapEntries}
		</urlset>`.trim();

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
