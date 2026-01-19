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

	// Serialize Firestore Timestamps to JS Dates which SvelteKit can handle
	const serializedProject = {
		...project,
		// @ts-expect-error - Handle Firestore Timestamp conversion
		updatedAt: project.updatedAt?.toDate?.() ?? project.updatedAt,
		// @ts-expect-error - Handle Firestore Timestamp conversion
		createdAt: project.createdAt?.toDate?.() ?? project.createdAt
	};

	return {
		project: serializedProject
	};
};
