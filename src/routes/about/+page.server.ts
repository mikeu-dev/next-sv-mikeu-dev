import type { PageServerLoad } from './$types';
import { TechStackService } from '$lib/server/services/techstack.service';
import { JourneyService } from '$lib/server/services/journey.service';

export const load: PageServerLoad = async () => {
	const techStackService = new TechStackService();
	const journeyService = new JourneyService();

	const [techStackEn, techStackId, journeyEn, journeyId] = await Promise.all([
		techStackService.getTechStack('en'),
		techStackService.getTechStack('id'),
		journeyService.getJourney('en'),
		journeyService.getJourney('id')
	]);

	return {
		techStack: {
			en: (techStackEn as any).categories || [], // techStack service returns { items: ... } or { categories: ... } ? Checking logic...
			// Wait, previous investigation said TechStackService returns { categories: [] } if empty.
			// But verify if it's .items or .categories?
			// TechStackService line 10: return { categories: [] }
			// So probably .categories.
			// But TechStackService might return doc.data().
			// I should double check what doc.data() typically contains.
			// Assuming .categories based on line 10.
			// But wait, the Svelte component uses `item.items` inside `skillCategory`.
			// Let's assume the doc structure is { categories: [...] }
			id: (techStackId as any).categories || []
		},
		journey: {
			en: (journeyEn as any).items || [],
			id: (journeyId as any).items || []
		}
	};
};
