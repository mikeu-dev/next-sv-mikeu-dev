import { ProjectsService } from '$lib/server/services/projects.service';
import { ProjectsRepository } from '$lib/server/repositories/projects.repository';
import { locales } from '$lib/paraglide/runtime';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const projectsService = new ProjectsService(new ProjectsRepository());
	const projects = await projectsService.findAll();

	const siteUrl = url.origin;

	// Static pages to include
	const staticPages = ['', '/about', '/projects', '/contact', '/blog'];

	// Get blog posts
	const allPostsModules = import.meta.glob('/src/lib/posts/**/*.svx', { eager: true });
	const blogPosts = [];

	for (const path in allPostsModules) {
		const mod = allPostsModules[path] as any;
		// Check if it's metadata/frontmatter available
		if (mod.metadata && mod.metadata.published === 'true') {
			const slug = path.split('/').pop()?.replace('.svx', '');
			if (slug) {
				blogPosts.push(slug);
			}
		}
	}

	const urls = [];

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
	// Note: Assuming blog posts are localized or language agnostic in slug for now.
	// The blog logic in +page.server.ts filtered by locale in path.
	// If posts are language specific (e.g. /src/lib/posts/en/...), we might need to handle per-locale URLs.
	// For now, listing all slugs found.
	for (const slug of blogPosts) {
		urls.push(`${siteUrl}/blog/${slug}`);
	}

	const sitemap = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
${urls
	.map(
		(loc) => `
  <url>
    <loc>${loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`
	)
	.join('')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
}
