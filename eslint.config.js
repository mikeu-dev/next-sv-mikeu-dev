// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format

import prettier from 'eslint-config-prettier';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import { loadConfig } from '@sveltejs/load-config';

const svelteConfig = (await loadConfig('./', { traverse: false }))?.config;

// `eslint --cache` serializes languageOptions and refuses function values,
// but the SvelteKit config carries some (e.g. `kit.typescript.config`).
// Give the cache a function-free snapshot via a non-enumerable toJSON while
// the parser keeps the real object.
if (svelteConfig) {
	Object.defineProperty(svelteConfig, 'toJSON', {
		enumerable: false,
		value: () =>
			JSON.parse(
				JSON.stringify({ ...svelteConfig }, (_key, value) =>
					typeof value === 'function' ? undefined : value
				)
			)
	});
}

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	{
		linterOptions: {
			reportUnusedDisableDirectives: 'off'
		}
	},
	{
		// Global ignores
		ignores: [
			'.agents/**',
			'**/node_modules/**',
			'.svelte-kit/**',
			'.vercel/**',
			'.output/**',
			'build/**',
			'dist/**',
			'static/**',
			'messages/**',
			'src/service-worker/**',
			'src/lib/paraglide/**',
			'src/paraglide/**',
			'src/lib/server/scripts/**',
			'**/*.spec.ts',
			'**/*.test.ts',
			'storybook-static/**'
		]
	},
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: {
			'no-undef': 'off',
			'no-unused-vars': 'off', // Let TypeScript handle this
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_'
				}
			],
			'svelte/no-navigation-without-resolve': 'off' // Disable for faster lint/check
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js', 'src/**/*.ts', 'src/**/*.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	},
	{
		files: ['*.config.js', '*.config.ts', 'vitest.config.ts', 'playwright.config.ts'],
		...ts.configs.disableTypeChecked
	}
);
