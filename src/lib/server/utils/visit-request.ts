import { isbot } from 'isbot';
import { z } from 'zod';

/**
 * Visits are counted from the browser (`POST /api/visit` after the page has
 * loaded and run its JavaScript), not from every server request: crawlers,
 * link previewers, scanners and scripts rarely execute JavaScript, and the
 * ones that do are mostly caught here by `isbot`'s maintained user-agent list.
 */

/** True when the request comes from a person's browser as far as we can tell. */
export function isHumanBrowser(userAgent: string | null, acceptLanguage: string | null): boolean {
	if (!userAgent || isbot(userAgent)) return false;
	// Every real browser sends Accept-Language with fetch(); most scripts do not.
	return !!acceptLanguage?.trim();
}

export const visitBodySchema = z.object({
	path: z
		.string()
		.max(300)
		.regex(/^\/(?!\/)/, 'must be a same-site path'),
	referrer: z
		.string()
		.max(500)
		.refine((v) => v === '' || URL.canParse(v), 'must be a URL')
		.optional()
		.default('')
});

export type VisitBody = z.infer<typeof visitBodySchema>;
