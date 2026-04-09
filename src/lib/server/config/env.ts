import { z } from 'zod';

const envSchema = z.object({
	// Firebase Admin SDK
	FIREBASE_PROJECT_ID: z.string().optional(),
	FIREBASE_PRIVATE_KEY: z.string().optional(),
	FIREBASE_CLIENT_EMAIL: z.string().optional(),

	// Session Configuration
	SESSION_EXPIRES_DAYS: z.string().default('7'),

	// Owner & Admin Configuration
	OWNER_EMAIL: z.string().optional(),
	ADMIN_USERNAME: z.string().optional(),
	ADMIN_PASSWORD: z.string().optional(),

	// GitHub Storage
	GITHUB_ACCESS_TOKEN: z.string().optional(),
	GITHUB_USERNAME: z.string().optional(),
	GITHUB_BRANCH: z.string().default('main'),

	// Uploads
	UPLOADS_DIR: z.string().default('./uploads')
});

import { env as dynamicPrivateEnv } from '$env/dynamic/private';

// Parse with error handling
let parsedEnv: z.infer<typeof envSchema>;

try {
	parsedEnv = envSchema.parse(dynamicPrivateEnv);
} catch (error) {
	console.error('❌ Environment variable validation failed:');
	if (error instanceof z.ZodError) {
		error.issues.forEach((issue) => {
			console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
		});
	}
	console.error('\n⚠️  Please check your .env file and ensure all required variables are set.');
	console.error('📝 See .env.example for reference.\n');

	// In development, use empty object to allow server to start
	// In production, this should fail
	if (process.env.NODE_ENV === 'production') {
		throw error;
	}

	parsedEnv = {} as z.infer<typeof envSchema>;
}

export const env = parsedEnv;

// Type for environment variables
export type Env = z.infer<typeof envSchema>;

// Helper to check if required env vars are set
export function checkRequiredEnvVars(): boolean {
	const required = [
		'FIREBASE_PROJECT_ID',
		'FIREBASE_PRIVATE_KEY',
		'FIREBASE_CLIENT_EMAIL',
		'OWNER_EMAIL',
		'ADMIN_USERNAME',
		'ADMIN_PASSWORD',
		'GITHUB_ACCESS_TOKEN',
		'GITHUB_USERNAME'
	];

	const missing = required.filter((key) => !dynamicPrivateEnv[key]);

	if (missing.length > 0) {
		console.warn('⚠️  Missing required environment variables:');
		missing.forEach((key) => console.warn(`  - ${key}`));
		console.warn('Some features may not work correctly.\n');
		return false;
	}

	return true;
}

// Check on module load (only in development)
if (process.env.NODE_ENV !== 'production') {
	checkRequiredEnvVars();
}
