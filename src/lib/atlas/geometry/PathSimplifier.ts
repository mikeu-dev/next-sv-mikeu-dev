import type { AtlasPoint } from '../core/types';

export class PathSimplifier {
	/**
	 * Perpendicular distance from a point to a line segment (P1-P2)
	 */
	private static getPerpendicularDistance(
		point: AtlasPoint,
		lineStart: AtlasPoint,
		lineEnd: AtlasPoint
	): number {
		const dx = lineEnd.x - lineStart.x;
		const dy = lineEnd.y - lineStart.y;
		const lineLengthSquared = dx * dx + dy * dy;

		if (lineLengthSquared === 0) {
			const px = point.x - lineStart.x;
			const py = point.y - lineStart.y;
			return Math.sqrt(px * px + py * py);
		}

		const t = Math.max(
			0,
			Math.min(1, ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lineLengthSquared)
		);
		const projX = lineStart.x + t * dx;
		const projY = lineStart.y + t * dy;

		const diffX = point.x - projX;
		const diffY = point.y - projY;

		return Math.sqrt(diffX * diffX + diffY * diffY);
	}

	/**
	 * Douglas-Peucker algorithm implementation for multi-resolution polygon LOD
	 */
	public static simplify(points: readonly AtlasPoint[], epsilon: number): AtlasPoint[] {
		if (points.length <= 2 || epsilon <= 0) {
			return [...points];
		}

		let maxDistance = 0;
		let index = 0;
		const start = points[0]!;
		const end = points[points.length - 1]!;

		for (let i = 1; i < points.length - 1; i++) {
			const distance = this.getPerpendicularDistance(points[i]!, start, end);
			if (distance > maxDistance) {
				maxDistance = distance;
				index = i;
			}
		}

		if (maxDistance > epsilon) {
			const leftSub = this.simplify(points.slice(0, index + 1), epsilon);
			const rightSub = this.simplify(points.slice(index), epsilon);
			return [...leftSub.slice(0, -1), ...rightSub];
		}

		return [start, end];
	}

	/**
	 * Convert list of points to SVG path string d="M x y L x y ... Z"
	 */
	public static toSvgPathString(points: readonly AtlasPoint[], closed: boolean = true): string {
		if (points.length === 0) return '';
		const commands = points.map(
			(p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
		);
		return closed ? `${commands.join(' ')} Z` : commands.join(' ');
	}
}
