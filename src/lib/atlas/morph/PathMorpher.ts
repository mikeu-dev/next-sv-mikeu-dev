import type { AtlasPoint } from '../core/types';

export class PathMorpher {
	private resampledSource: AtlasPoint[];
	private resampledTarget: AtlasPoint[];
	private vertexCount: number;

	constructor(
		sourcePoints: readonly AtlasPoint[],
		targetPoints: readonly AtlasPoint[],
		vertexCount: number = 64
	) {
		this.vertexCount = vertexCount;
		this.resampledSource = this.resamplePolyline(sourcePoints, vertexCount);
		this.resampledTarget = this.resamplePolyline(targetPoints, vertexCount);
	}

	/**
	 * Resamples a closed polygon into N uniformly distributed points along its perimeter
	 */
	private resamplePolyline(points: readonly AtlasPoint[], targetCount: number): AtlasPoint[] {
		if (points.length < 2) {
			return Array(targetCount).fill(points[0] ?? { x: 500, y: 500 });
		}

		// 1. Calculate cumulative perimeter lengths
		const lengths: number[] = [0];
		let totalLength = 0;

		for (let i = 0; i < points.length; i++) {
			const p1 = points[i]!;
			const p2 = points[(i + 1) % points.length]!;
			const segmentLength = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
			totalLength += segmentLength;
			lengths.push(totalLength);
		}

		if (totalLength === 0) {
			return Array(targetCount).fill(points[0]!);
		}

		// 2. Uniform sample interval
		const step = totalLength / targetCount;
		const resampled: AtlasPoint[] = [];

		for (let j = 0; j < targetCount; j++) {
			const targetDist = j * step;

			// Find segment containing targetDist
			let segIdx = 0;
			while (segIdx < lengths.length - 1 && lengths[segIdx + 1]! < targetDist) {
				segIdx++;
			}

			const segStartDist = lengths[segIdx]!;
			const segEndDist = lengths[segIdx + 1] ?? totalLength;
			const segSpan = segEndDist - segStartDist;

			const p1 = points[segIdx % points.length]!;
			const p2 = points[(segIdx + 1) % points.length]!;

			const t = segSpan > 0 ? (targetDist - segStartDist) / segSpan : 0;
			resampled.push({
				x: p1.x + (p2.x - p1.x) * t,
				y: p1.y + (p2.y - p1.y) * t
			});
		}

		return resampled;
	}

	/**
	 * Linearly interpolates between resampled source and target at progress p (0..1)
	 */
	public interpolate(progress: number): AtlasPoint[] {
		const clampedProgress = Math.max(0, Math.min(1, progress));
		const result: AtlasPoint[] = [];

		for (let i = 0; i < this.vertexCount; i++) {
			const pSrc = this.resampledSource[i]!;
			const pTgt = this.resampledTarget[i]!;
			result.push({
				x: pSrc.x + (pTgt.x - pSrc.x) * clampedProgress,
				y: pSrc.y + (pTgt.y - pSrc.y) * clampedProgress
			});
		}

		return result;
	}

	/**
	 * Generates interpolated SVG path string d="M ... L ... Z" at progress p
	 */
	public getInterpolatedPathString(progress: number): string {
		const points = this.interpolate(progress);
		if (points.length === 0) return '';
		const commands = points.map(
			(p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
		);
		return `${commands.join(' ')} Z`;
	}
}
