import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { AuthService } from '$lib/server/services/auth.service';
import { redirect } from '@sveltejs/kit';
import { env } from '$lib/server/config/env';
import { logError, logWarning } from '$lib/server/utils/logger';
import { VisitorService } from '$lib/server/services/visitor.service';

const authService = new AuthService();
const visitorService = new VisitorService();

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
			"connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://www.google-analytics.com https://cdn.jsdelivr.net https://unpkg.com https://lottie.host",
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
 * Visitor tracking middleware
 * Checks for cookie and increments counter if new visitor
 */
const handleVisitor: Handle = async ({ event, resolve }) => {
	const VISITOR_COOKIE = 'visitor_log';
	const hasVisited = event.cookies.get(VISITOR_COOKIE);

	if (!hasVisited && !event.url.pathname.startsWith('/admin')) {
		// Only track public pages
		try {
			await visitorService.increment();

			// Set cookie for 24 hours
			event.cookies.set(VISITOR_COOKIE, 'true', {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 // 1 day
			});
		} catch (error) {
			console.error('Failed to track visitor', error);
		}
	}

	return resolve(event);
};

/**
 * Authentication middleware
 * Protects /admin routes and verifies owner email
 */
const handleAuth: Handle = async ({ event, resolve }) => {
	const session = event.cookies.get('__session');

	if (session) {
		try {
			const decodedClaims = await authService.verifySessionCookie(session);
			event.locals.user = decodedClaims;
		} catch (error) {
			// Session invalid/expired, locals.user remains undefined
			console.log('Session verification failed or expired');
		}
	}

	// Admin rote protection
	if (event.url.pathname.startsWith('/admin')) {
		if (!event.locals.user) {
			console.log('🔴 No valid session found for admin route, redirecting to login');
			throw redirect(303, '/auth/login');
		}

		// Verify owner email
		if (event.locals.user.email !== env.OWNER_EMAIL) {
			logWarning('Auth:OwnerCheck', 'Non-owner attempted to access admin', {
				email: event.locals.user.email,
				path: event.url.pathname
			});
			console.log('🔴 Email mismatch, redirecting to login');
			throw redirect(303, '/auth/login');
		}
	}

	return resolve(event);
};

export const handle: Handle = sequence(handleSecurityHeaders, handleParaglide, handleVisitor, handleAuth);
