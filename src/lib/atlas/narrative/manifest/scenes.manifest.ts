import type { AtlasScene } from '../../core/types';

export const ATLAS_SCENES: readonly AtlasScene[] = [
	{
		id: 'scene-01-arrival',
		chapterNumber: 1,
		title: 'ARRIVAL',
		verb: 'arrive',
		startGlobalProgress: 0.0,
		endGlobalProgress: 0.15,
		cameraTarget: { x: 500, y: 500, zoom: 4.5, rotation: 0 },
		phases: [
			{
				type: 'enter',
				startProgress: 0.0,
				endProgress: 0.35,
				beats: [
					{
						startProgress: 0.0,
						endProgress: 0.35,
						narrativeText: '00° 31\' 12.4"S  107° 26\' 32.1"E',
						subtitle: 'PURWAKARTA REGIONAL ORIGIN POINT',
						actions: [{ type: 'focus', target: { x: 500, y: 500 }, zoom: 4.5 }]
					}
				]
			},
			{
				type: 'build',
				startProgress: 0.35,
				endProgress: 0.7,
				beats: [
					{
						startProgress: 0.35,
						endProgress: 0.7,
						narrativeText: 'RIKI RUSWANDI',
						subtitle: 'FULLSTACK & SYSTEMS ENGINEER',
						actions: [{ type: 'focus', target: { x: 500, y: 500 }, zoom: 2.8 }]
					}
				]
			},
			{
				type: 'hold',
				startProgress: 0.7,
				endProgress: 1.0,
				beats: [
					{
						startProgress: 0.7,
						endProgress: 1.0,
						narrativeText: 'KABUPATEN PURWAKARTA',
						subtitle: 'GEOGRAPHIC ORIGIN & SPATIAL ANCHOR',
						actions: [{ type: 'focus', target: { x: 500, y: 500 }, zoom: 1.6 }]
					}
				]
			}
		]
	},
	{
		id: 'scene-02-journey',
		chapterNumber: 2,
		title: 'JOURNEY',
		verb: 'trace',
		startGlobalProgress: 0.15,
		endGlobalProgress: 0.32,
		cameraTarget: { x: 580, y: 460, zoom: 1.2, rotation: 0 },
		phases: [
			{
				type: 'enter',
				startProgress: 0.0,
				endProgress: 0.35,
				beats: [
					{
						startProgress: 0.0,
						endProgress: 0.35,
						narrativeText: '2022 — 2023: FOUNDATIONS',
						subtitle: 'GEOSPATIAL SYSTEMS & REGIONAL MAPPING',
						actions: [{ type: 'focus', target: { x: 450, y: 420 }, zoom: 1.3 }]
					}
				]
			},
			{
				type: 'build',
				startProgress: 0.35,
				endProgress: 0.75,
				beats: [
					{
						startProgress: 0.35,
						endProgress: 0.75,
						narrativeText: '2024 — 2025: ENTERPRISE CORE',
						subtitle: 'HIGH-THROUGHPUT WMS & LOGISTICS LEDGERS',
						actions: [{ type: 'focus', target: { x: 650, y: 400 }, zoom: 1.15 }]
					}
				]
			},
			{
				type: 'hold',
				startProgress: 0.75,
				endProgress: 1.0,
				beats: [
					{
						startProgress: 0.75,
						endProgress: 1.0,
						narrativeText: '2026: AI AUTOMATION',
						subtitle: 'COMPUTER VISION INSPECTION & AUTOMATION',
						actions: [{ type: 'focus', target: { x: 420, y: 560 }, zoom: 1.1 }]
					}
				]
			}
		]
	},
	{
		id: 'scene-03-territories',
		chapterNumber: 3,
		title: 'TERRITORIES',
		verb: 'explore',
		startGlobalProgress: 0.32,
		endGlobalProgress: 0.52,
		cameraTarget: { x: 500, y: 500, zoom: 0.85, rotation: 0 },
		phases: [
			{
				type: 'enter',
				startProgress: 0.0,
				endProgress: 0.35,
				beats: [
					{
						startProgress: 0.0,
						endProgress: 0.35,
						narrativeText: 'FOUR DOMAIN CLUSTERS',
						subtitle: 'GIS • ENTERPRISE • AI • INFRASTRUCTURE',
						actions: [{ type: 'focus', target: { x: 500, y: 500 }, zoom: 0.85 }]
					}
				]
			},
			{
				type: 'build',
				startProgress: 0.35,
				endProgress: 0.7,
				beats: [
					{
						startProgress: 0.35,
						endProgress: 0.7,
						narrativeText: 'TERRITORY 01: GEOSPATIAL PLATFORMS',
						subtitle: 'SIPEDO PURWAKARTA & MULTI-LAYER VECTORS',
						actions: [{ type: 'focus', target: { x: 280, y: 260 }, zoom: 1.25 }]
					}
				]
			},
			{
				type: 'hold',
				startProgress: 0.7,
				endProgress: 1.0,
				beats: [
					{
						startProgress: 0.7,
						endProgress: 1.0,
						narrativeText: 'TERRITORY 02: ENTERPRISE & AI MESH',
						subtitle: 'HIGH-THROUGHPUT LEDGERS & DEFECT DETECTION',
						actions: [{ type: 'focus', target: { x: 720, y: 260 }, zoom: 1.25 }]
					}
				]
			}
		]
	},
	{
		id: 'scene-04-systems',
		chapterNumber: 4,
		title: 'SYSTEMS',
		verb: 'morph',
		startGlobalProgress: 0.52,
		endGlobalProgress: 0.72,
		cameraTarget: { x: 500, y: 480, zoom: 1.25, rotation: 0 },
		phases: [
			{
				type: 'enter',
				startProgress: 0.0,
				endProgress: 0.35,
				beats: [
					{
						startProgress: 0.0,
						endProgress: 0.35,
						narrativeText: 'TOPOLOGICAL RECONSTRUCTION',
						subtitle: 'GEOMETRY MORPHING TO DISTRIBUTED TOPOLOGY',
						actions: [{ type: 'focus', target: { x: 500, y: 480 }, zoom: 1.25 }]
					}
				]
			},
			{
				type: 'build',
				startProgress: 0.35,
				endProgress: 0.75,
				beats: [
					{
						startProgress: 0.35,
						endProgress: 0.75,
						narrativeText: 'SYSTEMS ARCHITECTURE MESH',
						subtitle: 'CLIENT -> EDGE GATEWAY -> SPATIAL POSTGIS',
						actions: [{ type: 'focus', target: { x: 500, y: 480 }, zoom: 1.3 }]
					}
				]
			},
			{
				type: 'hold',
				startProgress: 0.75,
				endProgress: 1.0,
				beats: [
					{
						startProgress: 0.75,
						endProgress: 1.0,
						narrativeText: 'DETERMINISTIC DATA STREAMS',
						subtitle: 'REAL-TIME TRANSACTION FLOW & SUB-50MS LATENCY',
						actions: [{ type: 'focus', target: { x: 500, y: 480 }, zoom: 1.25 }]
					}
				]
			}
		]
	},
	{
		id: 'scene-05-evidence',
		chapterNumber: 5,
		title: 'EVIDENCE',
		verb: 'examine',
		startGlobalProgress: 0.72,
		endGlobalProgress: 0.88,
		cameraTarget: { x: 460, y: 500, zoom: 1.1, rotation: 0 },
		phases: [
			{
				type: 'enter',
				startProgress: 0.0,
				endProgress: 0.4,
				beats: [
					{
						startProgress: 0.0,
						endProgress: 0.4,
						narrativeText: 'VERIFIED PRODUCTION EVIDENCE',
						subtitle: 'METRICS • POSTGIS QUERIES • STATE MACHINES',
						actions: [{ type: 'focus', target: { x: 460, y: 500 }, zoom: 1.1 }]
					}
				]
			},
			{
				type: 'build',
				startProgress: 0.4,
				endProgress: 0.8,
				beats: [
					{
						startProgress: 0.4,
						endProgress: 0.8,
						narrativeText: 'KNOWLEDGE GRAPH DRILLDOWN',
						subtitle: 'CLICK ANY ANCHOR NODE TO INSPECT CODE ARTIFACTS',
						actions: [{ type: 'focus', target: { x: 460, y: 500 }, zoom: 1.15 }]
					}
				]
			},
			{
				type: 'hold',
				startProgress: 0.8,
				endProgress: 1.0,
				beats: [
					{
						startProgress: 0.8,
						endProgress: 1.0,
						narrativeText: 'HIGH-IMPACT DELIVERABLES',
						subtitle: 'GOVERNMENT GIS & ENTERPRISE MANUFACTURING',
						actions: [{ type: 'focus', target: { x: 460, y: 500 }, zoom: 1.1 }]
					}
				]
			}
		]
	},
	{
		id: 'scene-06-horizon',
		chapterNumber: 6,
		title: 'HORIZON',
		verb: 'conclude',
		startGlobalProgress: 0.88,
		endGlobalProgress: 1.0,
		cameraTarget: { x: 500, y: 500, zoom: 0.95, rotation: 0 },
		phases: [
			{
				type: 'enter',
				startProgress: 0.0,
				endProgress: 0.5,
				beats: [
					{
						startProgress: 0.0,
						endProgress: 0.5,
						narrativeText: 'THE NEXT HORIZON',
						subtitle: 'READY FOR HIGH-SCALE DISTRIBUTED INITIATIVES',
						actions: [{ type: 'focus', target: { x: 500, y: 500 }, zoom: 0.95 }]
					}
				]
			},
			{
				type: 'hold',
				startProgress: 0.5,
				endProgress: 1.0,
				beats: [
					{
						startProgress: 0.5,
						endProgress: 1.0,
						narrativeText: 'ATLAS TERMINAL READY',
						subtitle: 'INITIATE CONTACT // DOWNLOAD ENGINEERING DOSSIER',
						actions: [{ type: 'focus', target: { x: 500, y: 500 }, zoom: 0.95 }]
					}
				]
			}
		]
	}
];
