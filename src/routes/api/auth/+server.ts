import { json } from '@sveltejs/kit';
import { AuthService } from '../../../lib/server/services/auth.service';
import { HttpException } from '../../../lib/server/exceptions/http.exception';
import { UserService } from '$lib/server/services/user.service';

const authService = new AuthService();
const userService = new UserService();

export async function POST({ request, cookies }) {
	try {
		const { token, username, email } = await request.json();
		const decodedToken = await authService.verifyIdToken(token);

		// Jika ini adalah user baru (dilihat dari waktu pembuatan token), buat dokumen di Firestore
		if (decodedToken.auth_time === decodedToken.iat && username && email) {
			await userService.createUser(decodedToken.uid, email, username);
		}
		const sessionCookie = await authService.createSessionCookie(token);

		cookies.set('__session', sessionCookie, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
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
		console.error('API Auth POST Error:', e);
		return json({ message: 'Internal Server Error' }, { status: 500 });
	}
}

export async function DELETE({ cookies }) {
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
		console.error('API Auth DELETE Error:', e);
		return json({ message: 'Internal Server Error' }, { status: 500 });
	}
}
