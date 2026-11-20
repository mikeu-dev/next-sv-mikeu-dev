/**
 * Geometry for the home hero's three glass "cloud shards" (left profile panel,
 * top navigation bar, right layer panel). Each shard is a polygon with rounded
 * corners; collapsing a side panel shrinks it to a 100px rail and the path
 * morphs between the two states.
 */

export const H = 900;
const M = 16; // outer margin
const G = 10; // gap between shards
const HEAD_H = 76; // navigation bar height
const LANG_H = 40; // language tab height
const RAIL = 100; // collapsed rail / logo width
const FOOT_H = 86; // bottom slot height
const R = 30; // corner radius

type Pt = [number, number];

/** Polygon → SVG path with every corner rounded (convex and concave alike). */
export function roundedPath(points: Pt[], radius: number): string {
	const n = points.length;
	let d = '';
	for (let i = 0; i < n; i++) {
		const a = points[(i - 1 + n) % n];
		const p = points[i];
		const q = points[(i + 1) % n];
		const d1 = Math.hypot(p[0] - a[0], p[1] - a[1]);
		const d2 = Math.hypot(q[0] - p[0], q[1] - p[1]);
		const r = Math.max(0, Math.min(radius, d1 / 2, d2 / 2));
		const u1: Pt = d1 ? [(p[0] - a[0]) / d1, (p[1] - a[1]) / d1] : [0, 0];
		const u2: Pt = d2 ? [(q[0] - p[0]) / d2, (q[1] - p[1]) / d2] : [0, 0];
		const p1: Pt = [p[0] - u1[0] * r, p[1] - u1[1] * r];
		const p2: Pt = [p[0] + u2[0] * r, p[1] + u2[1] * r];
		const sweep = u1[0] * u2[1] - u1[1] * u2[0] > 0 ? 1 : 0;
		d += `${i ? ' L ' : 'M '}${p1[0].toFixed(1)} ${p1[1].toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 ${sweep} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
	}
	return d + ' Z';
}

export interface HeroLayout {
	leftD: string;
	headD: string;
	rightD: string;
	/** open widths, for content that must not reflow while a panel animates */
	leftOpenW: number;
	rightOpenW: number;
	leftW: number;
	rightW: number;
	/** bottom-left slot (scale bar) width; 0 when the profile is collapsed */
	slotW: number;
	/** bottom CTA strip under the profile panel */
	leftFootX: number;
	leftFootW: number;
	/** bottom strip under the layer panel (social links) */
	rightFootRight: number;
	rightFootW: number;
	/** right edge offset of the map control rail */
	railRight: number;
	/** right edge offset of the quick-contact panel */
	askRight: number;
	h1Size: number;
	/** true if (px, py) lies over a shard — the cursor readout hides there */
	overPanel: (px: number, py: number, askOpen: boolean) => boolean;
}

export function heroLayout(width: number, leftOpen: boolean, rightOpen: boolean): HeroLayout {
	const W = Math.max(1024, width);
	const leftOpenW = Math.min(540, Math.max(440, Math.round(W * 0.37)));
	const rightOpenW = 280;
	const lw = leftOpen ? leftOpenW : RAIL;
	const rw = rightOpen ? rightOpenW : RAIL;
	const lfw = lw > RAIL ? lw - 180 : lw;
	const rfw = rw > RAIL ? rw - 180 : rw;

	const left: Pt[] = [
		[M, M],
		[M + RAIL, M],
		[M + RAIL, M + HEAD_H + G],
		[M + lw, M + HEAD_H + G],
		[M + lw, H - M],
		[M + lw - lfw, H - M],
		[M + lw - lfw, H - M - FOOT_H],
		[M, H - M - FOOT_H]
	];
	const head: Pt[] = [
		[M + RAIL + G, M],
		[W - M, M],
		[W - M, M + LANG_H],
		[W - M - RAIL - G, M + LANG_H],
		[W - M - RAIL - G, M + HEAD_H],
		[M + RAIL + G, M + HEAD_H]
	];
	const right: Pt[] = [
		[W - M - RAIL, M + LANG_H + G],
		[W - M, M + LANG_H + G],
		[W - M, H - M - FOOT_H],
		[W - M - rw + rfw, H - M - FOOT_H],
		[W - M - rw + rfw, H - M],
		[W - M - rw, H - M],
		[W - M - rw, M + HEAD_H + G],
		[W - M - RAIL, M + HEAD_H + G]
	];

	return {
		leftD: roundedPath(left, R),
		headD: roundedPath(head, R),
		rightD: roundedPath(right, R),
		leftOpenW,
		rightOpenW,
		leftW: lw,
		rightW: rw,
		slotW: leftOpen ? lw - lfw - G : 0,
		leftFootX: M + lw - lfw,
		leftFootW: lfw,
		rightFootRight: M + rw - rfw,
		rightFootW: rfw,
		railRight: M + rw + G + 14,
		askRight: rightOpen ? M : M + rw + G,
		h1Size: Math.round(Math.min(56, Math.max(36, (leftOpenW - 68) / 8.6))),
		overPanel(px, py, askOpen) {
			const inLeft = px < M + lw + G + 6;
			const inRight = px > W - M - rw - G - 70;
			const inTop = py < M + HEAD_H + G + 6;
			const inBottom = py > H - M - FOOT_H - G - 40;
			const askR = rightOpen ? M : M + rw + G;
			const inAsk = askOpen && px > W - askR - 370 && py > H - M - 294;
			return inLeft || inRight || inTop || inBottom || inAsk;
		}
	};
}
