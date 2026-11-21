import { describe, expect, it } from 'vitest';
import { isHumanBrowser, visitBodySchema } from './visit-request';

const CHROME =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36';
const IPHONE_IG =
	'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 429.0.0.33.52';

describe('isHumanBrowser', () => {
	it('accepts real browsers, in-app browsers included', () => {
		expect(isHumanBrowser(CHROME, 'id-ID,id;q=0.9')).toBe(true);
		expect(isHumanBrowser(IPHONE_IG, 'en-US')).toBe(true);
	});

	it('rejects crawlers, previewers, headless browsers and scripts', () => {
		for (const ua of [
			'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
			'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
			'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.0 Safari/537.36',
			'python-requests/2.31.0',
			'curl/8.5.0'
		]) {
			expect(isHumanBrowser(ua, 'en'), ua).toBe(false);
		}
		expect(isHumanBrowser(null, 'en')).toBe(false);
	});

	it('rejects requests without Accept-Language', () => {
		expect(isHumanBrowser(CHROME, null)).toBe(false);
	});
});

describe('visitBodySchema', () => {
	it('accepts a same-site path and an optional referrer', () => {
		expect(visitBodySchema.parse({ path: '/blog/a' })).toEqual({ path: '/blog/a', referrer: '' });
		expect(visitBodySchema.parse({ path: '/', referrer: 'https://www.google.com/' }).referrer).toBe(
			'https://www.google.com/'
		);
	});

	it('rejects other input', () => {
		for (const body of [
			null,
			{},
			{ path: 'https://evil.example/' },
			{ path: '//evil.example' },
			{ path: '/', referrer: 'not a url' },
			{ path: '/' + 'a'.repeat(400) }
		]) {
			expect(visitBodySchema.safeParse(body).success).toBe(false);
		}
	});
});
