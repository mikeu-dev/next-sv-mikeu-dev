import type { PageServerLoad } from './$types';
import { SkillsService } from '$lib/server/services/skills.service';

export const prerender = false;

export const load: PageServerLoad = async ({ fetch }) => {
	const skillsService = new SkillsService();
	let projectsResult: Record<string, any[]> = { en: [], id: [] };

	try {
		const response = await fetch('/api/projects');

		if (response.ok) {
			const data = await response.json();
			if (data && Array.isArray(data) && data.length > 0) {
				// Projects are bilingual, so we use the same array for both locales
				projectsResult = {
					en: data,
					id: data
				};
			}
		}
	} catch (error) {
		console.error('Failed to fetch projects from API. Error:', error);
	}

	// Fetch skills for hero section
	let skillsEn: any = { items: [] };
	let skillsId: any = { items: [] };
	try {
		const [en, id] = await Promise.all([
			skillsService.getSkills('en'),
			skillsService.getSkills('id')
		]);
		if (en) skillsEn = en;
		if (id) skillsId = id;
	} catch (error) {
		console.error('Failed to fetch skills:', error);
	}

	return {
		projects: projectsResult,
		skills: {
			en: skillsEn.items || [],
			id: skillsId.items || []
		}
	};
};
