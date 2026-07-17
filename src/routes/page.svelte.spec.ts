import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render the page and find h1', async () => {
		render(Page, {
			target: document.body,
			props: {
				data: {
					skills: ['Svelte', 'TypeScript'],
					projects: [],
					latestPosts: [],
					socials: Promise.resolve([]),
					visitorStats: Promise.resolve({ total: 0, today: 0 }),
					resumeUrls: Promise.resolve({ en: '', id: '' }),
					user: undefined,
					locale: 'en',
					flags: {
						showExperimentalFeature: false
					}
				}
			}
		});

		// The h1 should be from the mocked HeroSection
		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toBeInTheDocument();
	});
});
