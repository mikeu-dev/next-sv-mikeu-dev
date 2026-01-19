import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, fetch }) => {
	const { index } = params;

	try {
		const response = await fetch('/api/socials');

		if (!response.ok) {
			throw error(404, 'Socials not found');
		}

		const data = await response.json();
		const linkIndex = parseInt(index);

		if (isNaN(linkIndex) || linkIndex < 0 || linkIndex >= data.links.length) {
			throw error(404, 'Social link not found');
		}

		return {
			index: linkIndex,
			link: data.links[linkIndex],
			allLinks: data.links
		};
	} catch (err) {
		throw error(500, 'Failed to load social link');
	}
};
