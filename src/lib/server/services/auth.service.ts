import { auth } from '../firebase/firebase.server';
import { SESSION_EXPIRES_DAYS } from '$env/static/private';

export class AuthService {
  async verifyIdToken(token: string) {
    return auth.verifyIdToken(token);
  }

  async createSessionCookie(token: string) {
    const expiresIn = 60 * 60 * 24 * Number(SESSION_EXPIRES_DAYS || 5) * 1000;
    return auth.createSessionCookie(token, { expiresIn });
  }

  async verifySessionCookie(cookie: string) {
    return auth.verifySessionCookie(cookie, true);
  }

  async revokeRefreshTokens(uid: string) {
    return auth.revokeRefreshTokens(uid);
  }
}
