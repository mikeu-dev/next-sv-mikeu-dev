/// <reference types="@vitest/browser/matchers" />
/// <reference types="@vitest/browser/providers/playwright" />
import { vi } from 'vitest';

// Mock SvelteKit environment modules
vi.mock('$app/environment', () => ({
	browser: true,
	dev: true,
	building: false,
	version: 'test'
}));

vi.mock('$env/dynamic/public', () => ({
	env: {}
}));
