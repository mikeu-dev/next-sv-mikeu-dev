import { error } from '@sveltejs/kit';
import { projects } from '@/lib/data/projects';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const project = projects.find((p) => p.slug === params.slug);

	if (!project) {
		error(404, 'Project not found');
	}

	return {
		project
	};
};
