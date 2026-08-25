import { auth } from '../firebase/firebase.server';
import { SESSION_EXPIRES_DAYS } from '$app/env/private';

export class AuthService {
	async verifyIdToken(token: string) {
		if (!auth) throw new Error('Auth not initialized');
		return auth.verifyIdToken(token);
	}

	async createSessionCookie(token: string) {
		if (!auth) throw new Error('Auth not initialized');
		const expiresIn = 60 * 60 * 24 * Number(SESSION_EXPIRES_DAYS || 5) * 1000;
		return auth.createSessionCookie(token, { expiresIn });
	}

	async verifySessionCookie(cookie: string) {
		if (!auth) throw new Error('Auth not initialized');
		return auth.verifySessionCookie(cookie, true);
	}

	async revokeRefreshTokens(uid: string) {
		if (!auth) throw new Error('Auth not initialized');
		return auth.revokeRefreshTokens(uid);
	}
}
