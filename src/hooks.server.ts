import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { AuthService } from '$lib/server/services/auth.service';
import { redirect } from '@sveltejs/kit';

const authService = new AuthService();

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;
		event.locals.paraglide = { locale };

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

const handleAuth: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/admin')) {
		const session = event.cookies.get('__session');

		if (!session) {
			throw redirect(303, '/auth/login');
		}

		try {
			const decodedClaims = await authService.verifySessionCookie(session);
			// Optional: Check owner email if env was set, but skipping for now as requested.
			// if (decodedClaims.email !== process.env.OWNER_EMAIL) throw new Error('Unauthorized');
			event.locals.user = decodedClaims;
		} catch (error) {
			console.error('Auth Check Failed:', error);
			throw redirect(303, '/auth/login');
		}
	}
	return resolve(event);
};

export const handle: Handle = sequence(handleParaglide, handleAuth);
