import type { PageServerLoad } from './$types';
import { skillsService } from '$lib/server/services/skills.service';
import { projectsService } from '$lib/server/services/projects.service';
import { blogService } from '$lib/server/services/blog.service';

export const prerender = false;

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
	const locale = (locals.paraglide?.locale || 'en') as 'en' | 'id';

	// Disable CDN and browser caching for the homepage in production
	setHeaders({
		'cache-control': 'private, no-cache, no-store, must-revalidate'
	});

	// Projects fetch is the same for both, but we fetch it once.
	// Skills and Blog are locale-specific.
	// We stream the data to allow the page to start rendering immediately.

	return {
		projects: projectsService
			.findAll()
			.then((projects) => projects || [])
			.catch(() => []),
		skills: skillsService
			.getSkills(locale)
			.then((skills) => (skills as { items: string[] })?.items || [])
			.catch(() => []),
		latestPosts: blogService
			.getPublishedPostsByLocale(locale)
			.then((posts) => posts?.posts.slice(0, 3) || [])
			.catch(() => [])
	};
};
