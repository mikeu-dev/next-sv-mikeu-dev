<script lang="ts">
	import { onMount } from 'svelte';
	import { createFoldedWorldEngine } from './folded-world-engine.svelte';
	import { formatRelativeTime } from './folded-world-geometry';
	import {
		getPlanetColors,
		type GeoNode,
		type ViewMode,
		type PlanetStyle
	} from './folded-world.types';
	import { m } from '$lib/paraglide/messages';
	import { mode } from 'mode-watcher';
	import gsap from 'gsap';

	interface Props {
		nodes: GeoNode[];
		totalVisitors: number;
		todayVisitors?: number;
		minimal?: boolean;
	}

	let { nodes, totalVisitors, todayVisitors = 0, minimal = false }: Props = $props();
	let isDark = $derived(mode.current === 'dark');

	const engine = createFoldedWorldEngine();

	let containerEl: HTMLElement;
	let canvasEl: HTMLCanvasElement;
	let isPlanetDropdownOpen = $state(false);

	const VIEW_MODES: { id: ViewMode; label: string }[] = [
		{ id: 'fold', label: 'FOLD' },
		{ id: 'heat', label: 'HEAT' },
		{ id: 'timeline', label: 'TIME' }
	];

	const PLANET_STYLES: { id: PlanetStyle; label: string }[] = [
		{ id: 'mercury', label: 'MERCURY' },
		{ id: 'venus', label: 'VENUS' },
		{ id: 'earth', label: 'EARTH' },
		{ id: 'mars', label: 'MARS' },
		{ id: 'jupiter', label: 'JUPITER' },
		{ id: 'saturn', label: 'SATURN' },
		{ id: 'uranus', label: 'URANUS' },
		{ id: 'neptune', label: 'NEPTUNE' }
	];

	let currentModeLabel = $derived(
		VIEW_MODES.find((m) => m.id === engine.viewMode)?.label ?? 'FOLD'
	);

	let currentPlanetLabel = $derived(
		PLANET_STYLES.find((p) => p.id === engine.planetStyle)?.label ?? 'EARTH'
	);

	let currentColors = $derived(getPlanetColors(engine.planetStyle, isDark));

	onMount(() => {
		engine.init(containerEl, canvasEl, nodes, isDark, minimal);

		return () => {
			engine.destroy();
		};
	});

	// --- Theme Sync ---
	$effect(() => {
		engine.updateTheme(isDark);
	});

	// --- Data Sync ---
	$effect(() => {
		engine.updateNodes(nodes);
	});

	// --- HUD Entrance Animations ---
	$effect(() => {
		if (engine.state.ready && !minimal) {
			const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.2 } });

			tl.from('.hud-title', {
				y: 40,
				opacity: 0,
				skewX: -20,
				stagger: 0.1
			})
				.from(
					'.hud-divider',
					{
						scaleX: 0,
						transformOrigin: 'left',
						duration: 0.8
					},
					'-=0.8'
				)
				.from(
					'.hud-stat',
					{
						y: 20,
						opacity: 0,
						stagger: 0.05
					},
					'-=0.6'
				)
				.from(
					'.hud-top-right',
					{
						x: 40,
						opacity: 0
					},
					'-=1'
				)
				.from(
					'.hud-bottom-left, .hud-bottom-right, .hud-context, .hud-legend',
					{
						y: 20,
						opacity: 0,
						stagger: 0.1
					},
					'-=0.8'
				);
		}
	});

	function handleModeSwitch(mode: ViewMode) {
		engine.setViewMode(mode);

		// Subtle feedback animation
		gsap.fromTo(
			'.hud-mode-label',
			{ opacity: 0.5, x: -5 },
			{ opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
		);
	}

	function handlePlanetSwitch(style: PlanetStyle) {
		engine.setPlanetStyle(style);

		// GSAP flash effect on canvas for style change feedback
		gsap.fromTo(
			'.folded-world-canvas',
			{ filter: 'brightness(2) contrast(1.2)' },
			{ filter: 'brightness(1) contrast(1)', duration: 0.8, ease: 'expo.out' }
		);
	}

	function formatCount(n: number): string {
		return n.toLocaleString();
	}
</script>

<div class="folded-world-container" class:minimal bind:this={containerEl}>
	<!-- Three.js Canvas -->
	<canvas bind:this={canvasEl} class="folded-world-canvas"></canvas>

	<!-- Loading State -->
	{#if engine.state.loading && !minimal}
		<div class="loading-overlay">
			<div class="loading-shape"></div>
			<p class="loading-text">{m.world_loading()}</p>
			<div class="loading-bar">
				<div class="loading-bar-fill"></div>
			</div>
		</div>
	{/if}

	<!-- Error State -->
	{#if engine.state.error && !minimal}
		<div class="error-overlay">
			<p class="error-code">ERR::WEBGL_FAIL</p>
			<p class="error-msg">{engine.state.error}</p>
			<p class="error-hint">{m.world_err_webgl()}</p>
		</div>
	{/if}

	<!-- HUD Overlay (Hidden in minimal mode) -->
	{#if engine.state.ready && !minimal}
		<!-- Top-left: Title & Stats -->
		<div class="hud hud-top-left">
			<h2 class="hud-title">
				{#each m.world_title().split(' ') as word, i (i)}
					{word}{#if i < m.world_title().split(' ').length - 1}<br />{/if}
				{/each}
			</h2>
			<div class="hud-divider"></div>
			<button
				class="hud-mode-btn isolation-btn"
				class:active={engine.isFocusMode}
				onclick={() => engine.toggleFocusMode()}
			>
				<span class="btn-glitch-layer"
					>{engine.isFocusMode ? 'ISOLATION: ON' : 'ISOLATION: OFF'}</span
				>
			</button>
			<div class="hud-stats">
				<div class="hud-stat">
					<span class="hud-stat-label">TOTAL</span>
					<span class="hud-stat-value">{formatCount(totalVisitors)}</span>
				</div>
				{#if todayVisitors > 0}
					<div class="hud-stat">
						<span class="hud-stat-label">TODAY</span>
						<span class="hud-stat-value">{formatCount(todayVisitors)}</span>
					</div>
				{/if}
				<div class="hud-stat">
					<span class="hud-stat-label">{m.world_hud_nodes()}</span>
					<span class="hud-stat-value">{engine.state.nodeCount}</span>
				</div>
			</div>

			<!-- Context Description -->
			<div class="hud-context mt-12 hidden max-w-[280px] md:block">
				<div class="mb-2 flex items-center gap-2">
					<div class="h-1.5 w-1.5 animate-pulse bg-[#ff3333]"></div>
					<span class="text-[9px] tracking-[0.2em] text-[#666]">SYSTEM_CONTEXT</span>
				</div>
				<p class="mb-4 text-[11px] leading-relaxed text-[#888]">
					{m.world_description()}
				</p>
				<div class="border-l border-[#333] pl-3">
					<p class="text-[10px] leading-relaxed text-[#666]">
						{#if engine.viewMode === 'fold'}
							{m.world_mode_fold_desc()}
						{:else if engine.viewMode === 'heat'}
							{m.world_mode_heat_desc()}
						{:else}
							{m.world_mode_time_desc()}
						{/if}
					</p>
				</div>
			</div>
		</div>

		<!-- Top-right: Mode & Planet Toggle -->
		<div class="hud hud-top-right flex flex-col gap-6">
			<div class="hud-mode-group">
				<span class="hud-mode-label">{m.world_hud_mode()}: {currentModeLabel}</span>
				<div class="hud-mode-buttons">
					{#each VIEW_MODES as mode (mode.id)}
						<button
							class="hud-mode-btn"
							class:active={engine.viewMode === mode.id}
							onclick={() => handleModeSwitch(mode.id)}
						>
							{mode.label}
						</button>
					{/each}
				</div>
			</div>

			<div class="hud-mode-group">
				<span class="hud-mode-label">PLANET: {currentPlanetLabel}</span>
				<div class="relative w-full min-w-[180px]">
					<button
						class="hud-planet-dropdown-btn flex w-full items-center justify-between"
						onclick={() => (isPlanetDropdownOpen = !isPlanetDropdownOpen)}
					>
						<span>{currentPlanetLabel}</span>
						<span
							class="text-[8px] transition-transform"
							style:transform={isPlanetDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
						>
							â–¼
						</span>
					</button>

					{#if isPlanetDropdownOpen}
						<div class="hud-planet-dropdown-options">
							{#each PLANET_STYLES as planet (planet.id)}
								<button
									class="hud-planet-option"
									class:active={engine.planetStyle === planet.id}
									onclick={() => {
										handlePlanetSwitch(planet.id);
										isPlanetDropdownOpen = false;
									}}
								>
									<span class="option-index">0{PLANET_STYLES.indexOf(planet) + 1}</span>
									{planet.label}
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Bottom-left: FPS & Face count -->
		<div class="hud hud-bottom-left">
			<span class="hud-meta">{engine.state.fps} FPS Â· {engine.state.faceCount} FACES</span>
		</div>

		<!-- Bottom-right: Instructions -->
		<div class="hud hud-bottom-right">
			<span class="hud-meta">{m.world_hud_instructions()}</span>
		</div>

		<!-- Bottom-center: Legend -->
		<div
			class="hud hud-legend"
			style="
				--neon-color: #{currentColors.neon.toString(16).padStart(6, '0')};
				--heat-color: #{currentColors.accent.toString(16).padStart(6, '0')};
				--cold-color: #{currentColors.faceCold.toString(16).padStart(6, '0')};
			"
		>
			<div class="legend-content">
				<div class="legend-header">
					<span class="legend-label">{m.world_hud_mode()} :: {currentModeLabel}</span>
				</div>
				<div class="legend-visual">
					{#if engine.viewMode === 'fold'}
						<div class="legend-bar neon-gradient"></div>
						<div class="legend-scale">
							<span>MIN</span>
							<span>MAX DENSITY</span>
						</div>
					{:else if engine.viewMode === 'heat'}
						<div class="legend-bar heat-gradient"></div>
						<div class="legend-scale">
							<span>NONE</span>
							<span>HOTSPOT</span>
						</div>
					{:else}
						<div class="legend-bar violet-gradient"></div>
						<div class="legend-pulse-container">
							<div class="legend-pulse-dot"></div>
							<span class="legend-pulse-text">ACTIVE VISITOR FREQUENCY</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Tooltip -->
	{#if engine.tooltip.visible && engine.tooltip.node}
		{@const node = engine.tooltip.node}
		<div
			class="world-tooltip"
			style="left: {engine.tooltip.x + 16}px; top: {engine.tooltip.y - 8}px;"
		>
			<div class="tooltip-accent"></div>
			<div class="tooltip-content">
				<p class="tooltip-location">
					{node.city ? `${node.city}, ` : ''}{node.country}
				</p>
				<p class="tooltip-detail">
					{node.count} visitor{node.count !== 1 ? 's' : ''} Â· {formatRelativeTime(node.lastVisit)}
				</p>
			</div>
		</div>
	{/if}

	<!-- Detail Panel -->
	{#if engine.detailPanel.visible && engine.detailPanel.node}
		{@const node = engine.detailPanel.node}
		<div class="detail-panel">
			<button class="detail-close" onclick={() => engine.closeDetailPanel()}>Ã—</button>

			<h3 class="detail-title">
				{node.city ? `${node.city}, ` : ''}{node.country}
			</h3>

			<div class="detail-divider"></div>

			<div class="detail-grid">
				<div class="detail-item">
					<span class="detail-label">{m.world_detail_visitors()}</span>
					<span class="detail-value">{node.count}</span>
				</div>
				<div class="detail-item">
					<span class="detail-label">{m.world_detail_last_visit()}</span>
					<span class="detail-value">{formatRelativeTime(node.lastVisit)}</span>
				</div>
				<div class="detail-item">
					<span class="detail-label">{m.world_detail_coords()}</span>
					<span class="detail-value"
						>{node.latitude.toFixed(2)}Â°, {node.longitude.toFixed(2)}Â°</span
					>
				</div>
			</div>

			{#if node.browsers.length > 0}
				<div class="detail-section">
					<span class="detail-label">{m.world_detail_browsers()}</span>
					<div class="detail-tags">
						{#each node.browsers.slice(0, 5) as browser (browser)}
							<span class="detail-tag">{browser}</span>
						{/each}
					</div>
				</div>
			{/if}

			{#if node.devices.length > 0}
				<div class="detail-section">
					<span class="detail-label">{m.world_detail_devices()}</span>
					<div class="detail-tags">
						{#each node.devices.slice(0, 5) as device (device)}
							<span class="detail-tag">{device}</span>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* ================================================
	   FOLDED WORLD â€” Brutalist + Origami Aesthetics
	   ================================================ */

	.folded-world-container {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 100dvh;
		overflow: hidden;
		background-color: transparent;
		/* Brutalist Architectural Grid + Vignette */
		background-image:
			radial-gradient(circle at center, transparent 20%, rgba(0, 0, 0, 0.15) 100%),
			linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
		background-size:
			100% 100%,
			40px 40px,
			40px 40px;
		background-position: center center;
		font-family: 'JetBrains Mono', 'Courier New', monospace;
	}

	/* Giant Typography Watermark */
	.folded-world-container::before {
		content: 'SYS.ARCHIVE // SECTOR-00';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) rotate(-5deg);
		font-size: clamp(4rem, 12vw, 15rem);
		font-weight: 900;
		color: rgba(0, 0, 0, 0.04);
		white-space: nowrap;
		pointer-events: none;
		z-index: 0;
	}

	:global(.dark) .folded-world-container {
		background-color: #0a0a0a;
		background-image:
			radial-gradient(circle at center, transparent 20%, rgba(0, 0, 0, 0.9) 100%),
			linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
	}

	:global(.dark) .folded-world-container::before {
		color: rgba(255, 255, 255, 0.015);
	}

	.folded-world-canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		cursor: grab;
		z-index: 1;
	}

	.folded-world-canvas:active {
		cursor: grabbing;
	}

	/* --- Loading State --- */

	.loading-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #f0f0f0;
		z-index: 50;
	}

	:global(.dark) .loading-overlay {
		background: #0a0a0a;
	}

	.loading-shape {
		width: 80px;
		height: 80px;
		border: 2px solid #e0e0e0;
		clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
		animation: loading-spin 3s linear infinite;
	}

	@keyframes loading-spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.loading-text {
		margin-top: 24px;
		font-size: 11px;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: #666;
	}

	.loading-bar {
		margin-top: 16px;
		width: 200px;
		height: 2px;
		background: #222;
		overflow: hidden;
	}

	.loading-bar-fill {
		width: 40%;
		height: 100%;
		background: #e0e0e0;
		animation: loading-slide 1.5s ease-in-out infinite;
	}

	@keyframes loading-slide {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(350%);
		}
	}

	/* --- Error State --- */

	.error-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #f0f0f0;
		z-index: 50;
	}

	:global(.dark) .error-overlay {
		background: #0a0a0a;
	}

	.error-code {
		font-size: 14px;
		letter-spacing: 0.2em;
		color: #ff3333;
		margin-bottom: 8px;
	}

	.error-msg {
		font-size: 12px;
		color: #888;
		max-width: 400px;
		text-align: center;
	}

	.error-hint {
		margin-top: 16px;
		font-size: 11px;
		color: #555;
	}

	/* --- HUD Overlay --- */

	.hud {
		position: absolute;
		z-index: 50;
		pointer-events: none;
	}

	.hud-top-left {
		top: 112px;
		left: 24px;
		pointer-events: auto;
	}

	.hud-top-right {
		top: 112px;
		right: 24px;
		text-align: right;
		pointer-events: auto;
	}

	.hud-bottom-left {
		bottom: 24px;
		left: 24px;
	}

	.hud-bottom-right {
		bottom: 24px;
		right: 24px;
		text-align: right;
	}

	.hud-title {
		font-size: 28px;
		font-weight: 900;
		letter-spacing: 0.15em;
		line-height: 1.1;
		color: #0a0a0a;
		text-transform: uppercase;
		margin: 0;
	}

	:global(.dark) .hud-title {
		color: #fafafa;
	}

	:global(.dark) .hud-divider {
		background-color: #fafafa;
	}

	:global(.dark) .hud-stat-value {
		color: #fafafa;
	}

	:global(.dark) .hud-mode-label {
		color: #aaa;
	}

	.hud-divider {
		width: 60px;
		height: 3px;
		background: #ff3333;
		margin: 12px 0;
	}

	.hud-stats {
		display: flex;
		gap: 20px;
	}

	.hud-stat {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.hud-stat-label {
		font-size: 9px;
		letter-spacing: 0.25em;
		color: #666;
		text-transform: uppercase;
	}

	.hud-stat-value {
		font-size: 18px;
		font-weight: 700;
		color: #0a0a0a;
		letter-spacing: 0.05em;
	}

	:global(.dark) .hud-stat-value {
		color: #fafafa;
	}

	.hud-mode-label {
		font-size: 9px;
		letter-spacing: 0.25em;
		color: #666;
		display: block;
		margin-bottom: 8px;
	}

	.hud-mode-buttons {
		display: flex;
		gap: 4px;
	}

	.hud-mode-btn {
		padding: 6px 14px;
		font-size: 10px;
		font-family: 'JetBrains Mono', 'Courier New', monospace;
		font-weight: 700;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		background: transparent;
		border: 1.5px solid #333;
		color: #888;
		cursor: pointer;
		transition: all 0.15s ease;
		clip-path: polygon(8% 0, 100% 0, 92% 100%, 0 100%);
	}

	.hud-mode-btn:hover {
		border-color: #e0e0e0;
		color: #e0e0e0;
	}

	.hud-mode-btn.active {
		background: #1a1a1a;
		border-color: #1a1a1a;
		color: #fafafa;
	}

	:global(.dark) .hud-mode-btn.active {
		background: #e0e0e0;
		border-color: #e0e0e0;
		color: #0a0a0a;
	}

	.hud-meta {
		font-size: 9px;
		letter-spacing: 0.2em;
		color: #444;
		text-transform: uppercase;
	}

	/* --- Legend --- */

	.hud-legend {
		bottom: 24px;
		left: 50%;
		transform: translateX(-50%);
		pointer-events: auto;
	}

	.legend-content {
		background: rgba(255, 255, 255, 0.9);
		border: 1px solid #ddd;
		padding: 10px 16px;
		min-width: 200px;
		clip-path: polygon(4% 0, 100% 0, 96% 100%, 0 100%);
	}

	:global(.dark) .legend-content {
		background: rgba(15, 15, 15, 0.9);
		border: 1px solid #333;
	}

	.legend-header {
		margin-bottom: 8px;
		border-bottom: 1px solid #eee;
		padding-bottom: 4px;
	}

	:global(.dark) .legend-header {
		border-color: #222;
	}

	.legend-label {
		font-size: 8px;
		letter-spacing: 0.2em;
		color: #888;
		text-transform: uppercase;
	}

	.legend-visual {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.legend-bar {
		height: 6px;
		width: 100%;
		border: 1px solid #333;
	}

	.neon-gradient {
		background: linear-gradient(
			90deg,
			var(--cold-color, #121212) 0%,
			var(--neon-color, #00f3ff) 100%
		);
	}

	.heat-gradient {
		background: linear-gradient(
			90deg,
			var(--cold-color, #121212) 0%,
			var(--heat-color, #ff3333) 100%
		);
	}

	.violet-gradient {
		background: linear-gradient(90deg, var(--cold-color, #121212) 0%, #bb66ff 100%);
		margin-bottom: 4px;
	}

	.legend-scale {
		display: flex;
		justify-content: space-between;
		font-size: 7px;
		letter-spacing: 0.1em;
		color: #666;
		text-transform: uppercase;
	}

	.legend-pulse-container {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 2px 0;
	}

	.legend-pulse-dot {
		width: 6px;
		height: 6px;
		background: #bb66ff;
		border-radius: 50%;
		animation: legend-pulse 1.5s ease-out infinite;
	}

	@keyframes legend-pulse {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		100% {
			transform: scale(3);
			opacity: 0;
		}
	}

	.legend-pulse-text {
		font-size: 8px;
		letter-spacing: 0.1em;
		color: #aaa;
		text-transform: uppercase;
	}

	/* --- Tooltip --- */

	.world-tooltip {
		position: fixed;
		z-index: 30;
		display: flex;
		pointer-events: none;
		animation: tooltip-in 0.12s ease-out;
	}

	@keyframes tooltip-in {
		from {
			opacity: 0;
			transform: translateX(-8px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.tooltip-accent {
		width: 3px;
		background: #ff3333;
		flex-shrink: 0;
	}

	.tooltip-location {
		font-size: 12px;
		font-weight: 700;
		color: #0a0a0a;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		margin: 0;
	}

	:global(.dark) .tooltip-location {
		color: #fafafa;
	}

	.tooltip-content {
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid #ddd;
		border-left: none;
		padding: 8px 14px;
	}

	:global(.dark) .tooltip-content {
		background: rgba(15, 15, 15, 0.95);
		border: 1px solid #333;
		border-left: none;
	}

	.tooltip-detail {
		font-size: 10px;
		color: #888;
		margin: 2px 0 0;
	}

	.hud-planet-dropdown-btn {
		background: transparent;
		border: 2px solid #333;
		padding: 8px 16px;
		font-size: 11px;
		font-family: 'JetBrains Mono', 'Courier New', monospace;
		font-weight: 800;
		letter-spacing: 0.1em;
		color: #888;
		text-transform: uppercase;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);
		clip-path: polygon(6% 0, 100% 0, 94% 100%, 0 100%);
		position: relative;
		overflow: hidden;
	}

	.hud-mode-btn.isolation-btn {
		margin-bottom: 20px;
		border-color: #555;
		color: #666;
		width: auto;
		padding: 6px 12px;
	}

	.hud-mode-btn.isolation-btn.active {
		border-color: #ff3333;
		color: #ff3333;
		background: rgba(255, 51, 51, 0.1);
		box-shadow: 4px 4px 0px rgba(255, 51, 51, 0.2);
	}

	.hud-planet-dropdown-btn:hover {
		border-color: #ff3333;
		color: #fafafa;
		background: rgba(255, 51, 51, 0.1);
	}

	.hud-planet-dropdown-options {
		position: absolute;
		top: calc(100% + 4px);
		right: 0;
		width: 100%;
		background: rgba(15, 15, 15, 0.95);
		border: 1.5px solid #333;
		display: flex;
		flex-direction: column;
		z-index: 50;
		padding: 4px;
		clip-path: polygon(0 0, 96% 0, 100% 10%, 100% 100%, 4% 100%, 0 90%);
		box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.8);
		animation: dropdown-in 0.3s cubic-bezier(0.23, 1, 0.32, 1);
	}

	@keyframes dropdown-in {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.hud-planet-option {
		width: 100%;
		text-align: left;
		padding: 10px 14px;
		font-size: 10px;
		font-family: 'JetBrains Mono', 'Courier New', monospace;
		font-weight: 700;
		color: #666;
		background: transparent;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 12px;
		transition: all 0.15s ease;
		text-transform: uppercase;
	}

	.option-index {
		font-size: 8px;
		color: #444;
		font-weight: 400;
	}

	.hud-planet-option:hover {
		background: #ff3333;
		color: #fafafa;
		clip-path: polygon(2% 0, 100% 0, 98% 100%, 0 100%);
	}

	.hud-planet-option.active {
		color: #ff3333;
	}

	.hud-planet-option.active .option-index {
		color: #ff3333;
	}

	.hud-planet-option:hover .option-index {
		color: rgba(255, 255, 255, 0.6);
	}

	.detail-panel {
		position: absolute;
		right: 24px;
		bottom: 100px; /* Moved to bottom to clear the Top-Right HUD switcher */
		width: 280px;
		background: rgba(255, 255, 255, 0.95);
		border: 1.5px solid #ddd;
		padding: 24px;
		z-index: 20;
		clip-path: polygon(0 0, 100% 0, 96% 100%, 4% 100%);
		animation: panel-in 0.2s ease-out;
	}

	:global(.dark) .detail-panel {
		background: rgba(15, 15, 15, 0.95);
		border: 1.5px solid #333;
	}

	@keyframes panel-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.detail-close {
		position: absolute;
		top: 12px;
		right: 16px;
		background: none;
		border: none;
		color: #666;
		font-size: 20px;
		cursor: pointer;
		padding: 4px 8px;
		font-family: 'JetBrains Mono', 'Courier New', monospace;
	}

	.detail-close:hover {
		color: #ff3333;
	}

	.detail-title {
		font-size: 16px;
		font-weight: 900;
		color: #0a0a0a;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		margin: 0;
		padding-right: 30px;
	}

	:global(.dark) .detail-title {
		color: #fafafa;
	}

	.detail-divider {
		width: 40px;
		height: 2px;
		background: #ff3333;
		margin: 12px 0;
	}

	.detail-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		margin-bottom: 16px;
	}

	.detail-item {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.detail-label {
		font-size: 9px;
		letter-spacing: 0.2em;
		color: #666;
		text-transform: uppercase;
	}

	.detail-value {
		font-size: 13px;
		font-weight: 600;
		color: #1a1a1a;
	}

	:global(.dark) .detail-value {
		color: #e0e0e0;
	}

	.detail-section {
		margin-top: 12px;
	}

	.detail-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-top: 6px;
	}

	.detail-tag {
		font-size: 9px;
		padding: 3px 8px;
		background: #e5e5e5;
		border: 1px solid #ccc;
		color: #666;
		letter-spacing: 0.05em;
	}

	:global(.dark) .detail-tag {
		background: #1a1a1a;
		border: 1px solid #333;
		color: #aaa;
	}

	/* --- Responsive --- */

	@media (max-width: 640px) {
		.hud-top-left {
			top: 90px;
			left: 16px;
		}

		.hud-top-right {
			top: 90px;
			right: 16px;
		}

		.hud-bottom-left {
			bottom: 16px;
			left: 16px;
		}

		.hud-bottom-right {
			display: none;
		}

		.hud-legend {
			bottom: 80px;
			left: 16px;
			transform: none;
			width: calc(100% - 32px);
		}

		.legend-content {
			min-width: 0;
			padding: 8px 12px;
		}

		.hud-title {
			font-size: 20px;
		}

		.hud-stats {
			gap: 12px;
		}

		.hud-stat-value {
			font-size: 14px;
		}

		.detail-panel {
			right: 8px;
			left: 8px;
			width: auto;
			top: auto;
			bottom: 16px;
			transform: none;
			clip-path: polygon(0 0, 100% 0, 98% 100%, 2% 100%);
		}

		@keyframes panel-in {
			from {
				opacity: 0;
				transform: translateY(20px);
			}
			to {
				opacity: 1;
				transform: translateY(0);
			}
		}
	}
</style>
