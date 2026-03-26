import type { PageServerLoad } from './$types';
import { SkillsService } from '$lib/server/services/skills.service';
import { ProjectsService } from '$lib/server/services/projects.service';
import { ProjectsRepository } from '$lib/server/repositories/projects.repository';

export const prerender = true;

export const load: PageServerLoad = async () => {
	const skillsService = new SkillsService();
	const projectsService = new ProjectsService(new ProjectsRepository());
	let projectsResult: Record<string, unknown[]> = { en: [], id: [] };

	try {
		const data = await projectsService.findAll();
		if (data && Array.isArray(data) && data.length > 0) {
			// Projects are bilingual, so we use the same array for both locales
			projectsResult = {
				en: data,
				id: data
			};
		}
	} catch (error) {
		console.error('Failed to fetch projects directly. Error:', error);
	}

	// Fetch skills for hero section
	let skillsEn: unknown = { items: [] };
	let skillsId: unknown = { items: [] };
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
			en: (skillsEn as { items: string[] }).items || [],
			id: (skillsId as { items: string[] }).items || []
		}
	};
};
