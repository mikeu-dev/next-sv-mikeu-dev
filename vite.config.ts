import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import devtoolsJson from 'vite-plugin-devtools-json';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
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
		sveltekit({
			// Consult https://svelte.dev/docs/kit/integrations
			// for more information about preprocessors
			preprocess: [vitePreprocess(), mdsvex({ extensions: ['.svx'] })],
			extensions: ['.svelte', '.svx'],
			adapter: adapter({ runtime: 'nodejs22.x', memory: 1024, regions: ['sin1'] }),
			alias: { '@/*': 'src/*', '@lib/*': 'src/lib/*' },
			paths: { relative: false }
		}),
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
					// vitest 4: browser mode is enabled via `browser.enabled`, not `test.environment`
					browser: {
						enabled: true,
						provider: playwright(),
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
		reportCompressedSize: false
	},
	// manualChunks lives under the `client` environment (not top-level `build.rollupOptions`)
	// because SvelteKit 3's service-worker build is its own Vite environment with
	// `codeSplitting: false`, and a top-level manualChunks cascades into every environment —
	// which Rolldown rejects when codeSplitting is off.
	environments: {
		client: {
			build: {
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
			}
		}
	},
	ssr: {
		noExternal: ['gsap', 'matter-js']
	}
});
