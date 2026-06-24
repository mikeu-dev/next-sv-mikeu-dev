import tailwindcss from '@tailwindcss/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import devtoolsJson from 'vite-plugin-devtools-json';
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default defineConfig({
	define: {
		// Replaced at build time so hero.svelte can show a real build date
		'import.meta.env.VITE_BUILD_DATE': JSON.stringify(new Date().toISOString())
	},
	server: {
		watch: {
			ignored: [
				'**/.svelte-kit/**',
				'**/node_modules/**',
				'**/static/**',
				'**/messages/**',
				'**/src/lib/paraglide/**'
			]
		}
	},
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
			strategy: ['url', 'cookie', 'baseLocale'],
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
					alias: {
						'$lib/components/guest/sections/hero/hero.svelte': require.resolve(
							'./src/lib/mocks/HeroMock.svelte'
						),
						'$lib/components/guest/sections/work/work.svelte': require.resolve(
							'./src/lib/mocks/EmptyMock.svelte'
						),
						'$lib/components/guest/sections/blog/latest-blogs.svelte': require.resolve(
							'./src/lib/mocks/EmptyMock.svelte'
						),
						'$lib/components/guest/sections/world/folded-world.svelte': require.resolve(
							'./src/lib/mocks/EmptyMock.svelte'
						),
						'$lib/components/guest/sections/contact/contact.svelte': require.resolve(
							'./src/lib/mocks/EmptyMock.svelte'
						)
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
						if (id.includes('three')) {
							return 'three';
						}
					}
				}
			}
		}
	},
	ssr: {
		noExternal: ['gsap', 'matter-js']
	}
});
