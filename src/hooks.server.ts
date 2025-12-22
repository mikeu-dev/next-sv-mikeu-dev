import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { AuthService } from '$lib/server/services/auth.service';
import { redirect } from '@sveltejs/kit';
import { env } from '$lib/server/config/env';
import { logError, logWarning } from '$lib/server/utils/logger';

const authService = new AuthService();

/**
 * Security headers middleware
 * Adds security headers to all responses
 */
const handleSecurityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Content Security Policy
	response.headers.set(
		'Content-Security-Policy',
		[
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
			"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
			"img-src 'self' data: https: blob:",
			"font-src 'self' https://fonts.gstatic.com",
			"connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://www.google-analytics.com",
			"frame-ancestors 'none'",
			"base-uri 'self'",
			"form-action 'self'"
		].join('; ')
	);

	// Prevent clickjacking
	response.headers.set('X-Frame-Options', 'DENY');

	// Prevent MIME sniffing
	response.headers.set('X-Content-Type-Options', 'nosniff');

	// Referrer policy
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	// Permissions policy
	response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

	// HSTS (only in production)
	if (process.env.NODE_ENV === 'production') {
		response.headers.set(
			'Strict-Transport-Security',
			'max-age=31536000; includeSubDomains; preload'
		);
	}

	return response;
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;
		event.locals.paraglide = { locale };

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

/**
 * Authentication middleware
 * Protects /admin routes and verifies owner email
 */
const handleAuth: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/admin')) {
		const session = event.cookies.get('__session');

		if (!session) {
			console.log('🔴 No session cookie found, redirecting to login');
			throw redirect(303, '/auth/login');
		}

		try {
			const decodedClaims = await authService.verifySessionCookie(session);

			console.log('🟢 Session verified for:', decodedClaims.email);
			console.log('🧐 Expected owner:', env.OWNER_EMAIL);

			// Verify owner email
			if (decodedClaims.email !== env.OWNER_EMAIL) {
				logWarning('Auth:OwnerCheck', 'Non-owner attempted to access admin', {
					email: decodedClaims.email,
					path: event.url.pathname
				});
				console.log('🔴 Email mismatch, redirecting to login');
				throw redirect(303, '/auth/login');
			}

			event.locals.user = decodedClaims;
		} catch (error) {
			logError('Auth:SessionVerification', error, {
				path: event.url.pathname
			});
			console.log('🔴 Session verification failed, redirecting to login', error);
			throw redirect(303, '/auth/login');
		}
	}
	return resolve(event);
};

export const handle: Handle = sequence(handleSecurityHeaders, handleParaglide, handleAuth);
