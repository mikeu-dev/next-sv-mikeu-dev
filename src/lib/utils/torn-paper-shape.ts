/**
 * Torn-paper clip-path generator — a rectangle whose edges are jagged instead
 * of straight, like a clipping torn out of a newspaper page. Unlike the
 * origami corner-cuts (a few long diagonal cuts) or the puzzle knobs (one
 * smooth curve per edge), this walks each edge in several short segments and
 * jitters each one a little, so the silhouette reads as a rough paper tear.
 *
 * Deterministic from a seed (e.g. a post id) so SSR and hydration render the
 * identical shape instead of reshuffling on every render like `Math.random()`
 * would.
 */

import { seededRandom } from './seeded-random';

export interface TornPaperOptions {
	/** How many jagged points make up each edge. More = finer, busier tear. */
	segments?: number;
	/** Max perpendicular jitter per point, as a percent of that edge's own box axis. */
	jitter?: number;
}

export function tornPaperClipPath(seed: string | number, options: TornPaperOptions = {}): string {
	const { segments = 7, jitter = 3.2 } = options;
	const rand = seededRandom(seed);
	const points: string[] = ['0% 0%'];

	const walkEdge = (x0: number, y0: number, x1: number, y1: number, axis: 'x' | 'y') => {
		for (let i = 1; i <= segments; i++) {
			const t = i / segments;
			let x = x0 + (x1 - x0) * t;
			let y = y0 + (y1 - y0) * t;

			if (i < segments) {
				const offset = (rand() - 0.5) * 2 * jitter;
				if (axis === 'x') y += offset;
				else x += offset;
			}

			points.push(`${x}% ${y}%`);
		}
	};

	walkEdge(0, 0, 100, 0, 'x');
	walkEdge(100, 0, 100, 100, 'y');
	walkEdge(100, 100, 0, 100, 'x');
	walkEdge(0, 100, 0, 0, 'y');

	return `polygon(${points.join(', ')})`;
}
