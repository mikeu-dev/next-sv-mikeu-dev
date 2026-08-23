import type { AtlasPoint, AtlasGeoCoordinate, AtlasBounds } from '../core/types';

export class GeoNormalizer {
	private bounds: AtlasBounds;

	constructor(bounds: AtlasBounds) {
		this.bounds = bounds;
	}

	public projectToViewBox(geo: AtlasGeoCoordinate): AtlasPoint {
		const xSpan = this.bounds.maxX - this.bounds.minX;
		const ySpan = this.bounds.maxY - this.bounds.minY;

		const normalizedX = (geo.longitude - this.bounds.minX) / (xSpan || 1);
		const normalizedY = 1.0 - (geo.latitude - this.bounds.minY) / (ySpan || 1);

		return {
			x: Math.max(0, Math.min(1000, normalizedX * 1000)),
			y: Math.max(0, Math.min(1000, normalizedY * 1000))
		};
	}

	public interpolatePoints(pointA: AtlasPoint, pointB: AtlasPoint, progress: number): AtlasPoint {
		const clampedProgress = Math.max(0, Math.min(1, progress));
		return {
			x: pointA.x + (pointB.x - pointA.x) * clampedProgress,
			y: pointA.y + (pointB.y - pointA.y) * clampedProgress
		};
	}
}
