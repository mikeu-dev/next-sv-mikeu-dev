import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'pnpm run preview',
		url: 'http://127.0.0.1:4173',
		reuseExistingServer: !process.env.CI,
		env: {
			APP_ENV: 'test'
		}
	},
	use: {
		baseURL: 'http://127.0.0.1:4173',
		launchOptions: {
			args: [
				'--use-gl=angle',
				'--use-angle=swiftshader',
				'--enable-unsafe-swiftshader',
				'--ignore-gpu-blocklist',
				'--no-sandbox'
			]
		}
	},
	testDir: 'e2e'
});
