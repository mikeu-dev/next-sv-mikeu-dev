/**
 * Reusable brutalist-origami shape generator.
 *
 * Two shape families cover the visual language already used across the site:
 *
 * - "notch" — a rectangle with each corner sliced off by a triangle, like a
 *   torn paper corner. The two edges meeting at a corner can be cut by
 *   different amounts, so the cut reads as an irregular diagonal tear rather
 *   than a uniform 45-degree bevel (a symmetric `number` cut still works for
 *   a plain bevel when that's what you want).
 * - "skew" — the whole sheet is nudged into a rotated parallelogram, one
 *   point per edge (the same trick used by the hero card and tape buttons).
 *
 * `origamiClipPath` / `skewedClipPath` build a shape from explicit values
 * (custom); `randomOrigamiClipPath` derives one from a stable seed — pass a
 * stable id (e.g. a project id) so SSR and hydration render the identical
 * shape instead of reshuffling on every render like `Math.random()` would.
 */

export type CornerCut = number | { x: number; y: number };

export interface OrigamiCorners {
	/** Cut at the top-left corner: a symmetric size, or independent {x, y} legs. */
	tl?: CornerCut;
	tr?: CornerCut;
	br?: CornerCut;
	bl?: CornerCut;
}

export interface OrigamiRandomOptions {
	/** Smallest corner notch, in percent. Only used by the "notch" family. */
	minCut?: number;
	/** Largest corner notch, in percent. Only used by the "notch" family. */
	maxCut?: number;
	/**
	 * Largest whole-edge skew, in percent. Kept far smaller than a notch by
	 * default: a notch cuts a small triangle near one corner, self-contained
	 * regardless of aspect ratio, but a skew nudges an entire edge — on a wide
	 * tile that same percentage translates into a much bigger pixel shift and
	 * can slice straight through the content, so this needs its own, more
	 * conservative range rather than sharing `maxCut`.
	 */
	maxSkew?: number;
	/** Chance (0-1) that any given corner/edge is left sharp (cut = 0). */
	sharpChance?: number;
	/** Force one shape family instead of letting the seed pick between them. */
	family?: 'notch' | 'skew';
}

function legs(cut: CornerCut = 0): [number, number] {
	return typeof cut === 'number' ? [cut, cut] : [cut.x, cut.y];
}

/** Builds a "torn corner" clip-path polygon from explicit corner cuts. */
export function origamiClipPath(corners: OrigamiCorners = {}): string {
	const [tlX, tlY] = legs(corners.tl);
	const [trX, trY] = legs(corners.tr);
	const [brX, brY] = legs(corners.br);
	const [blX, blY] = legs(corners.bl);

	return (
		`polygon(` +
		`${tlX}% 0%, ${100 - trX}% 0%, 100% ${trY}%, ` +
		`100% ${100 - brY}%, ${100 - brX}% 100%, ${blX}% 100%, ` +
		`0% ${100 - blY}%, 0% ${tlY}%` +
		`)`
	);
}

/**
 * Builds a "skewed sheet" clip-path — one point per corner, each nudged inward
 * along the edge in the same rotational direction (clockwise), like a sheet
 * of paper rotated slightly. `tl`/`tr`/`br`/`bl` are each how far that
 * corner's point is nudged away from the actual corner, not a fraction of
 * the opposite edge — using the wrong reference edge here made the third
 * point collapse onto the second at small values and silently turn the
 * "subtle skew" into a shape missing an entire quadrant.
 */
export function skewedClipPath(tl: number, tr: number, br: number, bl: number): string {
	return `polygon(0% ${tl}%, ${100 - tr}% 0%, 100% ${100 - br}%, ${bl}% 100%)`;
}

/** FNV-1a style string hash — deterministic, no external dependency. */
function hashSeed(seed: string): number {
	let h = 2166136261;
	for (let i = 0; i < seed.length; i++) {
		h ^= seed.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

/** mulberry32 PRNG — small, fast, deterministic from a numeric seed. */
function mulberry32(seed: number): () => number {
	let a = seed;
	return () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * Derives a shape from `seed` instead of explicit values — same visual
 * language as `origamiClipPath` / `skewedClipPath`, but which family gets
 * used and how deep each cut is both come from the seed, so a whole grid of
 * items reads as varied torn/folded paper instead of one shape stamped out
 * repeatedly at different sizes.
 */
export function randomOrigamiClipPath(
	seed: string | number,
	options: OrigamiRandomOptions = {}
): string {
	const { minCut = 4, maxCut = 18, maxSkew = 7, sharpChance = 0.15, family } = options;
	const rand = mulberry32(hashSeed(String(seed)));
	const cut = () => (rand() < sharpChance ? 0 : minCut + rand() * (maxCut - minCut));
	const skew = () => (rand() < sharpChance ? 0 : rand() * maxSkew);

	const chosenFamily = family ?? (rand() < 0.5 ? 'notch' : 'skew');

	if (chosenFamily === 'skew') {
		return skewedClipPath(skew(), skew(), skew(), skew());
	}

	return origamiClipPath({
		tl: { x: cut(), y: cut() },
		tr: { x: cut(), y: cut() },
		br: { x: cut(), y: cut() },
		bl: { x: cut(), y: cut() }
	});
}
