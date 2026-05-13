import { json } from '@sveltejs/kit';
import { getProviderData } from '@vercel/flags/sveltekit';
import * as flags from '$lib/flags';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const data = getProviderData(flags);
	return json(data);
};
