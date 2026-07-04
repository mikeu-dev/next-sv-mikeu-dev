/** Deterministic randomness shared by the origami-shape and puzzle-grid utilities. */

/** FNV-1a style string hash — deterministic, no external dependency. */
export function hashSeed(seed: string): number {
	let h = 2166136261;
	for (let i = 0; i < seed.length; i++) {
		h ^= seed.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

/** mulberry32 PRNG — small, fast, deterministic from a numeric seed. */
export function mulberry32(seed: number): () => number {
	let a = seed;
	return () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Convenience: a seeded PRNG built directly from a string seed. */
export function seededRandom(seed: string | number): () => number {
	return mulberry32(hashSeed(String(seed)));
}
