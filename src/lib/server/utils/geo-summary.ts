/**
 * Helpers for the pre-aggregated visitor geo summary (`summaries/geo_aggregation`).
 *
 * The summary is one Firestore document whose fields are places keyed
 * `"<country>::<city|unknown>"`, each holding country, city, coordinates and a
 * visit count. Bookkeeping fields (`updatedAt`, `_meta`) live beside them.
 */

export interface GeoSummaryNode {
	country?: string | null;
	city?: string | null;
	latitude?: number | null;
	longitude?: number | null;
	count?: number;
	lastVisit?: string;
	browsers?: string[];
	devices?: string[];
}

export interface GeoLog {
	country?: string | null;
	city?: string | null;
	latitude?: number | null;
	longitude?: number | null;
}

/** Field name of a place in the summary document. */
export function geoKey(country: string, city: string | null | undefined): string {
	return `${country}::${city || 'unknown'}`.replace(/\//g, '_');
}

/** Place entries of the summary document (skips bookkeeping fields). */
export function geoEntries(data: Record<string, unknown>): [string, GeoSummaryNode][] {
	return Object.entries(data).filter(
		(e): e is [string, GeoSummaryNode] =>
			e[0].includes('::') && !!e[1] && typeof e[1] === 'object' && !Array.isArray(e[1])
	);
}

/** True when a place can be drawn on the map. */
export function isPlottable(node: GeoSummaryNode): boolean {
	return (
		!!node.country &&
		typeof node.latitude === 'number' &&
		Number.isFinite(node.latitude) &&
		typeof node.longitude === 'number' &&
		Number.isFinite(node.longitude)
	);
}

/** Places recorded from a local dev server (mock "Jakarta (Dev)" location). */
export function isDevPlace(key: string, node: GeoSummaryNode): boolean {
	return /\(Dev\)/.test(node.city ?? '') || /\(Dev\)$/.test(key);
}

export interface GeoRepairPlan {
	/** fields to write per place key */
	patches: Record<string, Required<Pick<GeoSummaryNode, 'country' | 'city'>> & GeoSummaryNode>;
	/** dev-only places to delete */
	remove: string[];
	/** places still without coordinates after the repair */
	unresolved: string[];
}

/**
 * Works out how to fill places that were saved without country / city /
 * coordinates. Coordinates come from the most recent visitor log of the same
 * place (`logs` newest first); country and city are recovered from the key.
 */
export function planGeoRepair(data: Record<string, unknown>, logs: GeoLog[]): GeoRepairPlan {
	const fromLogs = new Map<string, GeoLog>();
	for (const log of logs) {
		if (!log.country || typeof log.latitude !== 'number' || typeof log.longitude !== 'number')
			continue;
		const key = geoKey(log.country, log.city);
		if (!fromLogs.has(key)) fromLogs.set(key, log);
	}

	const plan: GeoRepairPlan = { patches: {}, remove: [], unresolved: [] };
	for (const [key, node] of geoEntries(data)) {
		if (isDevPlace(key, node)) {
			plan.remove.push(key);
			continue;
		}
		if (isPlottable(node)) continue;

		const sep = key.indexOf('::');
		const country = node.country || key.slice(0, sep);
		const cityPart = key.slice(sep + 2);
		const city = node.city ?? (cityPart === 'unknown' ? null : cityPart);
		const log = fromLogs.get(key);

		if (log) {
			plan.patches[key] = {
				country,
				city,
				latitude: log.latitude as number,
				longitude: log.longitude as number
			};
		} else {
			plan.unresolved.push(key);
			if (!node.country) plan.patches[key] = { country, city };
		}
	}
	return plan;
}
