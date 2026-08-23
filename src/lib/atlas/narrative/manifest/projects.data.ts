import type { AtlasProject } from '../../core/types';

export const SIPEDO_PROJECT_MANIFEST: AtlasProject = {
	id: 'proj-sipedo-purwakarta',
	slug: 'sipedo-purwakarta',
	title: 'SIPEDO WebGIS Platform',
	tagLine: 'Sistem Informasi Pemetaan Geospasial Multi-Layer & Analisis Wilayah Terpadu',
	domain: 'gis',
	clientOrOrg: 'Pemerintah Kabupaten Purwakarta',
	year: 2023,
	location: {
		id: 'anchor-pwk',
		label: 'Kab. Purwakarta Base',
		point: { x: 500, y: 500 },
		geo: { latitude: -0.52, longitude: 107.442 },
		territoryId: 'gis'
	},
	stack: [
		'SvelteKit',
		'TypeScript',
		'PostgreSQL',
		'PostGIS',
		'Leaflet / Mapbox GL',
		'Go (Golang)',
		'GSAP'
	],
	evidence: [
		{
			id: 'ev-sipedo-spatial-index',
			projectId: 'proj-sipedo-purwakarta',
			title: 'PostGIS Spatial Query Optimization & GiST Indexing',
			domain: 'gis',
			artifacts: [
				{
					id: 'art-sipedo-latency',
					title: 'Spatial Index Latency Benchmark',
					type: 'metric',
					confidence: 'verified_production',
					summary:
						'Penerapan indeks spatial GiST pada tabel poligon kabupaten menurunkan latensi query geocoding hingga 82%.',
					metricValue: '< 38ms',
					metricLabel: 'Average Response Time (150,000 polygon vertices)'
				},
				{
					id: 'art-sipedo-sql-query',
					title: 'Optimized Spatial Envelope Query',
					type: 'code',
					confidence: 'verified_production',
					language: 'sql',
					summary: 'Query pemotongan poligon wilayah berdasarkan viewport batas aktif.',
					contentSnippet: `SELECT 
    id, 
    nama_desa, 
    ST_AsGeoJSON(ST_SimplifyPreserveTopology(geom, 0.0005)) AS geojson
FROM master_wilayah_purwakarta
WHERE geom && ST_MakeEnvelope($1, $2, $3, $4, 4326)
  AND ST_Intersects(geom, ST_MakeEnvelope($1, $2, $3, $4, 4326));`
				}
			]
		}
	]
};

export const WMS_PROJECT_MANIFEST: AtlasProject = {
	id: 'proj-enterprise-wms',
	slug: 'enterprise-wms',
	title: 'Realtime WMS & Production Tracking Core',
	tagLine: 'High-Throughput Inventory Ledger & Multi-Tenant Assembly Pipeline Engine',
	domain: 'erp',
	clientOrOrg: 'Industrial Manufacturing Partner',
	year: 2024,
	location: {
		id: 'anchor-wms-hub',
		label: 'Logistics Corridor',
		point: { x: 720, y: 360 },
		territoryId: 'erp'
	},
	stack: ['Node.js', 'TypeScript', 'Redis', 'PostgreSQL', 'WebSocket', 'Docker', 'TailwindCSS'],
	evidence: [
		{
			id: 'ev-wms-state-machine',
			projectId: 'proj-enterprise-wms',
			title: 'Deterministic Stock Reconciliation Engine',
			domain: 'erp',
			artifacts: [
				{
					id: 'art-wms-throughput',
					title: 'Transaction Throughput Metric',
					type: 'metric',
					confidence: 'verified_production',
					summary:
						'Pemisahan state machine inventory menggunakan Redis lock mencegah race-condition saat pick-and-pack bersamaan.',
					metricValue: '4,500 req/sec',
					metricLabel: 'Peak Barcode Scanning Throughput with Zero Drift'
				},
				{
					id: 'art-wms-redis-lock',
					title: 'Atomic Inventory Decrement',
					type: 'code',
					confidence: 'verified_production',
					language: 'typescript',
					summary:
						'Atomic lua script pada Redis cluster untuk menjamin konsistensi stok pergudangan.',
					contentSnippet: `const deductStockScript = \`
  local current = redis.call('GET', KEYS[1])
  if current and tonumber(current) >= tonumber(ARGV[1]) then
    return redis.call('DECRBY', KEYS[1], ARGV[1])
  else
    return -1
  end
\`;`
				}
			]
		}
	]
};

export const VISION_AI_MANIFEST: AtlasProject = {
	id: 'proj-vision-qa-ai',
	slug: 'vision-qa-ai',
	title: 'Computer Vision Defect Inspection AI',
	tagLine: 'Realtime Manufacturing Quality Inspection Pipeline on Edge Devices',
	domain: 'ai',
	clientOrOrg: 'Smart Factory Automation',
	year: 2025,
	location: {
		id: 'anchor-ai-mesh',
		label: 'Automated Vision Hub',
		point: { x: 280, y: 680 },
		territoryId: 'ai'
	},
	stack: ['Python', 'PyTorch', 'OpenCV', 'FastAPI', 'WebRTC', 'SvelteKit', 'TensorRT'],
	evidence: [
		{
			id: 'ev-vision-precision',
			projectId: 'proj-vision-qa-ai',
			title: 'Edge Inference Defect Classification',
			domain: 'ai',
			artifacts: [
				{
					id: 'art-vision-metric',
					title: 'Defect Detection Accuracy',
					type: 'metric',
					confidence: 'verified_production',
					summary:
						'Model kuantisasi TensorRT mendeteksi goresan dan anomali kemasan dengan latensi di bawah 18ms.',
					metricValue: '99.4%',
					metricLabel: 'Verified Precision at 60 FPS Camera Feed'
				}
			]
		}
	]
};

export const ATLAS_PROJECTS: readonly AtlasProject[] = [
	SIPEDO_PROJECT_MANIFEST,
	WMS_PROJECT_MANIFEST,
	VISION_AI_MANIFEST
];
