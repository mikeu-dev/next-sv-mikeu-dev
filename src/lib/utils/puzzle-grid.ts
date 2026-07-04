/**
 * Simulates CSS Grid's `grid-auto-flow: row dense` placement for a list of
 * items with a 1- or 2-column span, then decides which shared edges between
 * neighboring cells become an interlocking bump/socket pair (see
 * puzzle-shape.ts for the actual knob geometry).
 *
 * This has to be redone for each breakpoint's column count, because dense
 * packing produces a different layout — and therefore different neighbors —
 * at 1, 2, and 3 columns.
 */

import { seededRandom } from './seeded-random';
import type { PuzzleEdgeState } from './puzzle-shape';

export interface PuzzleGridItem {
	id: string;
	/** Requested column span; clamped down to fit if it exceeds `columns`. */
	colSpan: 1 | 2;
}

export interface GridPlacement {
	id: string;
	row: number;
	colStart: number;
	colSpan: number;
}

/**
 * Places items row-by-row, always taking the first (row, col) slot the
 * item's span fits in — the same backfill-earlier-gaps behavior CSS Grid
 * uses for `grid-auto-flow: dense` when every item is exactly one row tall.
 */
export function simulateDenseGrid(items: PuzzleGridItem[], columns: number): GridPlacement[] {
	const occupied = new Set<string>();
	const placements: GridPlacement[] = [];
	const key = (row: number, col: number) => `${row}:${col}`;

	const fits = (row: number, col: number, span: number) => {
		for (let c = col; c < col + span; c++) {
			if (occupied.has(key(row, c))) return false;
		}
		return true;
	};

	for (const item of items) {
		const span = Math.min(item.colSpan, columns);
		let row = 0;
		let placedCol = -1;

		while (placedCol === -1) {
			for (let col = 0; col <= columns - span; col++) {
				if (fits(row, col, span)) {
					placedCol = col;
					break;
				}
			}
			if (placedCol === -1) row++;
		}

		for (let c = placedCol; c < placedCol + span; c++) occupied.add(key(row, c));
		placements.push({ id: item.id, row, colStart: placedCol, colSpan: span });
	}

	return placements;
}

export type TileEdges = Record<'top' | 'right' | 'bottom' | 'left', PuzzleEdgeState>;
export type PuzzleEdgeMap = Record<string, TileEdges>;

/**
 * Decides bump/socket for every shared edge. An edge only gets a knob when
 * exactly one neighboring tile's edge matches it fully (same row + adjacent
 * column for a left/right pair, or same column range + adjacent row for a
 * top/bottom pair) — a wide feature tile's top/bottom edge usually spans two
 * narrower tiles below it, and there's no single matching edge to interlock
 * with, so it's left flat rather than picking one arbitrarily.
 */
export function assignPuzzleEdges(placements: GridPlacement[]): PuzzleEdgeMap {
	const edges: PuzzleEdgeMap = {};
	for (const p of placements) {
		edges[p.id] = { top: 'flat', right: 'flat', bottom: 'flat', left: 'flat' };
	}

	const decideBumpsA = (idA: string, idB: string, direction: 'h' | 'v'): boolean => {
		const [first, second] = [idA, idB].sort();
		const rand = seededRandom(`${first}|${second}|${direction}`);
		return rand() < 0.5;
	};

	for (const p of placements) {
		const right = placements.find((o) => o.row === p.row && o.colStart === p.colStart + p.colSpan);
		if (right) {
			const aBump = decideBumpsA(p.id, right.id, 'h');
			edges[p.id].right = aBump ? 'bump' : 'socket';
			edges[right.id].left = aBump ? 'socket' : 'bump';
		}

		const bottom = placements.find(
			(o) => o.row === p.row + 1 && o.colStart === p.colStart && o.colSpan === p.colSpan
		);
		if (bottom) {
			const aBump = decideBumpsA(p.id, bottom.id, 'v');
			edges[p.id].bottom = aBump ? 'bump' : 'socket';
			edges[bottom.id].top = aBump ? 'socket' : 'bump';
		}
	}

	return edges;
}
