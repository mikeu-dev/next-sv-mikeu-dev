/**
 * GeoIP Resolution Service
 *
 * Production (Vercel): Uses x-vercel-ip-* headers (zero-cost, zero-dependency)
 * Development: Falls back to ip-api.com free tier (45 req/min)
 */

export interface GeoData {
	readonly country: string | null;
	readonly city: string | null;
	readonly region: string | null;
	readonly latitude: number | null;
	readonly longitude: number | null;
}

const EMPTY_GEO: GeoData = {
	country: null,
	city: null,
	region: null,
	latitude: null,
	longitude: null
};

/** Free GeoIP API response shape */
interface IpApiResponse {
	status: string;
	country: string;
	city: string;
	regionName: string;
	lat: number;
	lon: number;
}

/**
 * Resolve geographic data dari request headers atau fallback API.
 *
 * @param request - Incoming Request object
 * @param ip - Client IP address
 * @returns GeoData dengan country, city, region, lat, lng
 */
export async function resolveGeo(request: Request, ip: string): Promise<GeoData> {
	// 1. Try Vercel headers first (production)
	const vercelGeo = extractVercelHeaders(request);
	if (vercelGeo.country) {
		return vercelGeo;
	}

	// 2. Fallback: ip-api.com for development
	if (ip && ip !== '0.0.0.0' && ip !== '127.0.0.1' && ip !== '::1') {
		return await fetchFromIpApi(ip);
	}

	return EMPTY_GEO;
}

/**
 * Extract geo data dari Vercel's automatic headers.
 * Headers ini secara otomatis di-set oleh Vercel Edge Network.
 */
function extractVercelHeaders(request: Request): GeoData {
	const country = request.headers.get('x-vercel-ip-country');
	const city = request.headers.get('x-vercel-ip-city');
	const region = request.headers.get('x-vercel-ip-country-region');
	const latitude = request.headers.get('x-vercel-ip-latitude');
	const longitude = request.headers.get('x-vercel-ip-longitude');

	if (!country) return EMPTY_GEO;

	return {
		country: country ? decodeURIComponent(country) : null,
		city: city ? decodeURIComponent(city) : null,
		region: region ? decodeURIComponent(region) : null,
		latitude: latitude ? parseFloat(latitude) : null,
		longitude: longitude ? parseFloat(longitude) : null
	};
}

/**
 * Fallback GeoIP lookup via ip-api.com (free tier).
 * Rate limit: 45 requests/minute — hanya untuk development.
 */
async function fetchFromIpApi(ip: string): Promise<GeoData> {
	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 2000);

		const response = await fetch(
			`http://ip-api.com/json/${ip}?fields=status,country,city,regionName,lat,lon`,
			{
				signal: controller.signal
			}
		);

		clearTimeout(timeout);

		if (!response.ok) return EMPTY_GEO;

		const data = (await response.json()) as IpApiResponse;

		if (data.status !== 'success') return EMPTY_GEO;

		return {
			country: data.country || null,
			city: data.city || null,
			region: data.regionName || null,
			latitude: data.lat ?? null,
			longitude: data.lon ?? null
		};
	} catch {
		// Timeout or network error — silently return empty
		return EMPTY_GEO;
	}
}
