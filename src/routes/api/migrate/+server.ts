import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/firebase/firebase.server';
import { COLLECTIONS } from '$lib/server/firebase/collections';

// Import data lokal
import { techStack } from '$lib/data/techstack';
import { journey } from '$lib/data/journey';
import { skills } from '$lib/data/skills';
import { socialLinks } from '$lib/data/socials';
import { projects } from '$lib/data/projects';

export async function POST({ request }: RequestEvent) {
    try {
        const { action } = await request.json();

        if (action === 'migrate-all') {
            const results = [];

            // Migrate TechStack
            try {
                // Serialize techstack data - convert icon components to icon names
                const serializeTechStack = (categories: any[]) => {
                    return categories.map(category => ({
                        category: category.category,
                        description: category.description,
                        items: category.items.map((item: any) => ({
                            name: item.name,
                            // Extract icon name from component function name
                            iconName: item.icon?.name || 'SiDefault',
                            color: item.color,
                            url: item.url
                        }))
                    }));
                };

                await db.collection(COLLECTIONS.TECHSTACK).doc('en').set({
                    categories: serializeTechStack(techStack.en),
                    updatedAt: new Date()
                });

                await db.collection(COLLECTIONS.TECHSTACK).doc('id').set({
                    categories: serializeTechStack(techStack.id),
                    updatedAt: new Date()
                });
                results.push({ collection: 'techstack', status: 'success' });
            } catch (error: any) {
                results.push({ collection: 'techstack', status: 'error', message: error.message });
            }

            // Migrate Journey
            try {
                await db.collection(COLLECTIONS.JOURNEY).doc('en').set({
                    items: journey.en,
                    updatedAt: new Date()
                });

                await db.collection(COLLECTIONS.JOURNEY).doc('id').set({
                    items: journey.id,
                    updatedAt: new Date()
                });
                results.push({ collection: 'journey', status: 'success' });
            } catch (error: any) {
                results.push({ collection: 'journey', status: 'error', message: error.message });
            }

            // Migrate Skills
            try {
                await db.collection(COLLECTIONS.SKILLS).doc('en').set({
                    items: skills.en,
                    updatedAt: new Date()
                });

                await db.collection(COLLECTIONS.SKILLS).doc('id').set({
                    items: skills.id,
                    updatedAt: new Date()
                });
                results.push({ collection: 'skills', status: 'success' });
            } catch (error: any) {
                results.push({ collection: 'skills', status: 'error', message: error.message });
            }

            // Migrate Socials
            try {
                // Serialize social links - convert icon components to icon names
                const serializeSocials = (links: any[]) => {
                    return links.map(link => ({
                        href: link.href,
                        // Extract icon name from component function name
                        iconName: link.icon?.name || 'Mail',
                        color: link.color,
                        label: link.label
                    }));
                };

                await db.collection(COLLECTIONS.SOCIALS).doc('default').set({
                    links: serializeSocials(socialLinks),
                    updatedAt: new Date()
                });
                results.push({ collection: 'socials', status: 'success' });
            } catch (error: any) {
                results.push({ collection: 'socials', status: 'error', message: error.message });
            }

            // Migrate Projects - NEW BILINGUAL FORMAT
            try {
                // Group projects by base ID (assuming EN and ID versions have same base structure)
                const projectPairs = new Map<string, { en?: any; id?: any }>();

                // Group EN and ID projects
                projects.en.forEach((project: any) => {
                    const baseId = project.id;
                    if (!projectPairs.has(baseId)) {
                        projectPairs.set(baseId, {});
                    }
                    projectPairs.get(baseId)!.en = project;
                });

                projects.id.forEach((project: any) => {
                    const baseId = project.id;
                    if (!projectPairs.has(baseId)) {
                        projectPairs.set(baseId, {});
                    }
                    projectPairs.get(baseId)!.id = project;
                });

                // Create bilingual projects
                const bilingualProjects: any[] = [];
                for (const [baseId, pair] of projectPairs.entries()) {
                    const enProject = pair.en;
                    const idProject = pair.id;
                    const baseProject = enProject || idProject;

                    if (!baseProject) continue;

                    // Serialize tags
                    const serializeTags = (tags: any[]) => {
                        return tags?.map((tag: any) => ({
                            name: tag.name,
                            iconName: tag.icon?.name || 'SiDefault',
                            color: tag.color,
                            url: tag.url
                        })) || [];
                    };

                    const bilingualProject = {
                        title_en: enProject?.title || idProject?.title || 'Untitled',
                        title_id: idProject?.title || enProject?.title || 'Tanpa Judul',
                        description_en: enProject?.description || idProject?.description || 'No description',
                        description_id: idProject?.description || enProject?.description || 'Tidak ada deskripsi',
                        slug: baseProject.slug || baseId,
                        content: baseProject.content || '',
                        thumbnailUrl: baseProject.thumbnailUrl || '',
                        imagesUrl: baseProject.imagesUrl || [],
                        repoUrl: baseProject.repoUrl || '',
                        demoUrl: baseProject.demoUrl || '',
                        published: baseProject.published !== false,
                        pinned: baseProject.pinned || false,
                        tags: serializeTags(baseProject.tags),
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };

                    bilingualProjects.push({ id: baseId, data: bilingualProject });
                }

                // Save bilingual projects
                for (const project of bilingualProjects) {
                    await db.collection(COLLECTIONS.PROJECTS).doc(project.id).set(project.data);
                }

                results.push({
                    collection: 'projects',
                    status: 'success',
                    message: `Migrated ${bilingualProjects.length} bilingual projects`
                });
            } catch (error: any) {
                results.push({ collection: 'projects', status: 'error', message: error.message });
            }

            return json({
                success: true,
                message: 'Migration completed',
                results
            });
        }

        // New action: Convert existing projects to bilingual format
        if (action === 'convert-projects') {
            const logs: string[] = [];

            try {
                // 1. Fetch all existing projects
                logs.push('📊 Fetching all projects from Firestore...');
                const snapshot = await db.collection(COLLECTIONS.PROJECTS).get();
                const oldProjects: any[] = [];

                snapshot.forEach((doc) => {
                    oldProjects.push({ id: doc.id, ...doc.data() });
                });

                logs.push(`Found ${oldProjects.length} projects`);

                // Check if already migrated
                const alreadyMigrated = oldProjects.every((p: any) =>
                    p.title_id && p.title_en && p.description_id && p.description_en
                );

                if (alreadyMigrated && oldProjects.length > 0) {
                    logs.push('✅ All projects already in bilingual format!');
                    return json({
                        success: true,
                        message: 'No conversion needed - all projects already in bilingual format',
                        oldCount: oldProjects.length,
                        newCount: oldProjects.length,
                        alreadyMigrated: true,
                        logs
                    });
                }

                // 2. Group projects by slug
                logs.push('📦 Grouping projects by slug...');
                const projectGroups = new Map<string, { en?: any; id?: any }>();

                oldProjects.forEach((project) => {
                    // Skip if already in new format
                    if (project.title_id && project.title_en) {
                        logs.push(`⏭️  Skipping ${project.title_en} - already migrated`);
                        return;
                    }

                    // Extract base slug and language from document ID
                    // Handle both old formats:
                    // 1. Documents with -en/-id suffix (from migrate-all)
                    // 2. Documents with lang field
                    let slug = project.slug || project.id;
                    let lang = project.lang || 'en';

                    // Check if ID ends with -en or -id
                    if (project.id.endsWith('-en')) {
                        slug = project.id.replace(/-en$/, '');
                        lang = 'en';
                    } else if (project.id.endsWith('-id')) {
                        slug = project.id.replace(/-id$/, '');
                        lang = 'id';
                    }

                    if (!projectGroups.has(slug)) {
                        projectGroups.set(slug, {});
                    }

                    const group = projectGroups.get(slug)!;
                    if (lang === 'en') {
                        group.en = project;
                    } else if (lang === 'id') {
                        group.id = project;
                    }
                    logs.push(`  Added ${project.title} (${lang}) to group "${slug}"`);
                });

                logs.push(`Grouped into ${projectGroups.size} unique projects`);

                if (projectGroups.size === 0) {
                    logs.push('⚠️  No projects need conversion');
                    return json({
                        success: true,
                        message: 'No projects need conversion',
                        oldCount: oldProjects.length,
                        newCount: oldProjects.length,
                        logs
                    });
                }

                // 3. Convert to bilingual format
                logs.push('🔄 Converting to bilingual format...');
                const newProjects: any[] = [];
                const projectsToDelete: string[] = [];

                for (const [slug, group] of projectGroups.entries()) {
                    const enProject = group.en;
                    const idProject = group.id;
                    const baseProject = enProject || idProject;
                    if (!baseProject) continue;

                    const newProject = {
                        title_en: enProject?.title || idProject?.title || 'Untitled',
                        title_id: idProject?.title || enProject?.title || 'Tanpa Judul',
                        description_en: enProject?.description || idProject?.description || 'No description',
                        description_id: idProject?.description || enProject?.description || 'Tidak ada deskripsi',
                        slug: baseProject.slug || slug,
                        thumbnailUrl: baseProject.thumbnailUrl,
                        imagesUrl: baseProject.imagesUrl,
                        repoUrl: baseProject.repoUrl,
                        demoUrl: baseProject.demoUrl,
                        published: baseProject.published || false,
                        pinned: baseProject.pinned || false,
                        tags: baseProject.tags,
                        content: baseProject.content,
                        createdAt: baseProject.createdAt || new Date(),
                        updatedAt: new Date(),
                    };

                    const newId = enProject?.id || idProject?.id || slug;
                    newProjects.push({ id: newId, data: newProject });

                    // Mark old projects for deletion
                    if (enProject) projectsToDelete.push(enProject.id);
                    if (idProject && idProject.id !== enProject?.id) projectsToDelete.push(idProject.id);

                    logs.push(`  ✓ Converted: ${newProject.title_en} / ${newProject.title_id}`);
                }

                // 4. Delete old projects
                logs.push(`🗑️  Deleting ${projectsToDelete.length} old project documents...`);
                const batch = db.batch();
                projectsToDelete.forEach((id) => {
                    const docRef = db.collection(COLLECTIONS.PROJECTS).doc(id);
                    batch.delete(docRef);
                });
                await batch.commit();
                logs.push('✅ Old projects deleted');

                // 5. Save new projects
                logs.push(`💾 Saving ${newProjects.length} bilingual projects...`);
                for (const project of newProjects) {
                    await db.collection(COLLECTIONS.PROJECTS).doc(project.id).set(project.data);
                    logs.push(`  ✓ Saved: ${project.data.title_en}`);
                }

                logs.push('✨ Conversion completed successfully!');

                return json({
                    success: true,
                    message: `Successfully converted ${newProjects.length} projects to bilingual format`,
                    oldCount: oldProjects.length,
                    newCount: newProjects.length,
                    deletedCount: projectsToDelete.length,
                    logs
                });

            } catch (error: any) {
                console.error('Conversion error:', error);
                return json(
                    {
                        success: false,
                        error: error.message,
                        stack: error.stack,
                        logs
                    },
                    { status: 500 }
                );
            }
        }

        return json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('Migration error:', error);
        return json({ error: error.message }, { status: 500 });
    }
}
