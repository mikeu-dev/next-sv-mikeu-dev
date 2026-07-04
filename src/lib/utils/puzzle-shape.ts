/**
 * SVG path generator for a jigsaw-puzzle-piece silhouette: a rectangle whose
 * four edges are each either flat, a round "bump" protruding outward, or a
 * matching "socket" indented inward. Two tiles sharing an edge — one bump,
 * one socket, same edge length — tile together with no visible seam gap,
 * because the socket's cutout is the exact mirror of the bump's protrusion.
 *
 * The bump needs room to protrude past the tile's own box, so the path is
 * drawn in an enlarged coordinate space: `bleed` extra pixels on every side.
 * Callers must render this inside a wrapper inset by `-bleed` on all sides
 * (see work-project-tile.svelte), or the protrusion gets clipped away by the
 * tile's own bounding box.
 */

export type PuzzleEdgeState = 'flat' | 'bump' | 'socket';

export interface PuzzleEdges {
	top?: PuzzleEdgeState;
	right?: PuzzleEdgeState;
	bottom?: PuzzleEdgeState;
	left?: PuzzleEdgeState;
}

export interface PuzzlePieceOptions {
	/** Knob radius as a fraction of the edge's own length. */
	radiusRatio?: number;
	/** Clamp for the knob radius, in pixels. */
	minRadius?: number;
	maxRadius?: number;
}

export interface PuzzlePiece {
	path: string;
	/** Extra margin (px) reserved on every side for bumps to protrude into. */
	bleed: number;
}

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

/** Point along the edge, offset `dist` from `mid` in the direction of travel `d`. */
function along(mid: [number, number], d: [number, number], dist: number): [number, number] {
	return [mid[0] + d[0] * dist, mid[1] + d[1] * dist];
}

/**
 * Appends the SVG commands for one edge (from the current point to `end`) to
 * `parts`, inserting a knob arc for bump/socket. For this rectangle's
 * clockwise winding (TL→TR→BR→BL→TL), a bump (bulging outward, away from the
 * tile) is always sweep-flag 1 and a socket (bulging inward) is always
 * sweep-flag 0, regardless of which of the four edges it is — a property of
 * tracing a convex shape consistently clockwise (verified empirically by
 * rendering all four edges in isolation, see the case that motivated it).
 */
function drawEdge(
	parts: string[],
	start: [number, number],
	end: [number, number],
	state: PuzzleEdgeState,
	radius: number
): void {
	if (state === 'flat' || radius <= 0) {
		parts.push(`L ${end[0]} ${end[1]}`);
		return;
	}

	const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
	const d: [number, number] = [(end[0] - start[0]) / length, (end[1] - start[1]) / length];
	const mid: [number, number] = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
	const r = Math.min(radius, length / 2 - 1);

	const p1 = along(mid, d, -r);
	const p2 = along(mid, d, r);
	const sweep = state === 'bump' ? 1 : 0;

	parts.push(
		`L ${p1[0]} ${p1[1]}`,
		`A ${r} ${r} 0 0 ${sweep} ${p2[0]} ${p2[1]}`,
		`L ${end[0]} ${end[1]}`
	);
}

/**
 * Builds the clip-path `path()` string for a `width` x `height` tile with the
 * given per-edge states. Pass the *shared edge's own length* consistently on
 * both sides of a bump/socket pair (tile width for top/bottom edges, tile
 * height for left/right edges) so the radius — and therefore the knob — comes
 * out identical on both tiles.
 */
export function puzzlePiecePath(
	width: number,
	height: number,
	edges: PuzzleEdges = {},
	options: PuzzlePieceOptions = {}
): PuzzlePiece {
	const { radiusRatio = 0.16, minRadius = 14, maxRadius = 40 } = options;

	const topRadius = clamp(width * radiusRatio, minRadius, maxRadius);
	const bottomRadius = topRadius;
	const rightRadius = clamp(height * radiusRatio, minRadius, maxRadius);
	const leftRadius = rightRadius;

	const bleed = Math.max(topRadius, rightRadius, bottomRadius, leftRadius);

	const tl: [number, number] = [bleed, bleed];
	const tr: [number, number] = [bleed + width, bleed];
	const br: [number, number] = [bleed + width, bleed + height];
	const bl: [number, number] = [bleed, bleed + height];

	const parts: string[] = [`M ${tl[0]} ${tl[1]}`];
	drawEdge(parts, tl, tr, edges.top ?? 'flat', topRadius);
	drawEdge(parts, tr, br, edges.right ?? 'flat', rightRadius);
	drawEdge(parts, br, bl, edges.bottom ?? 'flat', bottomRadius);
	drawEdge(parts, bl, tl, edges.left ?? 'flat', leftRadius);
	parts.push('Z');

	return {
		path: `path('${parts.join(' ')}')`,
		bleed
	};
}
