/**
 * Folded World — Visitor Interaction Map
 * Type definitions untuk visualisasi geolokasi pengunjung.
 */

/** Representasi node geo yang sudah di-aggregate */
export interface GeoNode {
	readonly id: string;
	readonly country: string;
	readonly city: string | null;
	readonly latitude: number;
	readonly longitude: number;
	readonly count: number;
	readonly lastVisit: string; // ISO timestamp
	readonly browsers: string[];
	readonly devices: string[];
}

/** Response dari API /api/visitors/geo */
export interface GeoVisitorResponse {
	readonly nodes: GeoNode[];
	readonly totalVisitors: number;
	readonly lastUpdated: string;
}

/** Mode visualisasi */
export type ViewMode = 'fold' | 'heat' | 'timeline';

/** Konfigurasi world renderer */
export interface WorldConfig {
	readonly subdivisions: number; // Icosahedron subdivision level (1-3)
	readonly autoRotateSpeed: number; // Degrees per second
	readonly maxExtrusion: number; // Max vertex displacement
	readonly enableParticles: boolean;
	readonly wireframeOpacity: number;
	readonly backgroundColor: string;
}

/** Data tooltip saat hover */
export interface TooltipData {
	readonly visible: boolean;
	readonly x: number;
	readonly y: number;
	readonly node: GeoNode | null;
}

/** Detail panel saat klik */
export interface DetailPanelData {
	readonly visible: boolean;
	readonly node: GeoNode | null;
}

/** Default configuration */
export const DEFAULT_WORLD_CONFIG: WorldConfig = {
	subdivisions: 4,
	autoRotateSpeed: 0.15,
	maxExtrusion: 0.6,
	enableParticles: true,
	wireframeOpacity: 0.6,
	backgroundColor: '#0a0a0a'
};

/** Color palette — Brutalist Monochrome */
export const getWorldColors = (isDark: boolean) => ({
	background: isDark ? 0x0a0a0a : 0xfafafa,
	wireframe: isDark ? 0xe0e0e0 : 0x1a1a1a,
	faceCold: isDark ? 0x121212 : 0xf5f5f5, 
	faceHot: 0xff0000, // NEON RED for testing visibility
	accent: 0xff3333,
	text: isDark ? '#fafafa' : '#0a0a0a',
	textMuted: isDark ? '#666666' : '#999999'
});

export const WORLD_COLORS = getWorldColors(true); // Default to dark for legacy/static usage
