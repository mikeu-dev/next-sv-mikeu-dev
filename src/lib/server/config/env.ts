import { z } from 'zod';

const envSchema = z.object({
    // Firebase Admin SDK
    FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required'),
    FIREBASE_TYPE: z.string().min(1, 'FIREBASE_TYPE is required'),
    FIREBASE_PRIVATE_KEY_ID: z.string().min(1, 'FIREBASE_PRIVATE_KEY_ID is required'),
    FIREBASE_PRIVATE_KEY: z.string().min(1, 'FIREBASE_PRIVATE_KEY is required'),
    FIREBASE_CLIENT_EMAIL: z.string().email('FIREBASE_CLIENT_EMAIL must be valid email'),
    FIREBASE_CLIENT_ID: z.string().min(1, 'FIREBASE_CLIENT_ID is required'),
    FIREBASE_AUTH_URI: z.string().url('FIREBASE_AUTH_URI must be valid URL'),
    FIREBASE_TOKEN_URI: z.string().url('FIREBASE_TOKEN_URI must be valid URL'),
    FIREBASE_AUTH_PROVIDER_CERT_URL: z.string().url(),
    FIREBASE_CLIENT_CERT_URL: z.string().url(),
    FIREBASE_UNIVERSE_FDOMAIN: z.string().optional(),

    // Session Configuration
    SESSION_EXPIRES_DAYS: z.string().default('7'),

    // Owner Configuration
    OWNER_EMAIL: z.string().email('OWNER_EMAIL must be valid email'),

    // GitHub Storage
    GITHUB_ACCESS_TOKEN: z.string().min(1, 'GITHUB_ACCESS_TOKEN is required'),
    GITHUB_USERNAME: z.string().min(1, 'GITHUB_USERNAME is required'),
    GITHUB_BRANCH: z.string().default('main'),

    // Uploads
    UPLOADS_DIR: z.string().default('./uploads')
});

// Validate and export typed environment variables
export const env = envSchema.parse(process.env);

// Type for environment variables
export type Env = z.infer<typeof envSchema>;
