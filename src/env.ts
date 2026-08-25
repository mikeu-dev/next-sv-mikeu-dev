import { defineEnvVars } from '@sveltejs/kit/env';

// Reviewed: every var below falls back to '' if unset, matching the old $env/dynamic/private
// behavior these replaced (bare `undefined`). All of them are actually set in .env for this
// project; consumers that gate on these (e.g. handlePublicApi's EXTERNAL_API_KEY check,
// firebase.server.ts's Firebase Admin init) already fail closed rather than fail open when empty.
export const variables = defineEnvVars({
	FLAGS_SECRET: { static: true },
	PUBLIC_LOTTIE_URL: { public: true, schema: (input) => input ?? '' },
	PUBLIC_CONTACT_EMAIL: { public: true, static: true },
	PUBLIC_TRAKTEER_URL: { public: true, schema: (input) => input ?? '' },
	CRON_SECRET: { schema: (input) => input ?? '' },
	PUBLIC_IMAGE_CDN_URL: { public: true, schema: (input) => input ?? '' },
	UPLOADS_DIR: { schema: (input) => input ?? '' },
	SESSION_EXPIRES_DAYS: { schema: (input) => input ?? '' },
	PUBLIC_VAPID_KEY: { public: true, schema: (input) => input ?? '' },
	PRIVATE_VAPID_KEY: { schema: (input) => input ?? '' },
	OWNER_EMAIL: { schema: (input) => input ?? '' },
	// `$env/dynamic/private` (still used by firebase.server.ts, github-storage.service.ts, and
	// src/lib/server/config/env.ts) is now just a re-export of these declared vars — anything not
	// listed here silently reads as undefined instead of the real value (see commit 0f337a2).
	FIREBASE_PROJECT_ID: { schema: (input) => input ?? '' },
	FIREBASE_PRIVATE_KEY: { schema: (input) => input ?? '' },
	FIREBASE_CLIENT_EMAIL: { schema: (input) => input ?? '' },
	GITHUB_ACCESS_TOKEN: { schema: (input) => input ?? '' },
	GITHUB_USERNAME: { schema: (input) => input ?? '' },
	GITHUB_REPO: { schema: (input) => input ?? '' },
	GITHUB_BRANCH: { schema: (input) => input ?? '' },
	ADMIN_USERNAME: { schema: (input) => input ?? '' },
	ADMIN_PASSWORD: { schema: (input) => input ?? '' },
	GOOGLE_GEMINI_API_KEY: { schema: (input) => input ?? '' },
	EXTERNAL_API_KEY: { schema: (input) => input ?? '' }
});
