/// <reference types="@vitest/browser/matchers" />
/// <reference types="@vitest/browser/providers/playwright" />
import { vi } from 'vitest';

// Mock SvelteKit environment modules
vi.mock('$app/env', () => ({
	browser: true,
	dev: true,
	building: false,
	version: 'test'
}));

vi.mock('$app/env/public', () => ({
	PUBLIC_LOTTIE_URL: '',
	PUBLIC_CONTACT_EMAIL: '',
	PUBLIC_TRAKTEER_URL: '',
	PUBLIC_IMAGE_CDN_URL: '',
	PUBLIC_VAPID_KEY: ''
}));
