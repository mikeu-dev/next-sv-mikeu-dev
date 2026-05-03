import type { RequestHandler } from './$types';
import { ProjectsService } from '$lib/server/services/projects.service';
import { ProjectsRepository } from '$lib/server/repositories/projects.repository';
import { locales, baseLocale } from '$lib/paraglide/runtime';

export const GET: RequestHandler = async () => {
	const projectsService = new ProjectsService(new ProjectsRepository());
	let projects: import('$lib/types').Project[] = [];
	try {
		projects = await projectsService.findAll();
	} catch (error) {
		console.error('Sitemap: Failed to fetch projects:', error);
	}

	const siteUrl = 'https://www.mikeudev.my.id';

	// Static pages to include
	const staticPages = [
		'',
		'/about',
		'/projects',
		'/contact',
		'/blog',
		'/privacy-policy',
		'/terms-of-service',
		'/disclaimer'
	];

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

	// Collect all relative paths
	const paths = [
		...staticPages,
		...projects.filter((p) => p.published).map((p) => `/projects/${p.slug}`),
		...blogPosts.map((slug) => `/blog/${slug}`)
	];

	let sitemapEntries = '';
	for (const path of paths) {
		for (const locale of locales) {
			const isBase = locale === baseLocale;
			const loc = isBase ? `${siteUrl}${path || '/'}` : `${siteUrl}/${locale}${path}`;

			const alternates = locales
				.map((altLocale) => {
					const altIsBase = altLocale === baseLocale;
					const altHref = altIsBase ? `${siteUrl}${path || '/'}` : `${siteUrl}/${altLocale}${path}`;
					const cleanedAltHref = altHref === `${siteUrl}/` ? altHref : altHref.replace(/\/$/, '');
					return `<xhtml:link rel="alternate" hreflang="${altLocale}" href="${cleanedAltHref}" />`;
				})
				.join('');

			const xDefaultHref = path === '' ? `${siteUrl}/` : `${siteUrl}${path}`;
			const xDefault = `<xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultHref}" />`;

			sitemapEntries += `
	<url>
		<loc>${loc === `${siteUrl}/` ? loc : loc.replace(/\/$/, '')}</loc>
		${alternates}
		${xDefault}
		<changefreq>weekly</changefreq>
		<priority>${path === '' ? '1.0' : '0.7'}</priority>
	</url>`;
		}
	}

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
