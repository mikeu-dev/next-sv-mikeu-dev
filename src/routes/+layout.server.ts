import type { LayoutServerLoad } from './$types';
import { socialsService } from '$lib/server/services/socials.service';
import { visitorService } from '$lib/server/services/visitor.service';
import { settingsService } from '$lib/server/services/settings.service';
import type { Config } from '@sveltejs/adapter-vercel';
import { showExperimentalFeature } from '$lib/flags';

import { building } from '$app/environment';

export const config: Config = {
	runtime: 'nodejs22.x',
	memory: 1024,
	regions: ['sin1']
};

export const load: LayoutServerLoad = async (event) => {
	const { locals, setHeaders } = event;
	// Enable Edge Caching for layout data (Socials, Visitor Stats, etc.)
	// Only set headers when not building (prerendering) to avoid conflicts
	if (!building) {
		setHeaders({
			'cache-control': 'public, s-maxage=300, stale-while-revalidate=1800'
		});
	}

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
		locale: locals.paraglide?.locale || 'en',
		flags: {
			showExperimentalFeature: await showExperimentalFeature()
		}
	};
};
