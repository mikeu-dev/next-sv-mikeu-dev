import type { LayoutServerLoad } from './$types';
import { socialsService } from '$lib/server/services/socials.service';
import { visitorService } from '$lib/server/services/visitor.service';
import { settingsService } from '$lib/server/services/settings.service';
import { showExperimentalFeature } from '$lib/flags';

export const load: LayoutServerLoad = async (event) => {
	const { locals } = event;

	// Melakukan fetch secara paralel untuk efisiensi.
	// Kita tidak melakukan 'await' langsung pada return untuk mengaktifkan streaming di SvelteKit.
	return {
		socials: socialsService
			.getSocials()
			.then((data) => (data as { links?: unknown[] })?.links || [])
			.catch(() => []),
		visitorStats: visitorService
			.getStats()
			.then((stats) => ({
				total: stats?.total || 0,
				today: stats?.today || 0
			}))
			.catch(() => ({ total: 0, today: 0 })),
		resumeUrls: settingsService
			.getResumeSettings()
			.then((resume) => ({
				en: resume?.resumeUrlEn || '',
				id: resume?.resumeUrlId || ''
			}))
			.catch(() => ({ en: '', id: '' })),
		user: locals.user,
		locale: locals.paraglide?.locale || 'id',
		flags: {
			showExperimentalFeature: await showExperimentalFeature()
		}
	};
};
