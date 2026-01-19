import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, fetch }) => {
	const { lang, index } = params;

	if (lang !== 'en' && lang !== 'id') {
		throw error(400, 'Invalid language');
	}

	try {
		const response = await fetch(`/api/techstack?lang=${lang}`);

		if (!response.ok) {
			throw error(404, 'Techstack not found');
		}

		const data = await response.json();
		const categoryIndex = parseInt(index);

		// Handle API response structure (items or categories)
		const categories = data.categories || data.items || [];

		if (isNaN(categoryIndex) || categoryIndex < 0 || categoryIndex >= categories.length) {
			throw error(404, 'Category not found');
		}

		return {
			lang,
			index: categoryIndex,
			category: categories[categoryIndex],
			allCategories: categories
		};
	} catch (err) {
		throw error(500, 'Failed to load techstack');
	}
};
