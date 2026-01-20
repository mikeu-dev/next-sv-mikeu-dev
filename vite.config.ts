import tailwindcss from '@tailwindcss/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import devtoolsJson from 'vite-plugin-devtools-json';
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default defineConfig({
	resolve: {
		alias: [
			{
				find: /^@splidejs\/svelte-splide$/,
				replacement: require.resolve('@splidejs/svelte-splide')
			},
			{
				find: /^svelte-canvas-confetti$/,
				replacement: require.resolve('svelte-canvas-confetti')
			},
			{
				find: /^@splidejs\/splide$/,
				replacement: require.resolve('@splidejs/splide')
			}
		]
	},
	plugins: [
		tailwindcss(),
		sveltekit(),
		devtoolsJson(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			disableAsyncLocalStorage: true
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					environment: 'browser',
					browser: {
						enabled: true,
						provider: 'playwright',
						instances: [{ browser: 'chromium' }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	},
	build: {
		chunkSizeWarningLimit: 6000,
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					if (id.includes('node_modules')) {
						if (id.includes('@lottiefiles/dotlottie-svelte') || id.includes('lottie-web')) {
							return 'lottie';
						}
					}
				}
			}
		}
	}
});
