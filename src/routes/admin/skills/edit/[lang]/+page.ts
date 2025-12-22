import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, fetch }) => {
    const { lang } = params;

    if (lang !== 'en' && lang !== 'id') {
        throw error(400, 'Invalid language');
    }

    try {
        const response = await fetch(`/api/skills?lang=${lang}`);

        if (!response.ok) {
            throw error(404, 'Skills not found');
        }

        const data = await response.json();

        return {
            lang,
            items: data.items || []
        };
    } catch (err) {
        throw error(500, 'Failed to load skills');
    }
};
