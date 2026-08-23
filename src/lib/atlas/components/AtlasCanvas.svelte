<script lang="ts">
	import { atlasStore } from '../core/AtlasState.svelte';
	import type { AtlasEngine } from '../core/AtlasEngine';

	interface Props {
		engine: AtlasEngine;
	}

	let { engine }: Props = $props();

	function handleNodeClick(evidenceId?: string) {
		if (evidenceId) {
			engine.inspectNodeEvidence(evidenceId);
		}
	}
</script>

<div class="atlas-canvas-container relative h-full w-full overflow-hidden bg-[#0a0d12]">
	<!-- Topographic Dot Grid (Hardware-accelerated) -->
	<svg
		viewBox="0 0 1000 1000"
		preserveAspectRatio="xMidYMid slice"
		class="pointer-events-auto h-full w-full select-none"
	>
		<defs>
			<!-- Cartographic Dot Grid -->
			<pattern id="atlas-dot-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
				<circle cx="20" cy="20" r="1.2" fill="rgba(148, 163, 184, 0.15)" />
			</pattern>

			<!-- Radial Vignette Filter -->
			<radialGradient id="atlas-vignette" cx="50%" cy="50%" r="50%">
				<stop offset="0%" stop-color="transparent" />
				<stop offset="75%" stop-color="transparent" />
				<stop offset="100%" stop-color="rgba(10, 13, 18, 0.85)" />
			</radialGradient>

			<!-- Glowing Filter for Beacons -->
			<filter id="beacon-glow" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
				<feMerge>
					<feMergeNode in="blur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>

		<!-- Base Grid Layer -->
		<rect width="1000" height="1000" fill="url(#atlas-dot-grid-pattern)" />

		<!-- Spatial Camera Viewport Layer -->
		<g transform={atlasStore.svgMatrixTransform} class="transition-transform duration-75 ease-out">
			<!-- 1. Background Polygon Fill (Purwakarta) -->
			<path
				d="M 420 380 L 580 370 L 630 460 L 590 580 L 490 620 L 390 540 L 380 430 Z"
				fill="rgba(16, 185, 129, 0.05)"
				stroke="none"
			/>

			<!-- 2. System Network Edges / Data Flow Streams -->
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
							stroke-dasharray="4 4"
							opacity="0.6"
						/>
					</g>
				{/if}
			{/each}

			<!-- 3. Dynamic Vector Paths -->
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

			<!-- 4. Origin Beacon Concentric Radar Rings -->
			<g transform="translate(500, 500)">
				<circle
					r="12"
					fill="none"
					stroke="#10b981"
					stroke-width="0.8"
					opacity="0.3"
					class="origin-center animate-ping"
				/>
				<circle r="6" fill="none" stroke="#10b981" stroke-width="1.2" opacity="0.6" />
				<circle r="3" fill="#10b981" filter="url(#beacon-glow)" />
			</g>

			<!-- 5. Interactive Spatial Nodes -->
			{#each atlasStore.activeNodes as node (node.id)}
				<g
					transform={`translate(${node.position.x}, ${node.position.y})`}
					class="cursor-pointer transition-transform duration-200 hover:scale-125"
					onclick={() => handleNodeClick(node.evidenceId)}
					role="button"
					tabindex="0"
					onkeydown={(e) => e.key === 'Enter' && handleNodeClick(node.evidenceId)}
				>
					<!-- Node Outer Halo -->
					<circle
						r="16"
						fill={node.domain === 'gis'
							? 'rgba(16, 185, 129, 0.15)'
							: node.domain === 'erp'
								? 'rgba(14, 165, 233, 0.15)'
								: 'rgba(139, 92, 246, 0.15)'}
						stroke={node.domain === 'gis'
							? '#10b981'
							: node.domain === 'erp'
								? '#0ea5e9'
								: '#8b5cf6'}
						stroke-width="0.75"
						stroke-dasharray="2 2"
					/>

					<!-- Node Inner Core -->
					<circle
						r="4.5"
						fill={node.domain === 'gis' ? '#10b981' : node.domain === 'erp' ? '#0ea5e9' : '#8b5cf6'}
					/>

					<!-- Node Label Plate -->
					<g transform="translate(20, -6)">
						<rect
							x="-4"
							y="-10"
							width="180"
							height="28"
							fill="#111620"
							stroke="#1e293b"
							stroke-width="1"
							rx="2"
							opacity="0.9"
						/>
						<text
							x="2"
							y="1"
							fill="#f8fafc"
							font-family="JetBrains Mono"
							font-size="9"
							font-weight="700"
							letter-spacing="0.05em"
						>
							{node.label}
						</text>
						<text
							x="2"
							y="12"
							fill="#64748b"
							font-family="JetBrains Mono"
							font-size="7.5"
							letter-spacing="0.02em"
						>
							{node.subtitle ?? 'CLICK TO INSPECT'}
						</text>
					</g>
				</g>
			{/each}
		</g>

		<!-- Vignette Shadow Overlay -->
		<rect width="1000" height="1000" fill="url(#atlas-vignette)" pointer-events="none" />
	</svg>
</div>

<style>
	.atlas-canvas-container {
		perspective: 1000px;
	}
</style>
