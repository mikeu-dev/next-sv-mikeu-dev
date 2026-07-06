import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ProjectsService } from '$lib/server/services/projects.service';
import { ProjectsRepository } from '$lib/server/repositories/projects.repository';
import { projectReactionService } from '$lib/server/services/project-reaction.service';

export const prerender = false;

export const load: PageServerLoad = async ({ params, cookies }) => {
	const projectsService = new ProjectsService(new ProjectsRepository());
	const { slug } = params;

	let project = null;

	try {
		project = await projectsService.getProjectBySlug(slug);
	} catch (e) {
		console.error('Error fetching project by slug:', e);
	}

	if (!project) {
		error(404, 'Project not found');
	}

	// Track view and get reactions
	const viewedCookie = cookies.get('viewed_projects') || '';
	const viewedProjects = viewedCookie ? viewedCookie.split(',') : [];

	let reactions;
	if (viewedProjects.includes(slug)) {
		reactions = await projectReactionService.getReactions(slug);
	} else {
		reactions = await projectReactionService.trackView(slug);
		viewedProjects.push(slug);
		if (viewedProjects.length > 50) {
			viewedProjects.shift();
		}
		cookies.set('viewed_projects', viewedProjects.join(','), {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 // 24 hours
		});
	}

	// Get related projects (same tags)
	let relatedProjects: import('$lib/types').Project[] = [];
	try {
		const allProjects = await projectsService.findProjects({ limit: 10 });
		relatedProjects = allProjects
			.filter(
				(p) =>
					p.slug !== slug && p.tags?.some((t) => project?.tags?.some((pt) => pt.name === t.name))
			)
			.slice(0, 3);
	} catch (e) {
		console.error('Error fetching related projects:', e);
	}

	// Serialize Firestore Timestamps to JS Dates
	const serializedProject = {
		...project,
		// @ts-expect-error - Handle Firestore Timestamp conversion
		updatedAt: project.updatedAt?.toDate?.() ?? project.updatedAt,
		// @ts-expect-error - Handle Firestore Timestamp conversion
		createdAt: project.createdAt?.toDate?.() ?? project.createdAt
	};

	return {
		project: serializedProject,
		reactions: reactions || { slug, likes: 0, views: 1 },
		relatedProjects
	};
};
