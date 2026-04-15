import type { PageServerLoad } from './$types';
import { SkillsService } from '$lib/server/services/skills.service';
import { ProjectsService } from '$lib/server/services/projects.service';
import { ProjectsRepository } from '$lib/server/repositories/projects.repository';
import { blogService } from '$lib/server/services/blog.service';

export const prerender = false;

export const load: PageServerLoad = async () => {
	const skillsService = new SkillsService();
	const projectsService = new ProjectsService(new ProjectsRepository());

	try {
		// Mengambil semua data secara paralel untuk kecepatan maksimal
		const [projects, skillsEn, skillsId, blogEn, blogId] = await Promise.all([
			projectsService.findAll(),
			skillsService.getSkills('en'),
			skillsService.getSkills('id'),
			blogService.getPublishedPostsByLocale('en'),
			blogService.getPublishedPostsByLocale('id')
		]);

		return {
			projects: {
				en: projects || [],
				id: projects || []
			},
			skills: {
				en: (skillsEn as { items: string[] })?.items || [],
				id: (skillsId as { items: string[] })?.items || []
			},
			latestPosts: {
				en: blogEn?.slice(0, 3) || [],
				id: blogId?.slice(0, 3) || []
			}
		};
	} catch (error) {
		console.error('Error loading homepage data:', error);
		return {
			projects: { en: [], id: [] },
			skills: { en: [], id: [] },
			latestPosts: { en: [], id: [] }
		};
	}
};
