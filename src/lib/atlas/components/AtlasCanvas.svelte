<script lang="ts">
	import { atlasStore } from '../core/AtlasState.svelte';
	import type { AtlasEngine } from '../core/AtlasEngine';
	import type { TerritoryDomain } from '../core/types';
	import '../styles/atlas.css';

	interface Props {
		engine: AtlasEngine;
	}

	let { engine }: Props = $props();

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
	<!-- Topographic SVG ViewBox (1000x1000) -->
	<svg
		viewBox="0 0 1000 1000"
		preserveAspectRatio="xMidYMid slice"
		class="pointer-events-auto h-full w-full select-none"
	>
		<defs>
			<!-- Cartographic Dot Grid -->
			<pattern id="atlas-dot-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
				<circle cx="20" cy="20" r="1.2" fill="rgba(148, 163, 184, 0.12)" />
			</pattern>

			<!-- Cartographic Contour Isolines -->
			<pattern id="atlas-isoline-pattern" width="200" height="200" patternUnits="userSpaceOnUse">
				<circle
					cx="100"
					cy="100"
					r="90"
					fill="none"
					stroke="rgba(16, 185, 129, 0.05)"
					stroke-width="0.75"
				/>
				<circle
					cx="100"
					cy="100"
					r="60"
					fill="none"
					stroke="rgba(14, 165, 233, 0.04)"
					stroke-width="0.5"
				/>
				<circle
					cx="100"
					cy="100"
					r="30"
					fill="none"
					stroke="rgba(139, 92, 246, 0.03)"
					stroke-width="0.5"
				/>
			</pattern>

			<!-- Radial Vignette Shadow -->
			<radialGradient id="atlas-vignette" cx="50%" cy="50%" r="50%">
				<stop offset="0%" stop-color="transparent" />
				<stop offset="65%" stop-color="transparent" />
				<stop offset="100%" stop-color="rgba(10, 13, 18, 0.92)" />
			</radialGradient>

			<!-- Glow Filters -->
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

			<filter id="glow-violet" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
				<feMerge>
					<feMergeNode in="blur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>

		<!-- Base Grid Layer with Isolines -->
		<rect width="1000" height="1000" fill="url(#atlas-dot-grid-pattern)" />
		<rect width="1000" height="1000" fill="url(#atlas-isoline-pattern)" />

		<!-- Cartesian Viewport Coordinate Axes Hairlines -->
		<line
			x1="500"
			y1="0"
			x2="500"
			y2="1000"
			stroke="rgba(148, 163, 184, 0.08)"
			stroke-width="0.75"
			stroke-dasharray="8 6"
		/>
		<line
			x1="0"
			y1="500"
			x2="1000"
			y2="500"
			stroke="rgba(148, 163, 184, 0.08)"
			stroke-width="0.75"
			stroke-dasharray="8 6"
		/>

		<!-- Spatial Camera Viewport Layer (GPU Matrix Transformed) -->
		<g transform={atlasStore.svgMatrixTransform} class="transition-transform duration-75 ease-out">
			<!-- ========================================================================= -->
			<!-- 4 TERRITORY QUADRANT BOUNDARIES (TERRITORIES CLUSTER 0.32 - 0.52)         -->
			<!-- ========================================================================= -->

			<!-- Territory 01: Geospatial & Environmental GIS (Top-Left, Emerald) -->
			<g class="territory-cluster-gis transition-opacity duration-300">
				<!-- Territory Area Wash -->
				<rect
					x="80"
					y="80"
					width="380"
					height="360"
					rx="6"
					fill="rgba(16, 185, 129, 0.03)"
					stroke="#10b981"
					stroke-width="1"
					stroke-dasharray="6 4"
					opacity={atlasStore.activeSceneIndex === 2 ? 0.9 : 0.4}
				/>
				<!-- Territory Header Plate -->
				<g transform="translate(100, 110)">
					<rect
						x="0"
						y="0"
						width="220"
						height="24"
						rx="2"
						fill="#111620"
						stroke="#10b981"
						stroke-width="1"
					/>
					<text
						x="8"
						y="16"
						fill="#10b981"
						font-family="JetBrains Mono"
						font-size="9"
						font-weight="700"
						letter-spacing="0.08em"
					>
						[TERRITORY 01: GEOSPATIAL GIS]
					</text>
				</g>
			</g>

			<!-- Territory 02: Enterprise Core & Distributed WMS (Top-Right, Sky Blue) -->
			<g class="territory-cluster-erp transition-opacity duration-300">
				<rect
					x="540"
					y="80"
					width="380"
					height="360"
					rx="6"
					fill="rgba(14, 165, 233, 0.03)"
					stroke="#0ea5e9"
					stroke-width="1"
					stroke-dasharray="6 4"
					opacity={atlasStore.activeSceneIndex === 2 ? 0.9 : 0.4}
				/>
				<g transform="translate(560, 110)">
					<rect
						x="0"
						y="0"
						width="220"
						height="24"
						rx="2"
						fill="#111620"
						stroke="#0ea5e9"
						stroke-width="1"
					/>
					<text
						x="8"
						y="16"
						fill="#0ea5e9"
						font-family="JetBrains Mono"
						font-size="9"
						font-weight="700"
						letter-spacing="0.08em"
					>
						[TERRITORY 02: ENTERPRISE WMS]
					</text>
				</g>
			</g>

			<!-- Territory 03: Machine Intelligence & Vision AI (Bottom-Left, Violet) -->
			<g class="territory-cluster-ai transition-opacity duration-300">
				<rect
					x="80"
					y="540"
					width="380"
					height="360"
					rx="6"
					fill="rgba(139, 92, 246, 0.03)"
					stroke="#8b5cf6"
					stroke-width="1"
					stroke-dasharray="6 4"
					opacity={atlasStore.activeSceneIndex === 2 ? 0.9 : 0.4}
				/>
				<g transform="translate(100, 570)">
					<rect
						x="0"
						y="0"
						width="220"
						height="24"
						rx="2"
						fill="#111620"
						stroke="#8b5cf6"
						stroke-width="1"
					/>
					<text
						x="8"
						y="16"
						fill="#8b5cf6"
						font-family="JetBrains Mono"
						font-size="9"
						font-weight="700"
						letter-spacing="0.08em"
					>
						[TERRITORY 03: VISION AI MESH]
					</text>
				</g>
			</g>

			<!-- Territory 04: High-Throughput Pipelines & Infra (Bottom-Right, Amber) -->
			<g class="territory-cluster-infra transition-opacity duration-300">
				<rect
					x="540"
					y="540"
					width="380"
					height="360"
					rx="6"
					fill="rgba(245, 158, 11, 0.03)"
					stroke="#f59e0b"
					stroke-width="1"
					stroke-dasharray="6 4"
					opacity={atlasStore.activeSceneIndex === 2 ? 0.9 : 0.4}
				/>
				<g transform="translate(560, 570)">
					<rect
						x="0"
						y="0"
						width="220"
						height="24"
						rx="2"
						fill="#111620"
						stroke="#f59e0b"
						stroke-width="1"
					/>
					<text
						x="8"
						y="16"
						fill="#f59e0b"
						font-family="JetBrains Mono"
						font-size="9"
						font-weight="700"
						letter-spacing="0.08em"
					>
						[TERRITORY 04: HIGH-SCALE INFRA]
					</text>
				</g>
			</g>

			<!-- ========================================================================= -->
			<!-- GEOMETRY VECTORS, MORPHING POLYGON & CAREER TRAJECTORY PATHS              -->
			<!-- ========================================================================= -->

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

			<!-- System Network Edges & Data Flow Connections -->
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
						<!-- Midpoint flow direction indicator -->
						<circle
							cx={(sourceNode.position.x + targetNode.position.x) / 2}
							cy={(sourceNode.position.y + targetNode.position.y) / 2}
							r="2.5"
							fill={edge.strokeColor ?? '#38bdf8'}
							class="animate-pulse"
						/>
					</g>
				{/if}
			{/each}

			<!-- ========================================================================= -->
			<!-- FRAME 00 / 01 / 02: ORIGIN BEACON PURWAKARTA (500, 500)                   -->
			<!-- ========================================================================= -->

			<g transform="translate(500, 500)" class="origin-beacon-center">
				<!-- Concentric Radar Rings -->
				<circle
					r="42"
					fill="none"
					stroke="#10b981"
					stroke-width="0.5"
					opacity="0.2"
					class="origin-center animate-ping"
				/>
				<circle r="24" fill="none" stroke="#10b981" stroke-width="0.75" opacity="0.4" />
				<circle r="10" fill="none" stroke="#10b981" stroke-width="1.5" opacity="0.8" />
				<circle r="4" fill="#10b981" filter="url(#beacon-glow-emerald)" />

				<!-- Reticle Axis Crosshair Lines -->
				<line x1="-30" y1="0" x2="-8" y2="0" stroke="#10b981" stroke-width="0.75" />
				<line x1="8" y1="0" x2="30" y2="0" stroke="#10b981" stroke-width="0.75" />
				<line x1="0" y1="-30" x2="0" y2="-8" stroke="#10b981" stroke-width="0.75" />
				<line x1="0" y1="8" x2="0" y2="30" stroke="#10b981" stroke-width="0.75" />

				<!-- Origin Coordinate Labels -->
				<text
					x="0"
					y="-38"
					fill="#10b981"
					font-family="JetBrains Mono"
					font-size="9"
					font-weight="700"
					text-anchor="middle"
					letter-spacing="0.08em"
				>
					00° 31' 12.4"S 107° 26' 32.1"E
				</text>
				<text
					x="0"
					y="48"
					fill="#94a3b8"
					font-family="JetBrains Mono"
					font-size="8"
					font-weight="600"
					text-anchor="middle"
					letter-spacing="0.05em"
				>
					BASE SPATIAL ANCHOR // PURWAKARTA, ID
				</text>

				<!-- Hero Name Display (Awakens during Zoom 4.5x -> 2.8x) -->
				{#if atlasStore.camera.zoom > 2.0}
					<g transform="translate(0, 78)">
						<text
							x="0"
							y="0"
							fill="#f8fafc"
							font-family="Outfit"
							font-size="22"
							font-weight="800"
							text-anchor="middle"
							letter-spacing="0.1em"
						>
							RIKI RUSWANDI
						</text>
						<text
							x="0"
							y="16"
							fill="#38bdf8"
							font-family="JetBrains Mono"
							font-size="8.5"
							font-weight="600"
							text-anchor="middle"
							letter-spacing="0.12em"
						>
							FULLSTACK & SYSTEMS ENGINEER
						</text>
					</g>
				{/if}
			</g>

			<!-- ========================================================================= -->
			<!-- CAREER TIMELINE WAYPOINT NODES (2022 - 2026)                              -->
			<!-- ========================================================================= -->

			<!-- 2022 Milestone Node -->
			<g transform="translate(420, 380)" class="timeline-waypoint">
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

			<!-- 2023 Milestone Node -->
			<g transform="translate(580, 370)" class="timeline-waypoint">
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

			<!-- 2024-2025 Milestone Node -->
			<g transform="translate(720, 360)" class="timeline-waypoint">
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

			<!-- 2026 Milestone Node -->
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

			<!-- ========================================================================= -->
			<!-- INTERACTIVE ARTIFACT ANCHOR NODES (SIPEDO, WMS, VISION QA)                -->
			<!-- ========================================================================= -->

			{#each atlasStore.activeNodes as node (node.id)}
				<g
					transform={`translate(${node.position.x}, ${node.position.y})`}
					class="cursor-pointer transition-transform duration-200 hover:scale-110"
				>
					<!-- Evidence Anchor Box -->
					<g
						role="button"
						tabindex="0"
						onclick={() => handleEvidenceClick(node.evidenceId)}
						onkeydown={(e) => e.key === 'Enter' && handleEvidenceClick(node.evidenceId)}
					>
						<rect
							x="-11"
							y="-11"
							width="22"
							height="22"
							fill={node.domain === 'gis'
								? 'rgba(16, 185, 129, 0.2)'
								: node.domain === 'erp'
									? 'rgba(14, 165, 233, 0.2)'
									: 'rgba(139, 92, 246, 0.2)'}
							stroke={node.domain === 'gis'
								? '#10b981'
								: node.domain === 'erp'
									? '#0ea5e9'
									: '#8b5cf6'}
							stroke-width="1.2"
							stroke-dasharray="3 3"
							rx="2"
						/>

						<!-- Inner Pulsing Core -->
						<circle
							r="4"
							fill={node.domain === 'gis'
								? '#10b981'
								: node.domain === 'erp'
									? '#0ea5e9'
									: '#8b5cf6'}
							filter={node.domain === 'gis' ? 'url(#beacon-glow-emerald)' : 'url(#glow-sky)'}
						/>
					</g>

					<!-- Tactical Node Plate (Click to View Project Overview) -->
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
							height="32"
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
							y="7"
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
							y="19"
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

		<!-- Topographic Margin Border Frame Rulers -->
		<rect
			x="1"
			y="1"
			width="998"
			height="998"
			fill="none"
			stroke="rgba(148, 163, 184, 0.2)"
			stroke-width="1"
		/>

		<!-- Corner Reticles -->
		<path d="M 1 20 L 1 1 L 20 1" fill="none" stroke="#38bdf8" stroke-width="2" />
		<path d="M 980 1 L 999 1 L 999 20" fill="none" stroke="#38bdf8" stroke-width="2" />
		<path d="M 1 980 L 1 999 L 20 999" fill="none" stroke="#38bdf8" stroke-width="2" />
		<path d="M 980 999 L 999 999 L 999 980" fill="none" stroke="#38bdf8" stroke-width="2" />

		<!-- Vignette Shadow Overlay -->
		<rect width="1000" height="1000" fill="url(#atlas-vignette)" pointer-events="none" />
	</svg>
</div>

<style>
	.atlas-canvas-container {
		perspective: 1000px;
	}
</style>
