<script lang="ts">
	import { atlasStore } from '../core/AtlasState.svelte';
	import type { AtlasEngine } from '../core/AtlasEngine';
	import '../styles/atlas.css';

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
	<!-- Topographic SVG ViewBox (1000x1000) -->
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

			<!-- Cartographic Contour Isolines -->
			<pattern id="atlas-isoline-pattern" width="200" height="200" patternUnits="userSpaceOnUse">
				<circle
					cx="100"
					cy="100"
					r="80"
					fill="none"
					stroke="rgba(16, 185, 129, 0.04)"
					stroke-width="0.75"
				/>
				<circle
					cx="100"
					cy="100"
					r="50"
					fill="none"
					stroke="rgba(16, 185, 129, 0.03)"
					stroke-width="0.5"
				/>
			</pattern>

			<!-- Radial Vignette Shadow -->
			<radialGradient id="atlas-vignette" cx="50%" cy="50%" r="50%">
				<stop offset="0%" stop-color="transparent" />
				<stop offset="70%" stop-color="transparent" />
				<stop offset="100%" stop-color="rgba(10, 13, 18, 0.88)" />
			</radialGradient>

			<!-- Glow Filters -->
			<filter id="beacon-glow-emerald" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
				<feMerge>
					<feMergeNode in="blur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>

			<filter id="node-glow-sky" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
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
			<!-- 1. Regional Polygon Boundary (Kab. Purwakarta) -->
			<path
				d="M 420 380 L 580 370 L 630 460 L 590 580 L 490 620 L 390 540 L 380 430 Z"
				fill="rgba(16, 185, 129, 0.06)"
				stroke="#10b981"
				stroke-width="1.25"
				stroke-dasharray="4 2"
				class="transition-all duration-500"
			/>

			<!-- 2. System Network Edges & Data Flow Connections -->
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
							r="2"
							fill={edge.strokeColor ?? '#38bdf8'}
							class="animate-pulse"
						/>
					</g>
				{/if}
			{/each}

			<!-- 3. Dynamic Trajectory & Topological Paths -->
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

			<!-- 4. Point State 1: Active Beacon (Origin Point Purwakarta) -->
			<g transform="translate(500, 500)">
				<circle
					r="16"
					fill="none"
					stroke="#10b981"
					stroke-width="0.8"
					opacity="0.3"
					class="origin-center animate-ping"
				/>
				<circle r="8" fill="none" stroke="#10b981" stroke-width="1.2" opacity="0.7" />
				<circle r="3.5" fill="#10b981" filter="url(#beacon-glow-emerald)" />

				<!-- Beacon Crosshair Marker -->
				<line x1="-12" y1="0" x2="-5" y2="0" stroke="#10b981" stroke-width="0.75" />
				<line x1="5" y1="0" x2="12" y2="0" stroke="#10b981" stroke-width="0.75" />
				<line x1="0" y1="-12" x2="0" y2="-5" stroke="#10b981" stroke-width="0.75" />
				<line x1="0" y1="5" x2="0" y2="12" stroke="#10b981" stroke-width="0.75" />
			</g>

			<!-- 5. Point State 2 & 3: Route Junctions & Evidence Anchors -->
			{#each atlasStore.activeNodes as node (node.id)}
				<g
					transform={`translate(${node.position.x}, ${node.position.y})`}
					class="cursor-pointer transition-transform duration-200 hover:scale-125"
					onclick={() => handleNodeClick(node.evidenceId)}
					role="button"
					tabindex="0"
					onkeydown={(e) => e.key === 'Enter' && handleNodeClick(node.evidenceId)}
				>
					<!-- Evidence Anchor (Square Technical Reticle) -->
					<rect
						x="-9"
						y="-9"
						width="18"
						height="18"
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
						stroke-width="1"
						stroke-dasharray="3 3"
						rx="1"
					/>

					<!-- Inner Core -->
					<circle
						r="3.5"
						fill={node.domain === 'gis' ? '#10b981' : node.domain === 'erp' ? '#0ea5e9' : '#8b5cf6'}
						filter="url(#node-glow-sky)"
					/>

					<!-- Tactical Node Plate -->
					<g transform="translate(18, -10)">
						<rect
							x="-4"
							y="-4"
							width="170"
							height="28"
							fill="#111620"
							stroke="#1e293b"
							stroke-width="1"
							rx="2"
							opacity="0.95"
						/>
						<text
							x="3"
							y="6"
							fill="#f8fafc"
							font-family="JetBrains Mono"
							font-size="8.5"
							font-weight="700"
							letter-spacing="0.05em"
						>
							{node.label}
						</text>
						<text
							x="3"
							y="17"
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
