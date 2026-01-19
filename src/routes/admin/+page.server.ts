import { ProjectsService } from '$lib/server/services/projects.service';
import { ProjectsRepository } from '$lib/server/repositories/projects.repository';
import { blogService } from '$lib/server/services/blog.service';
import { ContactsService } from '$lib/server/services/contacts.service';
import { TechStackService } from '$lib/server/services/techstack.service';
import { VisitorService } from '$lib/server/services/visitor.service';
import { SkillsService } from '$lib/server/services/skills.service';
import type { PageServerLoad } from './$types';


export const load: PageServerLoad = async () => {
	const projectsService = new ProjectsService(new ProjectsRepository());
	const contactsService = new ContactsService();
	const techStackService = new TechStackService();
	const visitorService = new VisitorService();
	const skillsService = new SkillsService();

	const [projects, posts, contacts, techstack, skills] = await Promise.all([
		projectsService.findAll(),
		blogService.getAllPosts(),
		contactsService.getAllContacts(),
		techStackService.getTechStack('en'),
		skillsService.getSkills('en')
	]);

	// Sort recent messages
	const recentMessages = (contacts || [])
		.sort(
			(a: Record<string, unknown>, b: Record<string, unknown>) =>
				new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
		)
		.slice(0, 5);

	// Sort recent posts
	const recentPosts = (posts || [])
		.sort(
			(a: Record<string, unknown>, b: Record<string, unknown>) =>
				new Date(b.date as string).getTime() - new Date(a.date as string).getTime()
		)
		.slice(0, 5);

	// Count tech stack items (sum of items in all categories)
	// This line is effectively replaced by the new techStackItemsCount calculation below,
	// but keeping it commented out for context if it was meant to be removed.
	// const techStackCount = techstack?.categories?.reduce((acc: number, cat: any) => acc + (cat.items?.length || 0), 0) || 0;

	// Count skills
	const skillsCount = skills?.items?.length || 0;

	// Fetch individual counts and visitor stats
	const projectsCount = projects?.length || 0;
	const blogsCount = posts?.length || 0;
	const contactsCount = contacts?.length || 0;

	// Calculate techstack count manually since service doesn't provide it
	const techStackItemsCount =
		techstack?.categories?.reduce((acc: number, category: { items: unknown[] }) => {
			return acc + (category.items?.length || 0);
		}, 0) || 0;

	const visitorStats = await visitorService.getStats();
	const visitorLogs = await visitorService.getRecentLogs(10); // Fetch last 10 visitors

	// Serialize to plain objects to avoid "non-POJO" errors with Dates/Timestamps
	const serializedMessages = JSON.parse(JSON.stringify(recentMessages));
	const serializedPosts = JSON.parse(JSON.stringify(recentPosts));
	const serializedVisitorLogs = JSON.parse(JSON.stringify(visitorLogs));

	return {
		stats: {
			projects: projectsCount,
			blogs: blogsCount,
			contacts: contactsCount,
			techstack: techStackItemsCount,
			visitors: visitorStats,
			skills: skillsCount
		},
		recent: {
			messages: serializedMessages,
			posts: serializedPosts, // Use serialized to avoid date issues
			visitors: serializedVisitorLogs
		}
	};
};
