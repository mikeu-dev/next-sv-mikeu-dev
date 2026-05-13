import type { RequestHandler } from './$types';
import { projectsService } from '$lib/server/services/projects.service';
import { blogService } from '$lib/server/services/blog.service';
import { monitoringService } from '$lib/server/services/monitoring.service';
import { locales, baseLocale } from '$lib/paraglide/runtime';

export const GET: RequestHandler = async ({ url }) => {
	const siteUrl = 'https://www.mikeudev.my.id';

	// Fetch dynamic data from services (singletons)
	let dbProjects: import('$lib/types').Project[] = [];
	let dbPosts: import('$lib/types').BlogPost[] = [];

	try {
		const [projects, posts] = await Promise.all([
			projectsService.findAll(),
			blogService.getAllPosts()
		]);
		dbProjects = projects;
		dbPosts = posts;
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		console.error('Sitemap Generator Error:', message);

		// Log to monitoring service as per project pattern
		await monitoringService.logError({
			type: 'server',
			message: `Sitemap generation failed: ${message}`,
			url: url.toString()
		});
	}

	// 1. Core Static Pages
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

	// 2. Explicit Project Slugs (High Priority Portfolio)
	const explicitProjectSlugs = [
		'emameun',
		'geo-draw',
		'satu-peta',
		'cubets',
		'dlh-purwakarta',
		'upi-jatiluhur',
		'mapin-aja',
		'investasi-purwakarta',
		'purbakesa',
		'siperintis',
		'pratama-tech-solution',
		'sidolih'
	];

	// Combine all unique relative paths
	const pathsSet = new Set<string>(staticPages);

	// Add hardcoded projects
	for (const slug of explicitProjectSlugs) {
		pathsSet.add(`/projects/${slug}`);
	}

	// Add dynamic projects from DB
	for (const p of dbProjects) {
		if (p.published && p.slug) {
			pathsSet.add(`/projects/${p.slug}`);
		}
	}

	// Add dynamic blog posts from DB
	for (const post of dbPosts) {
		if (post.published && post.slug) {
			pathsSet.add(`/blog/${post.slug}`);
		}
	}

	const paths = Array.from(pathsSet);

	let sitemapEntries = '';
	for (const path of paths) {
		for (const locale of locales) {
			const isBase = locale === baseLocale;
			const loc = isBase ? `${siteUrl}${path || '/'}` : `${siteUrl}/${locale}${path}`;

			// Generate Alternate Language Links (SEO Best Practice)
			const alternates = locales
				.map((altLocale: string) => {
					const altIsBase = altLocale === baseLocale;
					const altHref = altIsBase ? `${siteUrl}${path || '/'}` : `${siteUrl}/${altLocale}${path}`;
					const cleanedAltHref = altHref === `${siteUrl}/` ? altHref : altHref.replace(/\/$/, '');
					return `<xhtml:link rel="alternate" hreflang="${altLocale}" href="${cleanedAltHref}" />`;
				})
				.join('');

			const xDefaultHref = path === '' ? `${siteUrl}/` : `${siteUrl}${path}`;
			const xDefault = `<xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultHref}" />`;

			// Priority Logic: 1.0 for home, 0.7 for everything else
			const priority = path === '' ? '1.0' : '0.7';

			sitemapEntries += `
	<url>
		<loc>${loc === `${siteUrl}/` ? loc : loc.replace(/\/$/, '')}</loc>
		${alternates}
		${xDefault}
		<changefreq>weekly</changefreq>
		<priority>${priority}</priority>
	</url>`;
		}
	}

	const sitemap = `<?xml version="1.0" encoding="UTF-8" ?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
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
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600',
			'X-Content-Type-Options': 'nosniff'
		}
	});
};
