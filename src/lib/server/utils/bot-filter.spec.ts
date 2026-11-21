import { describe, expect, it } from 'vitest';
import { isBotRequest, isDataCenterKey, isDataCenterPlace } from './bot-filter';

const CHROME =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36';
const IPHONE_IG =
	'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 429.0.0.33.52';
const LANG = 'id-ID,id;q=0.9,en;q=0.8';

describe('isBotRequest', () => {
	it('lets real browsers through, in-app browsers included', () => {
		expect(isBotRequest(CHROME, LANG)).toBe(false);
		expect(isBotRequest(IPHONE_IG, 'en-US')).toBe(false);
	});

	it('flags crawlers, previewers, scripts and headless browsers', () => {
		for (const ua of [
			'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
			'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0)',
			'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
			'WhatsApp/2.23.20.0',
			'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
			'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.7390.0 Safari/537.36',
			'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2)',
			'python-requests/2.31.0',
			'curl/8.5.0',
			''
		]) {
			expect(isBotRequest(ua, LANG), ua).toBe(true);
		}
	});

	it('flags browser-looking requests without Accept-Language', () => {
		expect(isBotRequest(CHROME, null)).toBe(true);
		expect(isBotRequest(CHROME, '  ')).toBe(true);
	});
});

describe('data-centre places', () => {
	it('matches known data-centre towns only', () => {
		expect(isDataCenterPlace('US', 'Ashburn')).toBe(true);
		expect(isDataCenterKey('US::Council Bluffs')).toBe(true);
		expect(isDataCenterKey('us::ashburn')).toBe(true);
		expect(isDataCenterPlace('SG', 'Singapore')).toBe(false);
		expect(isDataCenterPlace('ID', 'Purwakarta')).toBe(false);
		expect(isDataCenterPlace('US', null)).toBe(false);
	});
});
