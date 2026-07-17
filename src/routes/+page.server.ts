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

	const [projects, skillsResult, latestPostsResult] = await Promise.all([
		projectsService.findAll().catch(() => []),
		skillsService.getSkills(locale).catch(() => null),
		blogService.getPublishedPostsByLocale(locale).catch(() => null)
	]);

	return {
		projects,
		skills: (skillsResult as { items: string[] })?.items || [],
		latestPosts: latestPostsResult?.posts.slice(0, 3) || []
	};
};
