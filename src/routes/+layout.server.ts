import type { LayoutServerLoad } from './$types';
import { socialsService } from '#lib/server/services/socials.service.js';
import { visitorService } from '#lib/server/services/visitor.service.js';
import { settingsService } from '#lib/server/services/settings.service.js';
import { showExperimentalFeature } from '#lib/flags.js';

export const load: LayoutServerLoad = async (event) => {
	const { locals } = event;

	// Awaited, not streamed: SvelteKit 3.0.0-next drops the HTTP status of a
	// streamed response, so with promises here every error page (404s included)
	// went out as 200. The three reads are cached and run in parallel.
	const [socials, visitorStats, resumeUrls] = await Promise.all([
		socialsService
			.getSocials()
			.then((data) => (data as { links?: unknown[] })?.links || [])
			.catch(() => []),
		visitorService
			.getStats()
			.then((stats) => ({
				total: stats?.total || 0,
				today: stats?.today || 0
			}))
			.catch(() => ({ total: 0, today: 0 })),
		settingsService
			.getResumeSettings()
			.then((resume) => ({
				en: resume?.resumeUrlEn || '',
				id: resume?.resumeUrlId || ''
			}))
			.catch(() => ({ en: '', id: '' }))
	]);

	return {
		socials,
		visitorStats,
		resumeUrls,
		user: locals.user,
		locale: locals.paraglide?.locale || 'id',
		flags: {
			showExperimentalFeature: await showExperimentalFeature()
		}
	};
};
