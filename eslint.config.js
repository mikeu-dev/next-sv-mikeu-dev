// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format

import prettier from 'eslint-config-prettier';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

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
			'**/node_modules/**',
			'.svelte-kit/**',
			'.vercel/**',
			'build/**',
			'dist/**',
			'static/**',
			'src/service-worker.ts',
			'src/lib/paraglide/**',
			'src/paraglide/**'
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
