import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ProjectsService } from '$lib/server/services/projects.service';
import { ProjectsRepository } from '$lib/server/repositories/projects.repository';

export const load: PageServerLoad = async ({ params }) => {
	const projectsService = new ProjectsService(new ProjectsRepository());
	let project = null;

	try {
		project = await projectsService.getProjectBySlug(params.slug);
	} catch (e) {
		console.error('Error fetching project by slug:', e);
	}

	if (!project) {
		error(404, 'Project not found');
	}

	return {
		project
	};
};
