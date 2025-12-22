import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { SocialsService } from '$lib/server/services/socials.service';
import { db } from '$lib/server/firebase/firebase.server';
import { COLLECTIONS } from '$lib/server/firebase/collections';

const socialsService = new SocialsService();

export async function GET() {
    try {
        const data = await socialsService.getSocials();
        return json(data);
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
}

export const PUT: RequestHandler = async ({ request }) => {
    try {
        const { links } = await request.json();

        // Validate data structure
        if (!Array.isArray(links)) {
            return json({ error: 'Invalid data structure' }, { status: 400 });
        }

        // Validate each link
        for (const link of links) {
            if (!link.label || !link.href || !link.iconName || !link.color) {
                return json({ error: 'Invalid link structure' }, { status: 400 });
            }
        }

        // Update Firestore
        await db.collection(COLLECTIONS.SOCIALS).doc('default').set({
            links,
            updatedAt: new Date()
        });

        return json({ success: true, message: 'Socials updated successfully' });
    } catch (error: any) {
        console.error('Update socials error:', error);
        return json({ error: error.message || 'Failed to update socials' }, { status: 500 });
    }
};

// Disable prerendering for this endpoint
export const prerender = false;
