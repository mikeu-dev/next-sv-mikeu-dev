import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, fetch }) => {
	try {
		const response = await fetch(`/api/projects/${params.id}`);

		if (!response.ok) {
			throw error(404, 'Project not found');
		}

		const project = await response.json();
		return { project };
	} catch (err) {
		throw error(404, 'Project not found');
	}
};
