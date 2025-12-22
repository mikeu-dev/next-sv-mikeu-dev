export const prerender = false;

import { json } from '@sveltejs/kit';
import { AuthService } from '../../../lib/server/services/auth.service';
import { HttpException } from '../../../lib/server/exceptions/http.exception';
import { UserService } from '$lib/server/services/user.service';
import { checkRateLimit, RateLimitPresets } from '$lib/server/middleware/rate-limit';
import { logError } from '$lib/server/utils/logger';
import type { RequestEvent } from '@sveltejs/kit';

const authService = new AuthService();
const userService = new UserService();

export async function POST(event: RequestEvent) {
	// Rate limiting - 5 requests per minute
	const rateLimitResult = checkRateLimit(event, RateLimitPresets.AUTH);
	if (rateLimitResult) return rateLimitResult;

	try {
		const { token, username, email } = await event.request.json();
		const decodedToken = await authService.verifyIdToken(token);

		// Jika ini adalah user baru (dilihat dari waktu pembuatan token), buat dokumen di Firestore
		if (decodedToken.auth_time === decodedToken.iat && username && email) {
			await userService.createUser(decodedToken.uid, email, username);
		}
		const sessionCookie = await authService.createSessionCookie(token);

		event.cookies.set('__session', sessionCookie, {
			path: '/',
			httpOnly: true,
			secure: true, // Always use secure
			sameSite: 'strict', // Prevent CSRF
			maxAge: 60 * 60 * 24 * 7 // 1 week
		});

		return json({ uid: decodedToken.uid });
	} catch (e: unknown) {
		if (e instanceof HttpException) {
			return json({ message: e.message }, { status: e.status });
		}
		// Safely check for Firebase Auth error codes
		if (typeof e === 'object' && e !== null && 'code' in e) {
			const error = e as { code: string };
			if (error.code === 'auth/id-token-revoked') {
				return json({ message: 'Token has been revoked.' }, { status: 401 });
			}
		}
		logError('API:Auth:POST', e);
		return json({ message: 'Internal Server Error' }, { status: 500 });
	}
}

export async function DELETE({ cookies }: RequestEvent) {
	try {
		const sessionCookie = cookies.get('__session');
		if (sessionCookie) {
			const decodedClaims = await authService.verifySessionCookie(sessionCookie);
			await authService.revokeRefreshTokens(decodedClaims.sub);
			cookies.delete('__session', { path: '/' });
		}
		return json({ message: 'Logged out' });
	} catch (e: unknown) {
		if (e instanceof HttpException) {
			return json({ message: e.message }, { status: e.status });
		}
		logError('API:Auth:DELETE', e);
		return json({ message: 'Internal Server Error' }, { status: 500 });
	}
}

