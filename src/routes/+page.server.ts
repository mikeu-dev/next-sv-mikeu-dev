import type { PageServerLoad } from './$types';
import { projects as fallbackProjects } from '$lib/data/projects';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const response = await fetch('/api/projects');

		if (response.ok) {
			const data = await response.json();
			if (data.projects?.length > 0) {
				return {
					projects: data.projects
				};
			}
		}
	} catch (error) {
		console.error('Failed to fetch projects from API, using fallback. Error:', error);
	}

	// Fallback to static data if API call fails or returns no projects
	return { projects: fallbackProjects };
};
