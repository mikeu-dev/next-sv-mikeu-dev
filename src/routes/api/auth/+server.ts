import { json } from '@sveltejs/kit';
import { AuthService } from '../../../lib/server/services/auth.service';
import { HttpException } from '../../../lib/server/exceptions/http.exception';

const authService = new AuthService();

export async function POST({ request, cookies }) {
  try {
    const { token } = await request.json();
    const decodedToken = await authService.verifyIdToken(token);
    const sessionCookie = await authService.createSessionCookie(token);

    cookies.set('__session', sessionCookie, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return json({ uid: decodedToken.uid });
  } catch (e) {
    if (e instanceof HttpException) {
      return json({ message: e.message }, { status: e.status });
    }
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
  } catch (e) {
    if (e instanceof HttpException) {
      return json({ message: e.message }, { status: e.status });
    }
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
