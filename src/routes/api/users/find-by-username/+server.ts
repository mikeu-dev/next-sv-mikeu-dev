export const prerender = false;

import { json } from '@sveltejs/kit';
import { UserService } from '$lib/server/services/user.service';
import { HttpException } from '$lib/server/exceptions/http.exception';

const userService = new UserService();

export async function POST({ request }) {
	try {
		const { username } = await request.json();
		if (typeof username !== 'string' || !username) {
			throw new HttpException(400, 'Username is required and must be a string.');
		}

		const user = await userService.findByUsername(username);

		if (!user) {
			throw new HttpException(404, 'User not found');
		}

		// Hanya kirim email ke frontend untuk login
		return json({ email: user.email });
	} catch (e: unknown) {
		if (e instanceof HttpException) {
			return json({ message: e.message }, { status: e.status });
		}
		console.error('API Find By Username Error:', e);
		return json({ message: 'Internal Server Error' }, { status: 500 });
	}
}
