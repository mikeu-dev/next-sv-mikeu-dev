import { defineEnvVars } from '@sveltejs/kit/env';

// @migration-task Review usage of dynamic environment variables. They fall back to the empty string if not present, which may not be what you want.
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
	OWNER_EMAIL: { schema: (input) => input ?? '' }
});
