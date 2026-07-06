import type { PageServerLoad } from './$types';
import { skillsService } from '$lib/server/services/skills.service';
import { projectsService } from '$lib/server/services/projects.service';
import { blogService } from '$lib/server/services/blog.service';

export const prerender = false;

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
	const locale = (locals.paraglide?.locale || 'id') as 'en' | 'id';

	// Set short CDN cache to protect Firebase Free Tier, disable when logged in
	setHeaders({
		'cache-control': locals.user
			? 'private, no-store'
			: 'public, s-maxage=10, stale-while-revalidate=30'
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
