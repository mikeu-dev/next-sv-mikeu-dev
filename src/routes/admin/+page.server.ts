import { ProjectsService } from '$lib/server/services/projects.service';
import { ProjectsRepository } from '$lib/server/repositories/projects.repository';
import { blogService } from '$lib/server/services/blog.service';
import { ContactsService } from '$lib/server/services/contacts.service';
import { TechStackService } from '$lib/server/services/techstack.service';
import { SkillsService } from '$lib/server/services/skills.service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const projectsService = new ProjectsService(new ProjectsRepository());
    const contactsService = new ContactsService();
    const techStackService = new TechStackService();
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
        .sort((a, b) => {
            const timeA = a.createdAt ? (a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime()) : 0;
            const timeB = b.createdAt ? (b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime()) : 0;
            return timeB - timeA;
        })
        .slice(0, 5);

    // Sort recent posts
    const recentPosts = (posts || [])
        .sort((a, b) => {
            const timeA = a.date ? new Date(a.date).getTime() : 0;
            const timeB = b.date ? new Date(b.date).getTime() : 0;
            return timeB - timeA;
        })
        .slice(0, 5);

    // Count tech stack items (sum of items in all categories)
    const techStackCount = techstack?.categories?.reduce((acc: number, cat: any) => acc + (cat.items?.length || 0), 0) || 0;

    // Count skills
    const skillsCount = skills?.items?.length || 0;

    return {
        stats: {
            projects: projects?.length || 0,
            blogs: posts?.length || 0,
            contacts: contacts?.length || 0,
            techstack: techStackCount,
            skills: skillsCount
        },
        recent: {
            messages: recentMessages,
            posts: recentPosts
        }
    };
};
