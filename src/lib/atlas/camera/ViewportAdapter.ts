import type { AtlasBounds, AtlasPoint } from '../core/types';

export class ViewportAdapter {
	private screenWidth: number = 1920;
	private screenHeight: number = 1080;

	constructor(screenWidth: number = 1920, screenHeight: number = 1080) {
		this.updateDimensions(screenWidth, screenHeight);
	}

	public updateDimensions(width: number, height: number): void {
		this.screenWidth = Math.max(1, width);
		this.screenHeight = Math.max(1, height);
	}

	public getAspectRatio(): number {
		return this.screenWidth / this.screenHeight;
	}

	public isMobile(): boolean {
		return this.screenWidth < 768;
	}

	/**
	 * Adjusts target zoom level to ensure entire territory is visible on mobile screens
	 */
	public getResponsiveZoom(baseZoom: number): number {
		if (this.isMobile()) {
			return baseZoom * 0.75;
		}
		return baseZoom;
	}

	/**
	 * Converts client screen pixels (clientX, clientY) to SVG 1000x1000 ViewBox coordinates
	 */
	public screenToSvgCoordinates(
		clientX: number,
		clientY: number,
		svgElement: SVGSVGElement
	): AtlasPoint {
		const pt = svgElement.createSVGPoint();
		pt.x = clientX;
		pt.y = clientY;
		const globalMatrix = svgElement.getScreenCTM();
		if (!globalMatrix) return { x: 500, y: 500 };
		const transformed = pt.matrixTransform(globalMatrix.inverse());
		return {
			x: Math.max(0, Math.min(1000, transformed.x)),
			y: Math.max(0, Math.min(1000, transformed.y))
		};
	}

	public calculateVisibleBounds(centerX: number, centerY: number, zoom: number): AtlasBounds {
		const halfWidth = (500 / Math.max(0.1, zoom)) * this.getAspectRatio();
		const halfHeight = 500 / Math.max(0.1, zoom);

		return {
			minX: Math.max(0, centerX - halfWidth),
			maxX: Math.min(1000, centerX + halfWidth),
			minY: Math.max(0, centerY - halfHeight),
			maxY: Math.min(1000, centerY + halfHeight)
		};
	}
}
