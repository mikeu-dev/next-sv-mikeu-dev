import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/firebase/firebase.server';
import { COLLECTIONS } from '$lib/server/firebase/collections';

// Import data lokal
import { techStack } from '$lib/data/techstack';
import { journey } from '$lib/data/journey';
import { skills } from '$lib/data/skills';
import { socialLinks } from '$lib/data/socials';

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

            return json({
                success: true,
                message: 'Migration completed',
                results
            });
        }

        return json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('Migration error:', error);
        return json({ error: error.message }, { status: 500 });
    }
}
