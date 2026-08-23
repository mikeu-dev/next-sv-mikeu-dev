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
				endProgress: 0.25,
				beats: [
					{
						startProgress: 0.0,
						endProgress: 0.25,
						narrativeText: '00° 31\' 12.4"S  107° 26\' 32.1"E',
						subtitle: 'PURWAKARTA REGIONAL ORIGIN POINT',
						actions: [{ type: 'focus', target: { x: 500, y: 500 }, zoom: 4.5 }]
					}
				]
			},
			{
				type: 'build',
				startProgress: 0.25,
				endProgress: 0.6,
				beats: [
					{
						startProgress: 0.25,
						endProgress: 0.6,
						narrativeText: 'RIKI RUSWANDI',
						subtitle: 'FULLSTACK & SYSTEMS ENGINEER',
						actions: [{ type: 'focus', target: { x: 500, y: 500 }, zoom: 2.8 }]
					}
				]
			},
			{
				type: 'hold',
				startProgress: 0.6,
				endProgress: 1.0,
				beats: [
					{
						startProgress: 0.6,
						endProgress: 1.0,
						narrativeText: 'KABUPATEN PURWAKARTA',
						subtitle: 'GEOGRAPHIC ORIGIN & SPATIAL ANCHOR',
						actions: [{ type: 'focus', target: { x: 500, y: 500 }, zoom: 1.3 }]
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
		cameraTarget: { x: 580, y: 480, zoom: 1.1, rotation: 0 },
		phases: [
			{
				type: 'enter',
				startProgress: 0.0,
				endProgress: 0.3,
				beats: [
					{
						startProgress: 0.0,
						endProgress: 0.3,
						narrativeText: '2022 — 2023: FOUNDATIONS',
						subtitle: 'GEOSPATIAL SYSTEMS & REGIONAL MAPPING',
						actions: [{ type: 'focus', target: { x: 500, y: 500 }, zoom: 1.2 }]
					}
				]
			},
			{
				type: 'build',
				startProgress: 0.3,
				endProgress: 0.7,
				beats: [
					{
						startProgress: 0.3,
						endProgress: 0.7,
						narrativeText: '2024 — 2025: ENTERPRISE CORE',
						subtitle: 'HIGH-THROUGHPUT WMS & LOGISTICS LEDGERS',
						actions: [{ type: 'focus', target: { x: 620, y: 450 }, zoom: 1.05 }]
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
						narrativeText: '2026: DISTRIBUTED & AI SYSTEMS',
						subtitle: 'COMPUTER VISION INSPECTION & AUTOMATION',
						actions: [{ type: 'focus', target: { x: 650, y: 420 }, zoom: 1.0 }]
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
						narrativeText: 'TERRITORY A: GEOSPATIAL PLATFORMS',
						subtitle: 'SIPEDO PURWAKARTA & MULTI-LAYER VECTORS',
						actions: [{ type: 'focus', target: { x: 420, y: 460 }, zoom: 1.2 }]
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
						narrativeText: 'TERRITORY B: ENTERPRISE LOGISTICS',
						subtitle: 'REALTIME WMS & PRODUCTION ASSEMBLY CORE',
						actions: [{ type: 'focus', target: { x: 650, y: 400 }, zoom: 1.2 }]
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
		cameraTarget: { x: 500, y: 500, zoom: 1.15, rotation: 0 },
		phases: [
			{
				type: 'enter',
				startProgress: 0.0,
				endProgress: 0.3,
				beats: [
					{
						startProgress: 0.0,
						endProgress: 0.3,
						narrativeText: 'THE TOPOLOGY TRANSFORMATION',
						subtitle: 'FROM GEOGRAPHIC BOUNDARIES TO DISTRIBUTED SYSTEMS',
						actions: [{ type: 'focus', target: { x: 500, y: 500 }, zoom: 1.1 }]
					}
				]
			},
			{
				type: 'build',
				startProgress: 0.3,
				endProgress: 0.7,
				beats: [
					{
						startProgress: 0.3,
						endProgress: 0.7,
						narrativeText: 'EDGE ROUTER & SPATIAL ENGINE',
						subtitle: 'LOW LATENCY QUERY MESH & REALTIME WEBSOCKETS',
						actions: [{ type: 'focus', target: { x: 500, y: 500 }, zoom: 1.25 }]
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
						narrativeText: 'DATA STREAMING PIPELINES',
						subtitle: 'POSTGIS CLUSTERING & REDIS ATOMIC LOCKS',
						actions: [{ type: 'focus', target: { x: 500, y: 500 }, zoom: 1.15 }]
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
		cameraTarget: { x: 440, y: 500, zoom: 1.05, rotation: 0 },
		phases: [
			{
				type: 'enter',
				startProgress: 0.0,
				endProgress: 0.4,
				beats: [
					{
						startProgress: 0.0,
						endProgress: 0.4,
						narrativeText: 'VERIFIED PRODUCTION ARTIFACTS',
						subtitle: 'BENCHMARKS • PRODUCTION QUERIES • METRICS',
						actions: [{ type: 'focus', target: { x: 440, y: 500 }, zoom: 1.05 }]
					}
				]
			},
			{
				type: 'hold',
				startProgress: 0.4,
				endProgress: 1.0,
				beats: [
					{
						startProgress: 0.4,
						endProgress: 1.0,
						narrativeText: 'DEEP ARTIFACT DRILLDOWN',
						subtitle: 'CLICK ANY ANCHOR NODE TO INSPECT EVIDENCE',
						actions: [{ type: 'focus', target: { x: 440, y: 500 }, zoom: 1.05 }]
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
						narrativeText: 'SYSTEM TERMINAL READY',
						subtitle: '100% SPATIAL NODES UNLOCKED',
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
						narrativeText: 'YOU ARE HERE',
						subtitle: "LET'S ENGINEER WHAT'S NEXT",
						actions: [{ type: 'focus', target: { x: 500, y: 500 }, zoom: 0.95 }]
					}
				]
			}
		]
	}
];
