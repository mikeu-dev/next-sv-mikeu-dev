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
				find: /^svelte-canvas-confetti$/,
				replacement: require.resolve('svelte-canvas-confetti')
			}
		]
	},
	plugins: [
		sveltekit(),
		tailwindcss(),
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
		chunkSizeWarningLimit: 1000,
		sourcemap: false,
		reportCompressedSize: false,
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					if (id.includes('node_modules')) {
						if (id.includes('@lottiefiles/dotlottie-svelte') || id.includes('lottie-web')) {
							return 'lottie';
						}
						if (id.includes('firebase')) {
							return 'firebase';
						}
						if (id.includes('gsap') || id.includes('matter-js')) {
							return 'animation';
						}
					}
				}
			}
		}
	},
	ssr: {
		noExternal: ['gsap']
	}
});
