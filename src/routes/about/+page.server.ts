import type { PageServerLoad } from './$types';
import { TechStackService } from '$lib/server/services/techstack.service';
import { JourneyService } from '$lib/server/services/journey.service';

export const prerender = false;

export const load: PageServerLoad = async () => {
	const techStackService = new TechStackService();
	const journeyService = new JourneyService();

	try {
		const [techStackEn, techStackId, journeyEn, journeyId] = await Promise.all([
			techStackService.getTechStack('en').catch(() => null),
			techStackService.getTechStack('id').catch(() => null),
			journeyService.getJourney('en').catch(() => null),
			journeyService.getJourney('id').catch(() => null)
		]);

		return {
			techStack: {
				en: (techStackEn as { categories?: unknown[] })?.categories || [],
				id: (techStackId as { categories?: unknown[] })?.categories || []
			},
			journey: {
				en: (journeyEn as { items?: unknown[] })?.items || [],
				id: (journeyId as { items?: unknown[] })?.items || []
			}
		};
	} catch (error) {
		console.error('About Page Load Error:', error);
		return {
			techStack: { en: [], id: [] },
			journey: { en: [], id: [] }
		};
	}
};
