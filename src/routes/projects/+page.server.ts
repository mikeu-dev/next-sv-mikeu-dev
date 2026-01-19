import type { PageServerLoad } from './$types';

import type { Project } from '$lib/types';

export const prerender = false;

export const load: PageServerLoad = async ({ fetch }) => {
	let projectsResult: Record<string, Project[]> = { en: [], id: [] };

	try {
		const response = await fetch('/api/projects');

		if (response.ok) {
			const data = await response.json();
			if (data && Array.isArray(data) && data.length > 0) {
				projectsResult = {
					en: data,
					id: data
				};
			}
		}
	} catch (error) {
		console.error('Failed to fetch projects from API. Error:', error);
	}

	return { projects: projectsResult };
};
