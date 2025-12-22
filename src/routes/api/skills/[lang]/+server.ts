import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/firebase/firebase.server';
import { COLLECTIONS } from '$lib/server/firebase/collections';

export const PUT: RequestHandler = async ({ params, request }) => {
    const { lang } = params;

    if (lang !== 'en' && lang !== 'id') {
        return json({ error: 'Invalid language' }, { status: 400 });
    }

    try {
        const { items } = await request.json();

        // Validate data structure
        if (!Array.isArray(items)) {
            return json({ error: 'Invalid data structure' }, { status: 400 });
        }

        // Validate each item is a string
        for (const item of items) {
            if (typeof item !== 'string' || item.trim() === '') {
                return json({ error: 'Invalid skill item' }, { status: 400 });
            }
        }

        // Update Firestore
        await db.collection(COLLECTIONS.SKILLS).doc(lang).set({
            items,
            updatedAt: new Date()
        });

        return json({ success: true, message: 'Skills updated successfully' });
    } catch (error: any) {
        console.error('Update skills error:', error);
        return json({ error: error.message || 'Failed to update skills' }, { status: 500 });
    }
};

// Disable prerendering for this endpoint
export const prerender = false;
