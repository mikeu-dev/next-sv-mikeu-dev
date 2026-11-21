/**
 * Heuristics that keep automated traffic out of the visitor counter.
 *
 * Most "visitors" without this filter were crawlers, link previewers, uptime
 * monitors and scanners: they never keep the `visitor_log` cookie, so every
 * request counted as a new visitor, and they come from cloud data centres
 * (Ashburn VA, Council Bluffs IA, …) that then topped the Jejak map.
 */

/** User agents of crawlers, previewers, monitors, HTTP libraries and headless browsers. */
const BOT_UA =
	/bot\b|bot\/|crawl|spider|slurp|scrap|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|statuscake|preview|facebookexternalhit|meta-externalagent|whatsapp|telegrambot|skypeuripreview|embedly|quora link|outbrain|pinterest\/|vkshare|w3c_validator|curl|wget|python|httpclient|http-client|axios|node-fetch|undici|go-http|java\/|okhttp|libwww|perl|ruby|php\/|postman|insomnia|phantom|selenium|puppeteer|playwright|webdriver|semrush|ahrefs|mj12|dotbot|petalbot|yandex|baidu|bytespider|gptbot|chatgpt|claude|anthropic|perplexity|ccbot|amazonbot|applebot|bingpreview|vercel|zgrab|masscan|nmap|nikto|censys|shodan|expanse|netcraft|qualys/i;

/** True when a request is very likely automated rather than a person. */
export function isBotRequest(userAgent: string | null, acceptLanguage: string | null): boolean {
	const ua = (userAgent ?? '').trim();
	if (ua.length < 20) return true; // empty or bare client names
	if (BOT_UA.test(ua)) return true;
	// Every real browser sends Accept-Language; most scripts and crawlers do not.
	if (!acceptLanguage?.trim()) return true;
	return false;
}

/**
 * Places that are cloud / hosting data-centre towns rather than where people
 * live, keyed like the geo summary (`<country>::<city>`). Only towns that are
 * known almost exclusively for data centres are listed; mixed cities
 * (Singapore, Frankfurt, Columbus, Santa Clara, …) are kept.
 */
const DATA_CENTER_PLACES = new Set(
	[
		// United States
		'US::Ashburn', // AWS us-east-1, "Data Center Alley"
		'US::Leesburg',
		'US::Sterling',
		'US::Herndon',
		'US::Reston',
		'US::Manassas',
		'US::Warrenton',
		'US::Boydton', // Microsoft
		'US::Council Bluffs', // Google
		'US::The Dalles', // Google
		'US::Moncks Corner', // Google
		'US::North Charleston',
		'US::Lenoir', // Google
		'US::Pryor', // Google
		'US::Boardman', // AWS us-west-2
		'US::Hillsboro',
		'US::Prineville', // Meta
		'US::Altoona', // Meta
		'US::Papillion', // Meta
		'US::DeKalb', // Meta
		'US::Gallatin', // Meta
		'US::Forest City', // Meta
		'US::New Albany', // Meta / Google
		'US::Hilliard', // AWS us-east-2
		'US::Dublin', // AWS us-east-2 (Ohio)
		'US::Quincy', // Microsoft / Yahoo
		'US::Tukwila',
		'US::North Bergen',
		// Canada / Europe / Asia
		'CA::Beauharnois', // OVH
		'DE::Falkenstein', // Hetzner
		'DE::Eschborn',
		'FR::Gravelines', // OVH
		'FR::Roubaix', // OVH
		'FI::Hamina', // Google
		'BE::Saint-Ghislain', // Google
		'IN::Airoli'
	].map((k) => k.toLowerCase())
);

export function isDataCenterPlace(
	country: string | null | undefined,
	city: string | null | undefined
): boolean {
	if (!country || !city) return false;
	return DATA_CENTER_PLACES.has(`${country}::${city}`.toLowerCase());
}

/** Same check for a geo summary key (`<country>::<city>`). */
export function isDataCenterKey(key: string): boolean {
	return DATA_CENTER_PLACES.has(key.toLowerCase());
}
