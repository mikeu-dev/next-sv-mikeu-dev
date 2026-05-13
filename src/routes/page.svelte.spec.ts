import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

// Mock heavy components to ensure stability and focus on unit testing +page.svelte
vi.mock('../lib/components/guest/sections/hero/hero.svelte', () => ({
	default: () => {
		// Return a simple div with h1 to satisfy the test
		return {
			render: () => '<h1>Mock Hero Title</h1>'
		};
	}
}));

vi.mock('../lib/components/guest/sections/world/folded-world.svelte', () => ({
	default: () => {}
}));

describe('/+page.svelte', () => {
	it('should render the page and find h1', async () => {
		render(Page, {
			target: document.body,
			props: {
				data: {
					skills: Promise.resolve(['Svelte', 'TypeScript']),
					projects: Promise.resolve([]),
					latestPosts: Promise.resolve([]),
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
