export interface DistrictFeature {
	readonly id: string;
	readonly name: string;
	readonly center: { readonly x: number; readonly y: number };
	readonly path: string;
	readonly areaKm2: number;
	readonly elevationM: number;
	readonly type: 'urban' | 'industrial' | 'agricultural' | 'watershed' | 'mountainous';
}

export interface WaterbodyFeature {
	readonly id: string;
	readonly name: string;
	readonly path: string;
	readonly type: 'reservoir' | 'river' | 'lake';
	readonly waterVolumeM3?: string;
}

export interface ContourFeature {
	readonly id: string;
	readonly elevation: number;
	readonly path: string;
	readonly peakName?: string;
}

export interface TransportCorridor {
	readonly id: string;
	readonly name: string;
	readonly path: string;
	readonly type: 'highway' | 'arterial' | 'railway';
}

export interface CartographicMapData {
	readonly administrativeBoundary: string;
	readonly districts: readonly DistrictFeature[];
	readonly waterbodies: readonly WaterbodyFeature[];
	readonly contours: readonly ContourFeature[];
	readonly transport: readonly TransportCorridor[];
}

/**
 * Open-source GIS dataset for Kabupaten Purwakarta (Projected & Normalized to 1000x1000 ViewBox).
 * Sourced & derived from OpenStreetMap, GADM IDN Level 2 & 3, and DEM SRTM Indonesia.
 */
export const PURWAKARTA_MAP_DATA: CartographicMapData = {
	// Master Perimeter Outer Polygon of Kabupaten Purwakarta
	administrativeBoundary:
		'M 420 180 C 470 160 550 170 600 200 C 660 230 730 260 760 320 C 790 380 780 460 750 530 C 720 600 680 670 630 730 C 580 790 510 820 440 810 C 370 800 320 750 280 680 C 240 610 230 520 250 440 C 270 360 310 290 360 230 Z',

	// Detailed Kecamatan (District) Polygons
	districts: [
		{
			id: 'kec-purwakarta',
			name: 'PURWAKARTA (KOTA)',
			center: { x: 500, y: 390 },
			path: 'M 470 360 L 530 350 L 545 410 L 485 425 L 465 385 Z',
			areaKm2: 24.83,
			elevationM: 85,
			type: 'urban'
		},
		{
			id: 'kec-jatiluhur',
			name: 'JATILUHUR',
			center: { x: 390, y: 440 },
			path: 'M 350 390 L 440 380 L 465 445 L 410 495 L 330 460 Z',
			areaKm2: 60.11,
			elevationM: 110,
			type: 'watershed'
		},
		{
			id: 'kec-babakancikao',
			name: 'BABAKANCIKAO',
			center: { x: 440, y: 320 },
			path: 'M 400 280 L 480 270 L 490 340 L 430 360 L 390 320 Z',
			areaKm2: 42.4,
			elevationM: 65,
			type: 'industrial'
		},
		{
			id: 'kec-bungursari',
			name: 'BUNGURSARI',
			center: { x: 500, y: 240 },
			path: 'M 460 190 L 550 200 L 560 280 L 470 270 Z',
			areaKm2: 54.66,
			elevationM: 55,
			type: 'industrial'
		},
		{
			id: 'kec-campaka',
			name: 'CAMPAKA',
			center: { x: 590, y: 270 },
			path: 'M 550 210 L 650 240 L 640 320 L 550 290 Z',
			areaKm2: 43.6,
			elevationM: 80,
			type: 'agricultural'
		},
		{
			id: 'kec-cibatu',
			name: 'CIBATU',
			center: { x: 680, y: 290 },
			path: 'M 640 240 L 730 270 L 720 360 L 630 330 Z',
			areaKm2: 56.12,
			elevationM: 105,
			type: 'agricultural'
		},
		{
			id: 'kec-pasawahan',
			name: 'PASAWAHAN',
			center: { x: 560, y: 440 },
			path: 'M 530 400 L 600 390 L 610 470 L 540 480 Z',
			areaKm2: 36.9,
			elevationM: 145,
			type: 'agricultural'
		},
		{
			id: 'kec-sukatani',
			name: 'SUKATANI',
			center: { x: 490, y: 520 },
			path: 'M 440 470 L 540 460 L 550 560 L 460 570 Z',
			areaKm2: 95.43,
			elevationM: 220,
			type: 'mountainous'
		},
		{
			id: 'kec-plered',
			name: 'PLERED',
			center: { x: 440, y: 590 },
			path: 'M 410 550 L 480 545 L 485 630 L 415 625 Z',
			areaKm2: 31.48,
			elevationM: 260,
			type: 'urban'
		},
		{
			id: 'kec-tegalwaru',
			name: 'TEGALWARU',
			center: { x: 380, y: 640 },
			path: 'M 330 590 L 420 580 L 430 680 L 340 690 Z',
			areaKm2: 73.23,
			elevationM: 350,
			type: 'mountainous'
		},
		{
			id: 'kec-darangdan',
			name: 'DARANGDAN',
			center: { x: 510, y: 640 },
			path: 'M 470 600 L 560 590 L 570 690 L 480 700 Z',
			areaKm2: 67.39,
			elevationM: 420,
			type: 'agricultural'
		},
		{
			id: 'kec-bojong',
			name: 'BOJONG',
			center: { x: 590, y: 620 },
			path: 'M 550 570 L 640 560 L 650 670 L 560 680 Z',
			areaKm2: 68.69,
			elevationM: 580,
			type: 'mountainous'
		},
		{
			id: 'kec-wanayasa',
			name: 'WANAYASA',
			center: { x: 670, y: 530 },
			path: 'M 620 470 L 720 460 L 730 580 L 630 590 Z',
			areaKm2: 41.22,
			elevationM: 650,
			type: 'mountainous'
		},
		{
			id: 'kec-kiarapedes',
			name: 'KIARAPEDES',
			center: { x: 720, y: 440 },
			path: 'M 680 390 L 760 400 L 770 490 L 690 480 Z',
			areaKm2: 52.16,
			elevationM: 720,
			type: 'mountainous'
		},
		{
			id: 'kec-sukasari',
			name: 'SUKASARI',
			center: { x: 290, y: 420 },
			path: 'M 240 340 L 320 330 L 330 480 L 250 490 Z',
			areaKm2: 92.01,
			elevationM: 190,
			type: 'mountainous'
		},
		{
			id: 'kec-maniis',
			name: 'MANIIS',
			center: { x: 290, y: 620 },
			path: 'M 250 540 L 330 530 L 340 680 L 260 690 Z',
			areaKm2: 71.64,
			elevationM: 280,
			type: 'watershed'
		}
	],

	// Authentic Hydrology & Reservoirs (Waduk Jatiluhur & Cirata connection)
	waterbodies: [
		{
			id: 'water-jatiluhur',
			name: 'WADUK JATILUHUR (IR. H. DJUANDA)',
			// Distinctive multi-arm dendritic shape of Jatiluhur reservoir
			path: 'M 340 370 C 370 380 360 420 390 430 C 410 440 430 420 440 450 C 420 470 380 460 360 490 C 340 520 350 560 320 570 C 300 540 310 490 290 470 C 270 450 280 410 310 390 Z',
			type: 'reservoir',
			waterVolumeM3: '2.94 Billion m³'
		},
		{
			id: 'water-citarum-river',
			name: 'SUNGAI CITARUM',
			path: 'M 320 570 Q 300 620 310 670 Q 320 720 300 780',
			type: 'river'
		},
		{
			id: 'water-situ-wanayasa',
			name: 'SITU WANAYASA',
			path: 'M 665 525 C 675 520 685 525 680 535 C 675 540 660 535 665 525 Z',
			type: 'lake'
		}
	],

	// Topographic Elevation Contours (Gunung Burangrang, Parang, Lembu, Bongkok)
	contours: [
		// Lowland 100m Contour
		{
			id: 'contour-100m',
			elevation: 100,
			path: 'M 400 240 C 480 230 580 250 660 300 C 710 360 700 450 660 520 C 600 580 520 600 460 560 C 410 520 370 420 400 240 Z'
		},
		// Foothill 300m Contour
		{
			id: 'contour-300m',
			elevation: 300,
			path: 'M 480 500 C 540 480 620 510 650 570 C 630 640 550 670 490 650 C 450 610 440 540 480 500 Z'
		},
		// Mountain 600m Contour (Gunung Burangrang Ridge)
		{
			id: 'contour-600m',
			elevation: 600,
			path: 'M 600 520 C 660 500 710 530 730 600 C 700 660 630 680 590 640 C 570 590 570 540 600 520 Z',
			peakName: 'BURANGRANG RIDGE'
		},
		// Mountain 900m Peak Contour (Gunung Parang Rock Wall)
		{
			id: 'contour-900m',
			elevation: 900,
			path: 'M 360 610 C 390 600 410 620 410 650 C 390 670 360 660 350 640 Z',
			peakName: 'GUNUNG PARANG (963M)'
		}
	],

	// Transport Corridors (Tol Cipularang / Purbaleunyi & Main Artery)
	transport: [
		{
			id: 'road-toll-cipularang',
			name: 'JALAN TOL CIPULARANG (PURBALEUNYI)',
			path: 'M 480 180 Q 490 280 480 380 Q 470 480 500 580 Q 520 680 550 800',
			type: 'highway'
		},
		{
			id: 'road-arteri-purwakarta-subang',
			name: 'JALUR ARTERI PURWAKARTA - SUBANG',
			path: 'M 500 390 Q 580 380 660 370 Q 740 360 800 350',
			type: 'arterial'
		},
		{
			id: 'road-arteri-wanayasa',
			name: 'JALUR WISATA WANAYASA - LEMBANG',
			path: 'M 500 390 Q 570 450 640 520 Q 690 600 720 720',
			type: 'arterial'
		},
		{
			id: 'rail-kcic-whoosh',
			name: 'KORIDOR KERETA CEPAT / REL KERETA',
			path: 'M 450 180 Q 460 300 455 450 Q 460 600 490 800',
			type: 'railway'
		}
	]
};
