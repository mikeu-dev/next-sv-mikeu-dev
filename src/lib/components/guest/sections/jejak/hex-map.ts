import { LAND_HEXES, VIEW_H, VIEW_W } from './world-grid.js';

/**
 * Equal Earth projection (Šavrič, Patterson & Jenny 2018), fitted to the
 * design's frame: central meridian 150°E, scale 275.6, centre (700, 536.45)
 * in a 1440×900 view. These values reproduce the design's own city positions
 * to within half a pixel.
 */
const A1 = 1.340264;
const A2 = -0.081106;
const A3 = 0.000893;
const A4 = 0.003796;
const M = Math.sqrt(3) / 2;
const LON0 = 150;
const SCALE = 275.6;
const CX = 700;
const CY = 536.45;

export const PURWAKARTA = { latitude: -6.5569, longitude: 107.4431 } as const;

export function projectEqualEarth(latitude: number, longitude: number): { x: number; y: number } {
	const lambda = ((((longitude - LON0 + 540) % 360) - 180) * Math.PI) / 180;
	const theta = Math.asin(M * Math.sin((latitude * Math.PI) / 180));
	const t2 = theta * theta;
	const t6 = t2 * t2 * t2;
	const x = (lambda * Math.cos(theta)) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)));
	const y = theta * (A1 + A2 * t2 + t6 * (A3 + A4 * t2));
	return { x: CX + SCALE * x, y: CY - SCALE * y };
}

/** Great-circle distance in km. */
export function distanceKm(
	a: { latitude: number; longitude: number },
	b: { latitude: number; longitude: number }
): number {
	const rad = Math.PI / 180;
	const dLat = (b.latitude - a.latitude) * rad;
	const dLon = (b.longitude - a.longitude) * rad;
	const h =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLon / 2) ** 2;
	return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)));
}

export interface LandHex {
	x: number;
	y: number;
}

export const landHexes: LandHex[] = Array.from({ length: LAND_HEXES.length / 2 }, (_, i) => ({
	x: LAND_HEXES[i * 2],
	y: LAND_HEXES[i * 2 + 1]
}));

/** Index of the land hexagon closest to a point (coastal visitors snap inland). */
export function nearestHex(x: number, y: number): number {
	let best = 0;
	let bestD = Infinity;
	for (let i = 0; i < landHexes.length; i++) {
		const dx = landHexes[i].x - x;
		const dy = landHexes[i].y - y;
		const d = dx * dx + dy * dy;
		if (d < bestD) {
			bestD = d;
			best = i;
		}
	}
	return best;
}

export interface VisitorPoint {
	latitude: number;
	longitude: number;
	count: number;
}

/**
 * Density class per land hexagon: 0 = no visits, 1–4 = quartiles of the
 * visited hexagons (light → dark blue), 5 = the busiest ~5% ("bara", orange).
 */
export function hexDensity(points: VisitorPoint[]): Uint8Array {
	const totals = new Float64Array(landHexes.length);
	for (const p of points) {
		if (!Number.isFinite(p.latitude) || !Number.isFinite(p.longitude) || !(p.count > 0)) continue;
		const { x, y } = projectEqualEarth(p.latitude, p.longitude);
		totals[nearestHex(x, y)] += p.count;
	}
	const visited = Array.from(totals)
		.filter((v) => v > 0)
		.sort((a, b) => a - b);
	const classes = new Uint8Array(landHexes.length);
	if (!visited.length) return classes;
	// Rank-based: a value's share of visited hexagons at or below it. The
	// busiest hexagon always lands in class 5, however few hexagons are visited.
	const rankOf = (v: number) => {
		let lo = 0;
		let hi = visited.length;
		while (lo < hi) {
			const mid = (lo + hi) >> 1;
			if (visited[mid] <= v) lo = mid + 1;
			else hi = mid;
		}
		return lo / visited.length;
	};
	totals.forEach((v, i) => {
		if (v <= 0) return;
		const f = rankOf(v);
		classes[i] = f <= 0.25 ? 1 : f <= 0.5 ? 2 : f <= 0.75 ? 3 : f < 0.95 ? 4 : 5;
	});
	return classes;
}

/** Position as a percentage of the 1440×900 view, for HTML overlays. */
export function toPercent(latitude: number, longitude: number): { x: number; y: number } {
	const { x, y } = projectEqualEarth(latitude, longitude);
	return { x: (x / VIEW_W) * 100, y: (y / VIEW_H) * 100 };
}

/** Quadratic arc from a visitor location back to Purwakarta, bowed upward. */
export function arcPath(latitude: number, longitude: number): string {
	const a = projectEqualEarth(latitude, longitude);
	const b = projectEqualEarth(PURWAKARTA.latitude, PURWAKARTA.longitude);
	const mx = (a.x + b.x) / 2;
	const my = (a.y + b.y) / 2;
	const len = Math.hypot(b.x - a.x, b.y - a.y);
	const cx = mx - (b.y - a.y) * 0.18;
	const cy = my - len * 0.25;
	return `M${a.x.toFixed(1)} ${a.y.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}
