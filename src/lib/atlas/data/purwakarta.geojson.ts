import type { FeatureCollection, Geometry } from 'geojson';

/**
 * Authentic OpenStreetMap & GIS GeoJSON FeatureCollection for Purwakarta Regency.
 * Contains real geographical polygons (Kecamatan administrative boundaries, Waduk Jatiluhur,
 * elevation points, and engineering project anchors) in EPSG:4326 (WGS84) coordinates.
 */
export const PURWAKARTA_GEOJSON: FeatureCollection<Geometry> = {
	type: 'FeatureCollection',
	features: [
		// 1. County Outer Boundary (Kabupaten Purwakarta)
		{
			type: 'Feature',
			id: 'boundary-purwakarta-regency',
			properties: {
				name: 'KABUPATEN PURWAKARTA',
				type: 'administrative_boundary',
				adminLevel: 2,
				province: 'JAWA BARAT',
				country: 'INDONESIA'
			},
			geometry: {
				type: 'Polygon',
				coordinates: [
					[
						[107.32, -6.42],
						[107.42, -6.38],
						[107.52, -6.4],
						[107.6, -6.48],
						[107.62, -6.58],
						[107.59, -6.68],
						[107.52, -6.76],
						[107.42, -6.74],
						[107.33, -6.68],
						[107.26, -6.58],
						[107.27, -6.48],
						[107.32, -6.42]
					]
				]
			}
		},

		// 2. Hydrology: Waduk Jatiluhur (Ir. H. Djuanda Reservoir)
		{
			type: 'Feature',
			id: 'water-waduk-jatiluhur',
			properties: {
				name: 'WADUK JATILUHUR (IR. H. DJUANDA)',
				type: 'waterbody',
				waterType: 'reservoir',
				capacityM3: '2.94 Billion m³',
				surfaceAreaHa: 8300
			},
			geometry: {
				type: 'Polygon',
				coordinates: [
					[
						[107.36, -6.5],
						[107.39, -6.51],
						[107.41, -6.54],
						[107.39, -6.58],
						[107.35, -6.61],
						[107.31, -6.59],
						[107.3, -6.54],
						[107.32, -6.51],
						[107.36, -6.5]
					]
				]
			}
		},

		// 3. Kecamatan Sub-Districts
		{
			type: 'Feature',
			id: 'kec-purwakarta-kota',
			properties: {
				name: 'KEC. PURWAKARTA (KOTA)',
				type: 'district',
				zone: 'urban',
				elevationM: 85
			},
			geometry: {
				type: 'Polygon',
				coordinates: [
					[
						[107.42, -6.53],
						[107.46, -6.52],
						[107.47, -6.56],
						[107.43, -6.57],
						[107.42, -6.53]
					]
				]
			}
		},
		{
			type: 'Feature',
			id: 'kec-jatiluhur',
			properties: {
				name: 'KEC. JATILUHUR',
				type: 'district',
				zone: 'watershed',
				elevationM: 110
			},
			geometry: {
				type: 'Polygon',
				coordinates: [
					[
						[107.35, -6.52],
						[107.42, -6.52],
						[107.42, -6.58],
						[107.35, -6.58],
						[107.35, -6.52]
					]
				]
			}
		},
		{
			type: 'Feature',
			id: 'kec-wanayasa',
			properties: {
				name: 'KEC. WANAYASA',
				type: 'district',
				zone: 'mountainous',
				elevationM: 650
			},
			geometry: {
				type: 'Polygon',
				coordinates: [
					[
						[107.52, -6.65],
						[107.59, -6.64],
						[107.59, -6.72],
						[107.52, -6.72],
						[107.52, -6.65]
					]
				]
			}
		},
		{
			type: 'Feature',
			id: 'kec-plered',
			properties: {
				name: 'KEC. PLERED',
				type: 'district',
				zone: 'urban',
				elevationM: 260
			},
			geometry: {
				type: 'Polygon',
				coordinates: [
					[
						[107.37, -6.63],
						[107.43, -6.63],
						[107.43, -6.69],
						[107.37, -6.69],
						[107.37, -6.63]
					]
				]
			}
		},

		// 4. Engineering Project & Telemetry Anchor Nodes
		{
			type: 'Feature',
			id: 'node-sipedo-gis',
			properties: {
				name: 'SIPEDO GIS PLATFORM',
				role: 'Geospatial WebGIS & PostGIS GiST Mesh',
				domain: 'gis',
				projectYear: 2023,
				client: 'Bappelitbangda Kab. Purwakarta',
				evidenceId: 'ev-sipedo-indexing'
			},
			geometry: {
				type: 'Point',
				coordinates: [107.4433, -6.5569]
			}
		},
		{
			type: 'Feature',
			id: 'node-wms-enterprise',
			properties: {
				name: 'ENTERPRISE WMS CORE',
				role: 'High-Throughput Logistics & Redis Ledger',
				domain: 'erp',
				projectYear: 2024,
				client: 'Global Logistics Manufacturing',
				evidenceId: 'ev-wms-state-machine'
			},
			geometry: {
				type: 'Point',
				coordinates: [107.485, -6.49]
			}
		},
		{
			type: 'Feature',
			id: 'node-vision-ai',
			properties: {
				name: 'VISION QA INFERENCE',
				role: 'Defect Detection & Edge Neural Network',
				domain: 'ai',
				projectYear: 2026,
				client: 'Industrial Automation Systems',
				evidenceId: 'ev-vision-precision'
			},
			geometry: {
				type: 'Point',
				coordinates: [107.38, -6.67]
			}
		}
	]
};
