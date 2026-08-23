<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { atlasStore } from '../core/AtlasState.svelte';
	import type { AtlasEngine } from '../core/AtlasEngine';
	import type { TerritoryDomain } from '../core/types';
	import { PURWAKARTA_GEOJSON } from '../data/purwakarta.geojson';

	// OpenLayers Core Modules
	import Map from 'ol/Map';
	import View from 'ol/View';
	import TileLayer from 'ol/layer/Tile';
	import VectorLayer from 'ol/layer/Vector';
	import XYZ from 'ol/source/XYZ';
	import VectorSource from 'ol/source/Vector';
	import GeoJSON from 'ol/format/GeoJSON';
	import { fromLonLat } from 'ol/proj';
	import { Style, Stroke, Fill, Circle as CircleStyle, Text as TextStyle } from 'ol/style';
	import type { FeatureLike } from 'ol/Feature';
	import 'ol/ol.css';
	import '../styles/atlas.css';

	interface Props {
		engine: AtlasEngine;
	}

	let { engine }: Props = $props();

	let mapContainer: HTMLDivElement;
	let olMap: Map | null = null;
	let vectorSource: VectorSource;

	// Center anchor: Purwakarta Regency (107.4433° E, -6.5569° S)
	const PURWAKARTA_CENTER = fromLonLat([107.4433, -6.5569]);

	function createGeoJsonStyle(feature: FeatureLike): Style {
		const props = feature.getProperties();
		const featureType = props.type;
		const domain = props.domain as TerritoryDomain | undefined;

		// 1. County Administrative Perimeter
		if (featureType === 'administrative_boundary') {
			return new Style({
				stroke: new Stroke({
					color: '#10b981',
					width: 2.5,
					lineDash: [8, 6]
				}),
				fill: new Fill({
					color: 'rgba(16, 185, 129, 0.06)'
				})
			});
		}

		// 2. Hydrology: Waduk Jatiluhur
		if (featureType === 'waterbody') {
			return new Style({
				stroke: new Stroke({
					color: '#0ea5e9',
					width: 2
				}),
				fill: new Fill({
					color: 'rgba(14, 165, 233, 0.35)'
				}),
				text: new TextStyle({
					text: '≈ WADUK JATILUHUR',
					font: 'bold 11px "JetBrains Mono", monospace',
					fill: new Fill({ color: '#38bdf8' }),
					stroke: new Stroke({ color: '#0a0d12', width: 3 }),
					offsetY: -10
				})
			});
		}

		// 3. District Subdivisions
		if (featureType === 'district') {
			return new Style({
				stroke: new Stroke({
					color: 'rgba(148, 163, 184, 0.35)',
					width: 1,
					lineDash: [4, 4]
				}),
				fill: new Fill({
					color: 'rgba(15, 23, 42, 0.25)'
				}),
				text: new TextStyle({
					text: props.name ?? '',
					font: '600 9px "JetBrains Mono", monospace',
					fill: new Fill({ color: '#94a3b8' }),
					stroke: new Stroke({ color: '#0a0d12', width: 2 })
				})
			});
		}

		// 4. Engineering Project Nodes (SIPEDO, WMS, Vision AI)
		if (domain) {
			const accentColor = domain === 'gis' ? '#10b981' : domain === 'erp' ? '#0ea5e9' : '#8b5cf6';

			return new Style({
				image: new CircleStyle({
					radius: 9,
					fill: new Fill({ color: accentColor }),
					stroke: new Stroke({ color: '#f8fafc', width: 2 })
				}),
				text: new TextStyle({
					text: `[${props.name}]`,
					font: 'bold 11px "JetBrains Mono", monospace',
					fill: new Fill({ color: '#f8fafc' }),
					stroke: new Stroke({ color: '#0a0d12', width: 3 }),
					offsetY: 18
				})
			});
		}

		return new Style({});
	}

	onMount(() => {
		if (!mapContainer) return;

		// Load Real GeoJSON Features into Vector Source
		vectorSource = new VectorSource({
			features: new GeoJSON().readFeatures(PURWAKARTA_GEOJSON, {
				featureProjection: 'EPSG:3857'
			})
		});

		// Base Tile Layer: CartoDB Dark Matter / High-Contrast OpenStreetMap Cartography
		const baseTileLayer = new TileLayer({
			source: new XYZ({
				url: 'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
				attributions: '© OpenStreetMap contributors, © CARTO',
				maxZoom: 19
			})
		});

		// Real Vector Overlay Layer
		const vectorLayer = new VectorLayer({
			source: vectorSource,
			style: createGeoJsonStyle
		});

		// Initialize OpenLayers Map
		olMap = new Map({
			target: mapContainer,
			layers: [baseTileLayer, vectorLayer],
			view: new View({
				center: PURWAKARTA_CENTER,
				zoom: 11.5,
				minZoom: 6,
				maxZoom: 18,
				rotation: 0
			}),
			controls: []
		});

		// Click interaction on Map Features
		olMap.on('click', (evt) => {
			const feature = olMap?.forEachFeatureAtPixel(evt.pixel, (f) => f);
			if (feature) {
				const domain = feature.get('domain') as TerritoryDomain | undefined;
				const evidenceId = feature.get('evidenceId') as string | undefined;

				if (domain) {
					engine.inspectProjectByDomain(domain);
				} else if (evidenceId) {
					engine.inspectNodeEvidence(evidenceId);
				}
			}
		});

		// Pointer cursor when hovering over features
		olMap.on('pointermove', (evt) => {
			if (!olMap) return;
			const hit = olMap.hasFeatureAtPixel(evt.pixel);
			mapContainer.style.cursor = hit ? 'pointer' : 'default';
		});
	});

	// Reactive View Updates driven by Svelte 5 Rune (atlasStore.globalProgress)
	$effect(() => {
		if (!olMap) return;
		const view = olMap.getView();
		const progress = atlasStore.globalProgress;

		// Scene 01: Arrival (Macro to Regional)
		if (progress < 0.15) {
			const localP = progress / 0.15;
			const zoom = 14.5 - localP * 2.5; // Zoom from 14.5 down to 12.0
			view.setCenter(PURWAKARTA_CENTER);
			view.setZoom(zoom);
		}
		// Scene 02: Journey (Tracking along route)
		else if (progress < 0.32) {
			const localP = (progress - 0.15) / 0.17;
			const targetLon = 107.4433 + localP * 0.04;
			const targetLat = -6.5569 + localP * 0.05;
			view.setCenter(fromLonLat([targetLon, targetLat]));
			view.setZoom(11.8);
		}
		// Scene 03: 4 Territories Cluster (Panorama Overview)
		else if (progress < 0.52) {
			view.setCenter(PURWAKARTA_CENTER);
			view.setZoom(10.8);
		}
		// Scene 04: Systems Morphing
		else if (progress < 0.72) {
			view.setCenter(fromLonLat([107.4433, -6.5569]));
			view.setZoom(12.5);
		}
		// Scene 05: Evidence Inspection
		else if (progress < 0.88) {
			view.setCenter(fromLonLat([107.4433, -6.5569]));
			view.setZoom(13.2);
		}
		// Scene 06: Horizon Terminal
		else {
			view.setCenter(PURWAKARTA_CENTER);
			view.setZoom(11.0);
		}
	});

	onDestroy(() => {
		if (olMap) {
			olMap.setTarget(undefined);
			olMap = null;
		}
	});
</script>

<div class="atlas-ol-map-wrapper relative h-full w-full overflow-hidden bg-[#0a0d12]">
	<!-- 1. Real OpenLayers Interactive Map Container -->
	<div bind:this={mapContainer} class="ol-map-element absolute inset-0 h-full w-full"></div>

	<!-- 2. Cartographic Topographic HUD Overlay Grid -->
	<div class="pointer-events-none absolute inset-0 z-10">
		<!-- Precision Coordinate Crosshairs -->
		<div
			class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(10,13,18,0.85)_100%)]"
		></div>

		<!-- Map Margin Rulers & Reticles -->
		<div
			class="absolute top-4 left-4 font-mono text-[9px] tracking-widest text-[#38bdf8] uppercase"
		>
			[SRS: EPSG:3857 / WGS84 • LIVE OPENSTREETMAP TILE MESH]
		</div>
		<div
			class="absolute top-4 right-4 font-mono text-[9px] tracking-widest text-[#10b981] uppercase"
		>
			[STATUS: VECTOR GEODATA ACTIVE]
		</div>

		<!-- Corner Reticles -->
		<div class="absolute top-2 left-2 size-4 border-t-2 border-l-2 border-[#38bdf8]"></div>
		<div class="absolute top-2 right-2 size-4 border-t-2 border-r-2 border-[#38bdf8]"></div>
		<div class="absolute bottom-2 left-2 size-4 border-b-2 border-l-2 border-[#38bdf8]"></div>
		<div class="absolute right-2 bottom-2 size-4 border-r-2 border-b-2 border-[#38bdf8]"></div>
	</div>
</div>

<style>
	:global(.ol-map-element .ol-viewport) {
		background-color: #0a0d12 !important;
	}
	:global(.ol-map-element canvas) {
		filter: brightness(0.85) contrast(1.15) saturate(0.9);
	}
</style>
