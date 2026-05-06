/**
 * Folded World — Geometry Utilities
 *
 * Pure utility functions untuk membuat dan memanipulasi
 * icosahedron mesh yang di-deformasi berdasarkan data visitor.
 */

import type { GeoNode } from './folded-world.types';

/**
 * Convert lat/lng (degrees) ke posisi 3D pada unit sphere.
 * Koordinat: Y = up, X = right, Z = towards camera.
 */
export function latLngToSphere(
	lat: number,
	lng: number,
	radius: number = 1
): [number, number, number] {
	const phi = ((90 - lat) * Math.PI) / 180;
	const theta = ((lng + 180) * Math.PI) / 180;

	const x = -(radius * Math.sin(phi) * Math.cos(theta));
	const y = radius * Math.cos(phi);
	const z = radius * Math.sin(phi) * Math.sin(theta);

	return [x, y, z];
}

/**
 * Hitung jarak antara dua titik di permukaan sphere (great-circle distance).
 * Return dalam radians.
 */
export function sphericalDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
	const phi1 = (lat1 * Math.PI) / 180;
	const phi2 = (lat2 * Math.PI) / 180;
	const dPhi = ((lat2 - lat1) * Math.PI) / 180;
	const dLambda = ((lng2 - lng1) * Math.PI) / 180;

	const a = Math.max(0, Math.min(1,
		Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
		Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) * Math.sin(dLambda / 2)
	));

	return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Map geo nodes ke face intensities pada icosahedron mesh.
 *
 * Untuk setiap face (triangle center), cari node terdekat dan
 * akumulasikan intensitas berdasarkan jarak.
 *
 * @param faceCenters - Array of [lat, lng] untuk setiap face center
 * @param nodes - GeoNode data dari server
 * @param influenceRadius - Radius pengaruh dalam radians (default ~30 degrees)
 * @returns Float array [0..1] per face, menunjukkan intensitas deformasi
 */
export function mapNodesToFaces(
	faceCenters: [number, number][],
	nodes: GeoNode[],
	influenceRadius: number = 1.5
): Float32Array {
	const faceCount = faceCenters.length;
	const intensities = new Float32Array(faceCount);

	// Use log scaling for better distribution
	const getVal = (count: number) => Math.log10(count + 1);
	const rawMax = nodes.length > 0 ? Math.max(...nodes.map((n) => Number(n.count || 0)), 1) : 1;
	const maxVal = getVal(rawMax) || 1.0; // Prevent division by zero

	for (let i = 0; i < faceCount; i++) {
		const [fLat, fLng] = faceCenters[i];
		let totalIntensity = 0;

		// --- FORCED DEVELOPER SPIKE (Jakarta) ---
		// Titik ini harus selalu ada jika pipeline visual bekerja
		const devDist = sphericalDistance(fLat, fLng, -6.2088, 106.8456);
		if (devDist < influenceRadius) {
			totalIntensity += Math.pow(1 - devDist / influenceRadius, 2.0);
		}

		// Only process nodes if we have them
		if (nodes.length > 0) {
			for (const node of nodes) {
				const nLat = Number(node.latitude);
				const nLng = Number(node.longitude);
				
				if (isNaN(nLat) || isNaN(nLng)) continue;

				const dist = sphericalDistance(fLat, fLng, nLat, nLng);

				if (dist < influenceRadius) {
					const weight = Math.pow(1 - dist / influenceRadius, 2.0);
					const normalizedVal = getVal(Number(node.count || 0)) / maxVal;
					totalIntensity += weight * normalizedVal;
				}
			}
		}

		// Higher gain to ensure visibility
		intensities[i] = Math.min(totalIntensity * 5.0, 1.0);
	}

	return intensities;
}

/**
 * Hitung center (lat, lng) dari sebuah triangle face di sphere.
 * Input: 3 vertex positions (x, y, z) pada unit sphere.
 */
export function faceCenter(
	v0: [number, number, number],
	v1: [number, number, number],
	v2: [number, number, number]
): [number, number] {
	// Average the 3 vertices
	const cx = (v0[0] + v1[0] + v2[0]) / 3;
	const cy = (v0[1] + v1[1] + v2[1]) / 3;
	const cz = (v0[2] + v1[2] + v2[2]) / 3;

	// Normalize to unit sphere
	const len = Math.sqrt(cx * cx + cy * cy + cz * cz);
	const nx = cx / len;
	const ny = cy / len;
	const nz = cz / len;

	// Inverse of latLngToSphere logic
	const phi = Math.acos(Math.max(-1, Math.min(1, ny))); // range [0, PI]
	const theta = Math.atan2(nz, -nx); // range [-PI, PI]

	const lat = 90 - (phi * 180) / Math.PI;
	let lng = (theta * 180) / Math.PI - 180;

	// Safe normalization to [-180, 180]
	lng = ((((lng + 180) % 360) + 360) % 360) - 180;

	return [lat, lng];
}

/**
 * Cari GeoNode terdekat ke posisi tertentu pada sphere.
 * Return null jika tidak ada node dalam radius yang ditentukan.
 */
export function findNearestNode(
	lat: number,
	lng: number,
	nodes: GeoNode[],
	maxRadiusDeg: number = 15
): GeoNode | null {
	const maxRadiusRad = (maxRadiusDeg * Math.PI) / 180;
	let nearest: GeoNode | null = null;
	let minDist = Infinity;

	for (const node of nodes) {
		const dist = sphericalDistance(lat, lng, node.latitude, node.longitude);
		if (dist < maxRadiusRad && dist < minDist) {
			minDist = dist;
			nearest = node;
		}
	}

	return nearest;
}

/**
 * Generate noise-based micro displacement untuk paper fold effect.
 * Simplex-like noise tanpa dependency — uses seeded random.
 */
export function paperFoldDisplacement(x: number, y: number, z: number, seed: number = 42): number {
	// Simple hash-based pseudo-noise
	const n = Math.sin(x * 12.9898 + y * 78.233 + z * 45.164 + seed) * 43758.5453;
	return (n - Math.floor(n)) * 2 - 1; // Range [-1, 1]
}

/**
 * Interpolasi warna antara dua hex values berdasarkan t [0..1].
 */
export function lerpColor(colorA: number, colorB: number, t: number): number {
	const clampT = Math.max(0, Math.min(1, t));

	const rA = (colorA >> 16) & 0xff;
	const gA = (colorA >> 8) & 0xff;
	const bA = colorA & 0xff;

	const rB = (colorB >> 16) & 0xff;
	const gB = (colorB >> 8) & 0xff;
	const bB = colorB & 0xff;

	const r = Math.round(rA + (rB - rA) * clampT);
	const g = Math.round(gA + (gB - gA) * clampT);
	const b = Math.round(bA + (bB - bA) * clampT);

	return (r << 16) | (g << 8) | b;
}

/**
 * Format relative time (e.g., "2h ago", "3d ago")
 */
export function formatRelativeTime(isoString: string): string {
	const date = new Date(isoString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);

	if (diffDay > 0) return `${diffDay}d ago`;
	if (diffHour > 0) return `${diffHour}h ago`;
	if (diffMin > 0) return `${diffMin}m ago`;
	return 'just now';
}
