import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

// Mock heavy components to ensure stability and focus on unit testing +page.svelte
// Mocks must be registered before the component that uses them is imported
vi.mock('../lib/components/guest/sections/hero/hero.svelte', () => ({
	default: () => {
		const h1 = document.createElement('h1');
		h1.textContent = 'Mock Hero Title';
		document.body.appendChild(h1);
		return () => {
			if (h1.parentNode) h1.parentNode.removeChild(h1);
		};
	}
}));

vi.mock('../lib/components/guest/sections/work/work.svelte', () => ({
	default: () => {
		const div = document.createElement('div');
		div.textContent = 'Mock Work Section';
		document.body.appendChild(div);
		return () => {
			if (div.parentNode) div.parentNode.removeChild(div);
		};
	}
}));

vi.mock('../lib/components/guest/sections/blog/latest-blogs.svelte', () => ({
	default: () => {
		const div = document.createElement('div');
		div.textContent = 'Mock Blog Section';
		document.body.appendChild(div);
		return () => {
			if (div.parentNode) div.parentNode.removeChild(div);
		};
	}
}));

vi.mock('../lib/components/guest/sections/world/folded-world.svelte', () => ({
	default: () => {
		const div = document.createElement('div');
		div.textContent = 'Mock World Section';
		document.body.appendChild(div);
		return () => {
			if (div.parentNode) div.parentNode.removeChild(div);
		};
	}
}));

vi.mock('../lib/components/guest/sections/contact/contact.svelte', () => ({
	default: () => {
		const div = document.createElement('div');
		div.textContent = 'Mock Contact Section';
		document.body.appendChild(div);
		return () => {
			if (div.parentNode) div.parentNode.removeChild(div);
		};
	}
}));

import Page from './+page.svelte';

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
