import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { AuthService } from '$lib/server/services/auth.service';
import { redirect } from '@sveltejs/kit';
import { env } from '$lib/server/config/env';
import { logWarning } from '$lib/server/utils/logger';
import { VisitorService } from '$lib/server/services/visitor.service';
import { UAParser } from 'ua-parser-js';
import { building } from '$app/environment';

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
			"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://*.googlesyndication.com https://adservice.google.com https://*.doubleclick.net https://*.adtrafficquality.google https://www.google.com",
			"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
			"img-src 'self' data: https: blob:",
			"font-src 'self' https://fonts.gstatic.com",
			"connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://www.google-analytics.com https://va.vercel-scripts.com https://*.googlesyndication.com https://*.doubleclick.net https://*.adtrafficquality.google https://cdn.jsdelivr.net https://unpkg.com https://lottie.host",
			"frame-src 'self' https://*.doubleclick.net https://*.googlesyndication.com https://*.adtrafficquality.google https://www.google.com https://www.youtube.com",
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

	if (
		!hasVisited &&
		!event.url.pathname.startsWith('/admin') &&
		!event.url.pathname.startsWith('/api') &&
		!event.url.pathname.includes('sitemap.xml') &&
		!event.url.pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|gif|json|xml)$/) &&
		!building
	) {
		// Only track public pages and skip during build
		try {
			const uaString = event.request.headers.get('user-agent') || '';
			const parser = new UAParser(uaString);
			const browser = parser.getBrowser();
			const os = parser.getOS();
			const device = parser.getDevice();

			let ip = '0.0.0.0';
			try {
				ip = event.getClientAddress();
			} catch (e) {
				console.warn('Could not get client address:', e);
			}

			const visitorData = {
				ip,
				browser: `${browser.name || 'Unknown'} ${browser.version || ''}`.trim(),
				os: `${os.name || 'Unknown'} ${os.version || ''}`.trim(),
				device: device.type || 'desktop',
				referer: event.request.headers.get('referer') || null,
				language: event.request.headers.get('accept-language') || null,
				path: event.url.pathname
			};

			await visitorService.increment(visitorData);

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
		} catch {
			// Session invalid/expired, locals.user remains undefined
			console.log('Session verification failed or expired');
		}
	}

	// Admin route protection
	if (event.url.pathname.startsWith('/admin') || event.url.pathname.startsWith('/api/admin')) {
		if (!event.locals.user) {
			console.log('🔴 No valid session found for admin route, redirecting to login');
			throw redirect(303, '/auth/login');
		}

		// Verify owner email
		if ((event.locals.user as { email: string }).email !== env.OWNER_EMAIL) {
			logWarning('Auth:OwnerCheck', 'Non-owner attempted to access admin', {
				email: (event.locals.user as { email: string }).email,
				path: event.url.pathname
			});
			console.log('🔴 Email mismatch, redirecting to login');
			throw redirect(303, '/auth/login');
		}
	}

	return resolve(event);
};

import { monitoringService } from '$lib/server/services/monitoring.service';

export const handle: Handle = async ({ event, resolve }) => {
	console.log(`[Hooks] Start handling request: ${event.url.pathname}`);
	const response = await sequence(
		handleSecurityHeaders,
		handleParaglide,
		handleVisitor,
		handleAuth
	)({ event, resolve });
	console.log(`[Hooks] Finished handling request: ${event.url.pathname} with status ${response.status}`);
	return response;
};

export const handleError: import('@sveltejs/kit').HandleServerError = async ({
	error,
	event,
	status,
	message
}) => {
	const errorId = crypto.randomUUID();

	// Log the error to Firestore
	await monitoringService.logError({
		type: 'server',
		message: error instanceof Error ? error.message : message,
		stack: error instanceof Error ? error.stack : undefined,
		url: event.url.toString(),
		userAgent: event.request.headers.get('user-agent') || undefined,
		locale: event.locals.paraglide?.locale,
		userId: (event.locals.user?.uid as string) || (event.locals.user?.id as string) || null,
		status,
		context: {
			errorId,
			route: event.route.id || undefined
		}
	});

	// For debugging purposes, we'll show the real error even in production temporarily
	return {
		message: error instanceof Error ? error.message : message,
		errorId
	};
};
