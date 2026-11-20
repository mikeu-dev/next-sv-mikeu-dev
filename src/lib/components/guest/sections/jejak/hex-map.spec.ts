import { describe, expect, it } from 'vitest';
import {
	distanceKm,
	hexDensity,
	landHexes,
	nearestHex,
	projectEqualEarth,
	PURWAKARTA,
	toPercent
} from './hex-map';

describe('Equal Earth projection', () => {
	it('matches the city positions drawn in the design (within 0.1% of the view)', () => {
		// [lat, lon, design x %, design y %]
		const cases: [number, number, number, number][] = [
			[-6.2, 106.8, 36.21, 63.45], // Jakarta
			[3.6, 98.7, 33.86, 57.37], // Medan
			[-5.1, 119.4, 39.82, 62.77] // Makassar
		];
		for (const [lat, lon, x, y] of cases) {
			const p = toPercent(lat, lon);
			expect(Math.abs(p.x - x)).toBeLessThan(0.1);
			expect(Math.abs(p.y - y)).toBeLessThan(0.1);
		}
	});

	it('wraps longitudes around the 150°E centre', () => {
		expect(projectEqualEarth(0, 150).x).toBeCloseTo(700, 5);
		expect(projectEqualEarth(0, -30 + 0.001).x).toBeLessThan(0);
		expect(projectEqualEarth(0, -30 - 0.001).x).toBeGreaterThan(1400);
	});
});

describe('hexDensity', () => {
	it('returns all zeros without data', () => {
		expect(hexDensity([]).every((c) => c === 0)).toBe(true);
	});

	it('marks the busiest hexagon with the top class and ignores bad points', () => {
		const classes = hexDensity([
			{ ...PURWAKARTA, count: 500 },
			{ latitude: 51.5, longitude: -0.1, count: 3 },
			{ latitude: Number.NaN, longitude: 0, count: 10 },
			{ latitude: 10, longitude: 10, count: 0 }
		]);
		const { x, y } = projectEqualEarth(PURWAKARTA.latitude, PURWAKARTA.longitude);
		expect(classes[nearestHex(x, y)]).toBe(5);
		expect(classes.filter((c) => c > 0).length).toBe(2);
		expect(classes.length).toBe(landHexes.length);
	});
});

describe('distanceKm', () => {
	it('computes Purwakarta → Bandung roughly', () => {
		const d = distanceKm(PURWAKARTA, { latitude: -6.9175, longitude: 107.6191 });
		expect(d).toBeGreaterThan(38);
		expect(d).toBeLessThan(48);
	});
});
