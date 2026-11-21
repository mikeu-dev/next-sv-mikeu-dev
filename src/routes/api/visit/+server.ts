import type { RequestHandler } from './$types';
import { dev } from '$app/env';
import { VERCEL_ENV } from '$app/env/private';
import { UAParser } from 'ua-parser-js';
import { VisitorService } from '#lib/server/services/visitor.service.js';
import { resolveGeo } from '#lib/server/services/geo.service.js';
import { checkRateLimit } from '#lib/server/middleware/rate-limit.js';
import { isHumanBrowser, visitBodySchema } from '#lib/server/utils/visit-request.js';

const VISITOR_COOKIE = 'visitor_log';
const visitorService = new VisitorService();

/**
 * POST /api/visit — the browser reports one page view per visitor per day.
 * Replaces counting in hooks.server.ts, which counted every request without
 * the cookie (i.e. every bot request) as a new visitor.
 */
export const POST: RequestHandler = async (event) => {
	const { request, cookies } = event;

	// Only the production deployment writes visits (not dev servers or previews,
	// which share the same database).
	if (dev || (VERCEL_ENV && VERCEL_ENV !== 'production')) {
		return new Response(null, { status: 204 });
	}

	const limited = checkRateLimit(event, { maxRequests: 10, windowMs: 60_000 });
	if (limited) return limited;

	if (cookies.get(VISITOR_COOKIE)) return new Response(null, { status: 204 });

	const userAgent = request.headers.get('user-agent');
	const language = request.headers.get('accept-language');
	if (!isHumanBrowser(userAgent, language)) return new Response(null, { status: 204 });

	const parsed = visitBodySchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) return new Response(null, { status: 400 });
	const { path, referrer } = parsed.data;
	if (path.startsWith('/admin')) return new Response(null, { status: 204 });

	cookies.set(VISITOR_COOKIE, 'true', {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 // one visit per visitor per day
	});

	try {
		let ip = '0.0.0.0';
		try {
			ip = event.getClientAddress();
		} catch {
			/* unavailable outside a real request */
		}
		const parser = new UAParser(userAgent ?? '');
		const browser = parser.getBrowser();
		const os = parser.getOS();
		const geo = await resolveGeo(request, ip);

		// Awaited (not fire-and-forget) so the serverless function is not frozen
		// before the write lands.
		await visitorService.increment({
			ip,
			browser: `${browser.name || 'Unknown'} ${browser.version || ''}`.trim(),
			os: `${os.name || 'Unknown'} ${os.version || ''}`.trim(),
			device: parser.getDevice().type || 'desktop',
			referer: referrer || null,
			language,
			path,
			country: geo.country,
			city: geo.city,
			region: geo.region,
			latitude: geo.latitude,
			longitude: geo.longitude
		});
	} catch (error) {
		console.error('Failed to record visit', error);
	}
	return new Response(null, { status: 204 });
};
