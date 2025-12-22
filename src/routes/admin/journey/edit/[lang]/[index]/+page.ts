import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, fetch }) => {
    const { lang, index } = params;

    if (lang !== 'en' && lang !== 'id') {
        throw error(400, 'Invalid language');
    }

    try {
        const response = await fetch(`/api/journey?lang=${lang}`);

        if (!response.ok) {
            throw error(404, 'Journey not found');
        }

        const data = await response.json();
        const itemIndex = parseInt(index);

        if (isNaN(itemIndex) || itemIndex < 0 || itemIndex >= data.items.length) {
            throw error(404, 'Journey item not found');
        }

        return {
            lang,
            index: itemIndex,
            item: data.items[itemIndex],
            allItems: data.items
        };
    } catch (err) {
        throw error(500, 'Failed to load journey');
    }
};
