import { getProviderData } from '@vercel/flags/sveltekit';
import * as flags from '#lib/flags.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const data = getProviderData(flags);
	return Response.json(data);
};
