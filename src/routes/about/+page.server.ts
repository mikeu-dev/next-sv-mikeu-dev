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
			en: (techStackEn as { categories: unknown[] }).categories || [],
			id: (techStackId as { categories: unknown[] }).categories || []
		},
		journey: {
			en: (journeyEn as { items: unknown[] }).items || [],
			id: (journeyId as { items: unknown[] }).items || []
		}
	};
};
