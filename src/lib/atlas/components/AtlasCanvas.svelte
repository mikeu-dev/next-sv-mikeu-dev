<script lang="ts">
	import { atlasStore } from '../core/AtlasState.svelte';
	import type { AtlasEngine } from '../core/AtlasEngine';
	import type { TerritoryDomain } from '../core/types';
	import { PURWAKARTA_MAP_DATA, type DistrictFeature } from '../data/mapData';
	import '../styles/atlas.css';

	interface Props {
		engine: AtlasEngine;
	}

	let { engine }: Props = $props();

	let hoveredDistrict = $state<DistrictFeature | null>(null);

	function handleEvidenceClick(evidenceId?: string) {
		if (evidenceId) {
			engine.inspectNodeEvidence(evidenceId);
		}
	}

	function handleDomainProjectClick(domain: TerritoryDomain) {
		engine.inspectProjectByDomain(domain);
	}
</script>

<div class="atlas-canvas-container relative h-full w-full overflow-hidden bg-[#0a0d12]">
	<!-- Cartographic Topographic ViewBox (1000x1000) -->
	<svg
		viewBox="0 0 1000 1000"
		preserveAspectRatio="xMidYMid slice"
		class="pointer-events-auto h-full w-full select-none"
	>
		<defs>
			<!-- Cartographic Micro-Dot Grid Pattern -->
			<pattern id="atlas-dot-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
				<circle cx="20" cy="20" r="1.2" fill="rgba(148, 163, 184, 0.12)" />
			</pattern>

			<!-- Topographic Contour Isoline Pattern -->
			<pattern id="atlas-isoline-pattern" width="160" height="160" patternUnits="userSpaceOnUse">
				<circle
					cx="80"
					cy="80"
					r="70"
					fill="none"
					stroke="rgba(16, 185, 129, 0.05)"
					stroke-width="0.5"
				/>
				<circle
					cx="80"
					cy="80"
					r="45"
					fill="none"
					stroke="rgba(14, 165, 233, 0.04)"
					stroke-width="0.5"
				/>
				<circle
					cx="80"
					cy="80"
					r="20"
					fill="none"
					stroke="rgba(139, 92, 246, 0.03)"
					stroke-width="0.5"
				/>
			</pattern>

			<!-- Radial Vignette Shadow -->
			<radialGradient id="atlas-vignette" cx="50%" cy="50%" r="50%">
				<stop offset="0%" stop-color="transparent" />
				<stop offset="65%" stop-color="transparent" />
				<stop offset="100%" stop-color="rgba(10, 13, 18, 0.94)" />
			</radialGradient>

			<!-- Landmass Hypsometric Gradient (Lowland Emerald to Mountain Slate) -->
			<linearGradient id="landmass-hypsometric" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stop-color="#10b981" stop-opacity="0.08" />
				<stop offset="50%" stop-color="#0ea5e9" stop-opacity="0.05" />
				<stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.08" />
			</linearGradient>

			<!-- Waterbody Gradient (Waduk Jatiluhur Deep Cyan) -->
			<linearGradient id="waterbody-grad" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stop-color="#0284c7" stop-opacity="0.35" />
				<stop offset="100%" stop-color="#0369a1" stop-opacity="0.55" />
			</linearGradient>

			<!-- Glow Filters for Cartographic Beacons -->
			<filter id="beacon-glow-emerald" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
				<feMerge>
					<feMergeNode in="blur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>

			<filter id="glow-sky" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
				<feMerge>
					<feMergeNode in="blur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>

		<!-- Base Grid & Topographic Hatching -->
		<rect width="1000" height="1000" fill="url(#atlas-dot-grid-pattern)" />
		<rect width="1000" height="1000" fill="url(#atlas-isoline-pattern)" />

		<!-- Geographic Graticule Coordinate Axes -->
		<line
			x1="500"
			y1="0"
			x2="500"
			y2="1000"
			stroke="rgba(148, 163, 184, 0.08)"
			stroke-width="0.75"
			stroke-dasharray="6 6"
		/>
		<line
			x1="0"
			y1="500"
			x2="1000"
			y2="500"
			stroke="rgba(148, 163, 184, 0.08)"
			stroke-width="0.75"
			stroke-dasharray="6 6"
		/>

		<!-- ========================================================================= -->
		<!-- SPATIAL CAMERA VIEWPORT (GPU TRANSFORMED VIA SVELTE 5 RUNES)             -->
		<!-- ========================================================================= -->
		<g transform={atlasStore.svgMatrixTransform} class="transition-transform duration-75 ease-out">
			<!-- ======================================================================= -->
			<!-- LAYER 1: REAL CARTOGRAPHIC LANDMASS & REGIONAL PERIMETER                -->
			<!-- ======================================================================= -->
			<g class="cartographic-landmass-group">
				<!-- Outer County Administrative Perimeter -->
				<path
					d={PURWAKARTA_MAP_DATA.administrativeBoundary}
					fill="url(#landmass-hypsometric)"
					stroke="#10b981"
					stroke-width="1.5"
					stroke-dasharray="8 4"
					opacity="0.85"
				/>

				<!-- Topographic Elevation Contours (Gunung Parang, Burangrang Ridge) -->
				{#each PURWAKARTA_MAP_DATA.contours as contour (contour.id)}
					<g class="elevation-contour-group">
						<path
							d={contour.path}
							fill="rgba(16, 185, 129, 0.02)"
							stroke="#10b981"
							stroke-width="0.8"
							stroke-dasharray="4 3"
							opacity="0.6"
						/>
						{#if contour.peakName}
							<text
								x={contour.id === 'contour-900m' ? 380 : 660}
								y={contour.id === 'contour-900m' ? 640 : 580}
								fill="#10b981"
								font-family="JetBrains Mono"
								font-size="7"
								font-weight="700"
								letter-spacing="0.05em"
								opacity="0.8"
							>
								▲ {contour.peakName} (+{contour.elevation}M)
							</text>
						{/if}
					</g>
				{/each}

				<!-- Internal District (Kecamatan) Sub-Polygons -->
				{#each PURWAKARTA_MAP_DATA.districts as district (district.id)}
					<g
						class="district-subdivision cursor-pointer transition-all duration-200"
						onmouseenter={() => (hoveredDistrict = district)}
						onmouseleave={() => (hoveredDistrict = null)}
						role="group"
					>
						<path
							d={district.path}
							fill={hoveredDistrict?.id === district.id
								? 'rgba(56, 189, 248, 0.15)'
								: 'rgba(15, 23, 42, 0.4)'}
							stroke={hoveredDistrict?.id === district.id ? '#38bdf8' : 'rgba(148, 163, 184, 0.25)'}
							stroke-width={hoveredDistrict?.id === district.id ? '1.5' : '0.75'}
						/>
						<!-- District Center Label -->
						<text
							x={district.center.x}
							y={district.center.y}
							fill={hoveredDistrict?.id === district.id ? '#38bdf8' : '#64748b'}
							font-family="JetBrains Mono"
							font-size="7"
							font-weight="700"
							text-anchor="middle"
							letter-spacing="0.04em"
							opacity="0.9"
						>
							{district.name}
						</text>
					</g>
				{/each}
			</g>

			<!-- ======================================================================= -->
			<!-- LAYER 2: HYDROLOGY & WATERBODIES (WADUK JATILUHUR RESERVOIR)            -->
			<!-- ======================================================================= -->
			<g class="cartographic-hydrology-group">
				{#each PURWAKARTA_MAP_DATA.waterbodies as water (water.id)}
					<g class="waterbody-element">
						<path
							d={water.path}
							fill={water.type === 'reservoir' || water.type === 'lake'
								? 'url(#waterbody-grad)'
								: 'none'}
							stroke="#0ea5e9"
							stroke-width={water.type === 'river' ? '1.5' : '1.2'}
							opacity="0.9"
						/>
						{#if water.type === 'reservoir'}
							<text
								x="340"
								y="460"
								fill="#38bdf8"
								font-family="JetBrains Mono"
								font-size="8"
								font-weight="700"
								letter-spacing="0.06em"
							>
								≈ {water.name}
							</text>
							<text
								x="340"
								y="472"
								fill="#0284c7"
								font-family="JetBrains Mono"
								font-size="6.5"
								letter-spacing="0.04em"
							>
								VOL: {water.waterVolumeM3} • CADASTRAL HYDRO
							</text>
						{/if}
					</g>
				{/each}
			</g>

			<!-- ======================================================================= -->
			<!-- LAYER 3: TRANSPORT & SPATIAL CORRIDORS (TOL CIPULARANG / ARTERI)        -->
			<!-- ======================================================================= -->
			<g class="cartographic-transport-group">
				{#each PURWAKARTA_MAP_DATA.transport as route (route.id)}
					<path
						d={route.path}
						fill="none"
						stroke={route.type === 'highway'
							? '#f59e0b'
							: route.type === 'railway'
								? '#a855f7'
								: '#94a3b8'}
						stroke-width={route.type === 'highway' ? '2' : '1'}
						stroke-dasharray={route.type === 'highway'
							? '6 3'
							: route.type === 'railway'
								? '4 4'
								: 'none'}
						opacity="0.75"
					/>
				{/each}
			</g>

			<!-- ======================================================================= -->
			<!-- LAYER 4: 4 DOMAIN TERRITORY QUADRANT CLUSTERS (SCENE 03: TERRITORIES)   -->
			<!-- ======================================================================= -->
			<g class="territories-overlay-quadrants">
				<!-- Territory 01: Geospatial & Environmental GIS (Top-Left, Emerald) -->
				<rect
					x="60"
					y="60"
					width="380"
					height="340"
					rx="6"
					fill="rgba(16, 185, 129, 0.03)"
					stroke="#10b981"
					stroke-width="1"
					stroke-dasharray="6 4"
					opacity={atlasStore.activeSceneIndex === 2 ? 0.95 : 0.3}
				/>
				<g transform="translate(80, 85)">
					<rect
						x="0"
						y="0"
						width="220"
						height="22"
						rx="2"
						fill="#111620"
						stroke="#10b981"
						stroke-width="1"
					/>
					<text
						x="8"
						y="15"
						fill="#10b981"
						font-family="JetBrains Mono"
						font-size="8.5"
						font-weight="700"
						letter-spacing="0.08em"
					>
						[TERRITORY 01: GEOSPATIAL GIS]
					</text>
				</g>

				<!-- Territory 02: Enterprise Core & Distributed WMS (Top-Right, Sky Blue) -->
				<rect
					x="560"
					y="60"
					width="380"
					height="340"
					rx="6"
					fill="rgba(14, 165, 233, 0.03)"
					stroke="#0ea5e9"
					stroke-width="1"
					stroke-dasharray="6 4"
					opacity={atlasStore.activeSceneIndex === 2 ? 0.95 : 0.3}
				/>
				<g transform="translate(580, 85)">
					<rect
						x="0"
						y="0"
						width="220"
						height="22"
						rx="2"
						fill="#111620"
						stroke="#0ea5e9"
						stroke-width="1"
					/>
					<text
						x="8"
						y="15"
						fill="#0ea5e9"
						font-family="JetBrains Mono"
						font-size="8.5"
						font-weight="700"
						letter-spacing="0.08em"
					>
						[TERRITORY 02: ENTERPRISE WMS]
					</text>
				</g>

				<!-- Territory 03: Machine Intelligence & Vision AI (Bottom-Left, Violet) -->
				<rect
					x="60"
					y="560"
					width="380"
					height="340"
					rx="6"
					fill="rgba(139, 92, 246, 0.03)"
					stroke="#8b5cf6"
					stroke-width="1"
					stroke-dasharray="6 4"
					opacity={atlasStore.activeSceneIndex === 2 ? 0.95 : 0.3}
				/>
				<g transform="translate(80, 585)">
					<rect
						x="0"
						y="0"
						width="220"
						height="22"
						rx="2"
						fill="#111620"
						stroke="#8b5cf6"
						stroke-width="1"
					/>
					<text
						x="8"
						y="15"
						fill="#8b5cf6"
						font-family="JetBrains Mono"
						font-size="8.5"
						font-weight="700"
						letter-spacing="0.08em"
					>
						[TERRITORY 03: VISION AI MESH]
					</text>
				</g>

				<!-- Territory 04: High-Throughput Pipelines & Infra (Bottom-Right, Amber) -->
				<rect
					x="560"
					y="560"
					width="380"
					height="340"
					rx="6"
					fill="rgba(245, 158, 11, 0.03)"
					stroke="#f59e0b"
					stroke-width="1"
					stroke-dasharray="6 4"
					opacity={atlasStore.activeSceneIndex === 2 ? 0.95 : 0.3}
				/>
				<g transform="translate(580, 585)">
					<rect
						x="0"
						y="0"
						width="220"
						height="22"
						rx="2"
						fill="#111620"
						stroke="#f59e0b"
						stroke-width="1"
					/>
					<text
						x="8"
						y="15"
						fill="#f59e0b"
						font-family="JetBrains Mono"
						font-size="8.5"
						font-weight="700"
						letter-spacing="0.08em"
					>
						[TERRITORY 04: HIGH-SCALE INFRA]
					</text>
				</g>
			</g>

			<!-- ======================================================================= -->
			<!-- LAYER 5: MORPHING TOPOLOGY & SYSTEM ARCHITECTURE PATHS                  -->
			<!-- ======================================================================= -->
			{#each atlasStore.activePaths as path (path.id)}
				<path
					d={path.d}
					stroke={path.strokeColor}
					stroke-width={path.strokeWidth}
					fill="none"
					stroke-dasharray={path.dashArray}
					opacity={path.opacity ?? 1}
					class="transition-all duration-300"
				/>
			{/each}

			<!-- System Network Edges & Live Data Flow Pulses -->
			{#each atlasStore.activeEdges as edge (edge.id)}
				{@const sourceNode = atlasStore.activeNodes.find((n) => n.id === edge.sourceNodeId)}
				{@const targetNode = atlasStore.activeNodes.find((n) => n.id === edge.targetNodeId)}
				{#if sourceNode && targetNode}
					<g class="network-edge-group">
						<line
							x1={sourceNode.position.x}
							y1={sourceNode.position.y}
							x2={targetNode.position.x}
							y2={targetNode.position.y}
							stroke={edge.strokeColor ?? '#38bdf8'}
							stroke-width="1.5"
							stroke-dasharray="6 4"
							opacity="0.65"
						/>
						<!-- Midpoint data stream pulse -->
						<circle
							cx={(sourceNode.position.x + targetNode.position.x) / 2}
							cy={(sourceNode.position.y + targetNode.position.y) / 2}
							r="3"
							fill={edge.strokeColor ?? '#38bdf8'}
							class="animate-pulse"
						/>
					</g>
				{/if}
			{/each}

			<!-- ======================================================================= -->
			<!-- LAYER 6: CENTER ORIGIN BEACON & HERO AWAKENING (500, 390)               -->
			<!-- ======================================================================= -->
			<g transform="translate(500, 390)" class="origin-beacon-center">
				<!-- Concentric Radar Pulsing Rings -->
				<circle
					r="46"
					fill="none"
					stroke="#10b981"
					stroke-width="0.5"
					opacity="0.25"
					class="origin-center animate-ping"
				/>
				<circle r="26" fill="none" stroke="#10b981" stroke-width="0.75" opacity="0.45" />
				<circle r="12" fill="none" stroke="#10b981" stroke-width="1.5" opacity="0.85" />
				<circle r="4.5" fill="#10b981" filter="url(#beacon-glow-emerald)" />

				<!-- Reticle Crosshair Axis Lines -->
				<line x1="-36" y1="0" x2="-10" y2="0" stroke="#10b981" stroke-width="0.8" />
				<line x1="10" y1="0" x2="36" y2="0" stroke="#10b981" stroke-width="0.8" />
				<line x1="0" y1="-36" x2="0" y2="-10" stroke="#10b981" stroke-width="0.8" />
				<line x1="0" y1="10" x2="0" y2="36" stroke="#10b981" stroke-width="0.8" />

				<!-- Origin Coordinates & Anchor Metadata -->
				<text
					x="0"
					y="-42"
					fill="#10b981"
					font-family="JetBrains Mono"
					font-size="9.5"
					font-weight="700"
					text-anchor="middle"
					letter-spacing="0.08em"
				>
					00° 31' 12.4"S 107° 26' 32.1"E
				</text>
				<text
					x="0"
					y="52"
					fill="#94a3b8"
					font-family="JetBrains Mono"
					font-size="8"
					font-weight="600"
					text-anchor="middle"
					letter-spacing="0.06em"
				>
					BASE SPATIAL ANCHOR // KAB. PURWAKARTA
				</text>

				<!-- Hero Name Plate (Materializes during macro zoom 4.5x -> 2.8x) -->
				{#if atlasStore.camera.zoom > 1.8}
					<g transform="translate(0, 84)">
						<text
							x="0"
							y="0"
							fill="#f8fafc"
							font-family="Outfit"
							font-size="24"
							font-weight="800"
							text-anchor="middle"
							letter-spacing="0.1em"
						>
							RIKI RUSWANDI
						</text>
						<text
							x="0"
							y="18"
							fill="#38bdf8"
							font-family="JetBrains Mono"
							font-size="9"
							font-weight="600"
							text-anchor="middle"
							letter-spacing="0.12em"
						>
							FULLSTACK & SYSTEMS ENGINEER
						</text>
					</g>
				{/if}
			</g>

			<!-- ======================================================================= -->
			<!-- LAYER 7: CAREER TIMELINE WAYPOINT NODES (2022 - 2026)                   -->
			<!-- ======================================================================= -->
			<g transform="translate(420, 320)" class="timeline-waypoint">
				<circle r="4" fill="#10b981" />
				<text
					x="-10"
					y="-12"
					fill="#10b981"
					font-family="JetBrains Mono"
					font-size="8"
					font-weight="700">2022: GIS FOUNDATION</text
				>
			</g>

			<g transform="translate(590, 320)" class="timeline-waypoint">
				<circle r="4" fill="#10b981" />
				<text
					x="12"
					y="-10"
					fill="#10b981"
					font-family="JetBrains Mono"
					font-size="8"
					font-weight="700">2023: SIPEDO WEBMAP</text
				>
			</g>

			<g transform="translate(740, 340)" class="timeline-waypoint">
				<circle r="4" fill="#0ea5e9" />
				<text
					x="12"
					y="-10"
					fill="#0ea5e9"
					font-family="JetBrains Mono"
					font-size="8"
					font-weight="700">2024-2025: WMS ENTERPRISE</text
				>
			</g>

			<g transform="translate(280, 680)" class="timeline-waypoint">
				<circle r="4" fill="#8b5cf6" />
				<text
					x="-12"
					y="20"
					fill="#8b5cf6"
					font-family="JetBrains Mono"
					font-size="8"
					font-weight="700"
					text-anchor="end">2026: AI VISION AUTOMATION</text
				>
			</g>

			<!-- ======================================================================= -->
			<!-- LAYER 8: INTERACTIVE PRODUCTION NODES (SIPEDO, WMS, VISION QA)          -->
			<!-- ======================================================================= -->
			{#each atlasStore.activeNodes as node (node.id)}
				<g
					transform={`translate(${node.position.x}, ${node.position.y})`}
					class="cursor-pointer transition-transform duration-200 hover:scale-110"
				>
					<!-- Evidence Anchor Box Trigger -->
					<g
						role="button"
						tabindex="0"
						onclick={() => handleEvidenceClick(node.evidenceId)}
						onkeydown={(e) => e.key === 'Enter' && handleEvidenceClick(node.evidenceId)}
					>
						<rect
							x="-12"
							y="-12"
							width="24"
							height="24"
							fill={node.domain === 'gis'
								? 'rgba(16, 185, 129, 0.25)'
								: node.domain === 'erp'
									? 'rgba(14, 165, 233, 0.25)'
									: 'rgba(139, 92, 246, 0.25)'}
							stroke={node.domain === 'gis'
								? '#10b981'
								: node.domain === 'erp'
									? '#0ea5e9'
									: '#8b5cf6'}
							stroke-width="1.2"
							stroke-dasharray="3 3"
							rx="2"
						/>
						<circle
							r="4.5"
							fill={node.domain === 'gis'
								? '#10b981'
								: node.domain === 'erp'
									? '#0ea5e9'
									: '#8b5cf6'}
							filter={node.domain === 'gis' ? 'url(#beacon-glow-emerald)' : 'url(#glow-sky)'}
						/>
					</g>

					<!-- Tactical Project Card Trigger Plate -->
					<g
						transform="translate(20, -12)"
						role="button"
						tabindex="0"
						onclick={() => handleDomainProjectClick(node.domain)}
						onkeydown={(e) => e.key === 'Enter' && handleDomainProjectClick(node.domain)}
						class="cursor-pointer hover:opacity-90"
					>
						<rect
							x="-6"
							y="-6"
							width="180"
							height="34"
							fill="#111620"
							stroke={node.domain === 'gis'
								? '#10b981'
								: node.domain === 'erp'
									? '#0ea5e9'
									: '#8b5cf6'}
							stroke-width="1"
							rx="3"
							opacity="0.96"
						/>
						<text
							x="4"
							y="8"
							fill="#f8fafc"
							font-family="JetBrains Mono"
							font-size="9"
							font-weight="700"
							letter-spacing="0.05em"
						>
							{node.label}
						</text>
						<text
							x="4"
							y="20"
							fill="#94a3b8"
							font-family="JetBrains Mono"
							font-size="7.5"
							letter-spacing="0.02em"
						>
							{node.subtitle ?? 'CLICK FOR OVERVIEW'}
						</text>
					</g>
				</g>
			{/each}
		</g>

		<!-- ========================================================================= -->
		<!-- CARTOGRAPHIC MARGIN BORDER FRAME & RETICLES                               -->
		<!-- ========================================================================= -->
		<rect
			x="1"
			y="1"
			width="998"
			height="998"
			fill="none"
			stroke="rgba(148, 163, 184, 0.2)"
			stroke-width="1"
		/>

		<!-- Corner Crosshair Reticles -->
		<path d="M 1 20 L 1 1 L 20 1" fill="none" stroke="#38bdf8" stroke-width="2" />
		<path d="M 980 1 L 999 1 L 999 20" fill="none" stroke="#38bdf8" stroke-width="2" />
		<path d="M 1 980 L 1 999 L 20 999" fill="none" stroke="#38bdf8" stroke-width="2" />
		<path d="M 980 999 L 999 999 L 999 980" fill="none" stroke="#38bdf8" stroke-width="2" />

		<!-- Vignette Shadow Frame Overlay -->
		<rect width="1000" height="1000" fill="url(#atlas-vignette)" pointer-events="none" />
	</svg>
</div>

<style>
	.atlas-canvas-container {
		perspective: 1000px;
	}
</style>
