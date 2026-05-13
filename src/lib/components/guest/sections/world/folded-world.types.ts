/**
 * Folded World â€” Visitor Interaction Map
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

/** Gaya planet */
export type PlanetStyle =
	| 'mercury'
	| 'venus'
	| 'earth'
	| 'mars'
	| 'jupiter'
	| 'saturn'
	| 'uranus'
	| 'neptune';

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
	subdivisions: 60,
	autoRotateSpeed: 0.15,
	maxExtrusion: 0.45,
	enableParticles: true,
	wireframeOpacity: 0.6,
	backgroundColor: '#0a0a0a'
};

/** Color palette â€” Dynamic Planet Styles */
export const getPlanetColors = (style: PlanetStyle, isDark: boolean) => {
	const base = {
		background: isDark ? 0x0a0a0a : 0xfafafa,
		text: isDark ? '#fafafa' : '#0a0a0a',
		textMuted: isDark ? '#666666' : '#999999'
	};

	switch (style) {
		case 'mercury':
			return {
				...base,
				wireframe: isDark ? 0x888888 : 0x444444,
				faceCold: isDark ? 0x111111 : 0xf0f0f0,
				faceHot: isDark ? 0xaaaaaa : 0x333333,
				accent: 0xffffff,
				neon: 0xcccccc
			};
		case 'venus':
			return {
				...base,
				wireframe: isDark ? 0xffcc66 : 0xaa8844,
				faceCold: isDark ? 0x1a1505 : 0xfdfaf0,
				faceHot: isDark ? 0xffcc33 : 0x886622,
				accent: 0xff6600,
				neon: 0xf1c40f
			};
		case 'mars':
			return {
				...base,
				wireframe: isDark ? 0xff5533 : 0xaa3322,
				faceCold: isDark ? 0x220a05 : 0xfdf2f0,
				faceHot: isDark ? 0xff4422 : 0xdd2211,
				accent: 0xffaa00,
				neon: 0xff6600
			};
		case 'jupiter':
			return {
				...base,
				wireframe: isDark ? 0xffaa66 : 0xbb7744,
				faceCold: isDark ? 0x1a0f05 : 0xfdf5f0,
				faceHot: isDark ? 0xff9944 : 0xcc6633,
				accent: 0xff3333,
				neon: 0xe67e22
			};
		case 'saturn':
			return {
				...base,
				wireframe: isDark ? 0xeedd88 : 0xaa9944,
				faceCold: isDark ? 0x151205 : 0xfdfaf0,
				faceHot: isDark ? 0xffdd88 : 0xccaa55,
				accent: 0xffffff,
				neon: 0xf4d03f
			};
		case 'uranus':
			return {
				...base,
				wireframe: isDark ? 0x66ffff : 0x33aaaa,
				faceCold: isDark ? 0x051a1a : 0xf0fdfd,
				faceHot: isDark ? 0x33cccc : 0x116666,
				accent: 0xffffff,
				neon: 0x1abc9c
			};
		case 'neptune':
			return {
				...base,
				wireframe: isDark ? 0x3366ff : 0x1133aa,
				faceCold: isDark ? 0x05051a : 0xf0f0fd,
				faceHot: isDark ? 0x3366ff : 0x1133aa,
				accent: 0x00f3ff,
				neon: 0x3498db
			};
		case 'earth':
		default:
			return {
				...base,
				wireframe: isDark ? 0xe0e0e0 : 0x1a1a1a,
				faceCold: isDark ? 0x121212 : 0xf5f5f5,
				faceHot: isDark ? 0xffffff : 0x000000,
				accent: 0xff3333,
				neon: 0x00f3ff
			};
	}
};

/** @deprecated Use getPlanetColors instead */
export const getWorldColors = (isDark: boolean) => getPlanetColors('earth', isDark);

export const WORLD_COLORS = getPlanetColors('earth', true);
