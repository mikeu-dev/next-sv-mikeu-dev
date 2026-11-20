import { describe, expect, it } from 'vitest';
import { heroLayout, introPills, roundedPath } from './hero-shapes';

/** Command letters only — CSS can interpolate two paths only if these match. */
const shape = (d: string) => d.replace(/[^A-Za-z]/g, '');

describe('intro pills → hero shards', () => {
	for (const width of [1024, 1440, 1920]) {
		it(`have interpolation-compatible paths at ${width}px`, () => {
			const pills = introPills(width);
			for (const [leftOpen, rightOpen] of [
				[true, true],
				[false, false]
			]) {
				const hero = heroLayout(width, leftOpen, rightOpen);
				expect(shape(pills.leftD)).toBe(shape(hero.leftD));
				expect(shape(pills.headD)).toBe(shape(hero.headD));
				expect(shape(pills.rightD)).toBe(shape(hero.rightD));
			}
			for (const d of Object.values(pills)) expect(d).not.toMatch(/NaN|Infinity/);
		});
	}
});

describe('roundedPath', () => {
	it('does not round a straight-through point (no semicircle bulge)', () => {
		const d = roundedPath(
			[
				[0, 0],
				[50, 0],
				[100, 0],
				[100, 100],
				[0, 100]
			],
			20
		);
		// the second point sits on a straight edge: its arc has radius 0
		expect(d).toContain('L 50.0 0.0 A 0.0 0.0');
	});
});
