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
	import { m } from '#lib/paraglide/messages.js';
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

			tl.from('.hud-eyebrow, .hud-title, .hud-desc', {
				y: 30,
				opacity: 0,
				stagger: 0.1
			})
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
	<canvas bind:this={canvasEl} class="folded-world-canvas" aria-label={m.world_description()}
	></canvas>

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
			<p class="hud-eyebrow">{m.gis_world_eyebrow()}</p>
			<h1 class="hud-title">{m.gis_world_title()}</h1>
			<p class="hud-desc">{m.world_description()}</p>
			<dl class="hud-stats">
				<div class="hud-stat">
					<dt class="hud-stat-label">TOTAL</dt>
					<dd class="hud-stat-value">{formatCount(totalVisitors)}</dd>
				</div>
				{#if todayVisitors > 0}
					<div class="hud-stat">
						<dt class="hud-stat-label">TODAY</dt>
						<dd class="hud-stat-value accent">{formatCount(todayVisitors)}</dd>
					</div>
				{/if}
				<div class="hud-stat">
					<dt class="hud-stat-label">{m.world_hud_nodes()}</dt>
					<dd class="hud-stat-value">{engine.state.nodeCount}</dd>
				</div>
			</dl>
			<button
				type="button"
				class="hud-mode-btn isolation-btn"
				class:active={engine.isFocusMode}
				aria-pressed={engine.isFocusMode}
				onclick={() => engine.toggleFocusMode()}
			>
				{engine.isFocusMode ? 'ISOLATION: ON' : 'ISOLATION: OFF'}
			</button>
			<p class="hud-context">
				{#if engine.viewMode === 'fold'}
					{m.world_mode_fold_desc()}
				{:else if engine.viewMode === 'heat'}
					{m.world_mode_heat_desc()}
				{:else}
					{m.world_mode_time_desc()}
				{/if}
			</p>
		</div>

		<!-- Top-right: Mode & Planet Toggle -->
		<div class="hud hud-top-right flex flex-col gap-6">
			<div class="hud-mode-group">
				<span class="hud-mode-label">{m.world_hud_mode()}: {currentModeLabel}</span>
				<div class="hud-mode-buttons">
					{#each VIEW_MODES as mode (mode.id)}
						<button
							type="button"
							class="hud-mode-btn"
							class:active={engine.viewMode === mode.id}
							aria-pressed={engine.viewMode === mode.id}
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
						type="button"
						aria-expanded={isPlanetDropdownOpen}
						class="hud-planet-dropdown-btn flex w-full items-center justify-between"
						onclick={() => (isPlanetDropdownOpen = !isPlanetDropdownOpen)}
					>
						<span>{currentPlanetLabel}</span>
						<span
							class="text-[8px] transition-transform"
							style:transform={isPlanetDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
						>
							▼
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
			<span class="hud-meta">{engine.state.fps} FPS · {engine.state.faceCount} FACES</span>
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
					{node.count} visitor{node.count !== 1 ? 's' : ''} · {formatRelativeTime(node.lastVisit)}
				</p>
			</div>
		</div>
	{/if}

	<!-- Detail Panel -->
	{#if engine.detailPanel.visible && engine.detailPanel.node}
		{@const node = engine.detailPanel.node}
		<div class="detail-panel">
			<button class="detail-close" aria-label="Close" onclick={() => engine.closeDetailPanel()}
				>×</button
			>

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
					<span class="detail-value">{node.latitude.toFixed(2)}°, {node.longitude.toFixed(2)}°</span
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
	   FOLDED WORLD — vector-map HUD
	   Paper background, white map cards, Red Hat Mono labels.
	   ================================================ */

	.folded-world-container {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 100dvh;
		overflow: hidden;
		background: var(--background);
		color: var(--foreground);
		font-family: var(--font-sans);
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

	/* ---------- Loading / error ---------- */
	.loading-overlay,
	.error-overlay {
		position: absolute;
		inset: 0;
		z-index: 20;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		background: var(--background);
		text-align: center;
		padding: 24px;
	}
	.loading-shape {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		border: 3px solid var(--border);
		border-top-color: var(--primary);
		animation: loading-spin 1s linear infinite;
	}
	.loading-text,
	.error-code {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 13px;
		font-weight: 600;
		color: var(--primary);
	}
	.error-msg {
		margin: 0;
		font-size: 18px;
		font-weight: 900;
	}
	.error-hint {
		margin: 0;
		font-size: 15px;
		color: var(--muted-foreground);
	}
	.loading-bar {
		width: 200px;
		height: 6px;
		border-radius: 999px;
		background: var(--border);
		overflow: hidden;
	}
	.loading-bar-fill {
		width: 40%;
		height: 100%;
		border-radius: 999px;
		background: var(--primary);
		animation: loading-slide 1.2s ease-in-out infinite;
	}

	/* ---------- HUD shared ---------- */
	.hud {
		position: absolute;
		z-index: 10;
	}
	.hud-top-left {
		top: 120px;
		left: clamp(16px, 3vw, 40px);
		width: min(380px, calc(100% - 32px));
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.hud-eyebrow {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 14px;
		font-weight: 600;
		color: var(--primary);
	}
	.hud-title {
		margin: 0;
		font-size: clamp(40px, 4.4vw, 64px);
		font-weight: 900;
		line-height: 1;
		letter-spacing: -0.03em;
	}
	.hud-desc,
	.hud-context {
		margin: 0;
		font-size: 17px;
		line-height: 1.6;
		color: var(--ink-soft);
	}
	.hud-context {
		font-size: 13px;
		font-family: var(--font-mono);
		color: var(--muted-foreground);
	}
	.hud-stats {
		margin: 0;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 8px;
	}
	.hud-stat {
		padding: 14px;
		border-radius: 20px;
		background: var(--card);
		border: 1px solid var(--border);
	}
	.hud-stat-label {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--muted-foreground);
	}
	.hud-stat-value {
		margin: 4px 0 0;
		font-size: 26px;
		font-weight: 900;
	}
	.hud-stat-value.accent {
		color: var(--primary);
	}

	.hud-top-right {
		top: 120px;
		right: clamp(16px, 3vw, 40px);
		width: 280px;
		padding: 16px;
		border-radius: 28px;
		background: var(--card);
		border: 1px solid var(--border);
		box-shadow: var(--shadow-float);
	}
	.hud-mode-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.hud-mode-label {
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 600;
		color: var(--muted-foreground);
	}
	.hud-mode-buttons {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.hud-mode-btn {
		min-height: 48px;
		padding: 10px 14px;
		border-radius: 18px;
		border: 1.5px solid var(--border);
		background: var(--card);
		color: var(--foreground);
		font: 900 15px var(--font-sans);
		text-align: left;
		cursor: pointer;
		transition:
			background 0.2s ease,
			border-color 0.2s ease;
	}
	.hud-mode-btn:hover {
		border-color: var(--foreground);
	}
	.hud-mode-btn.active {
		background: var(--accent);
		border-color: var(--primary);
		color: var(--primary);
	}
	.hud-mode-btn.isolation-btn {
		align-self: flex-start;
		min-height: 44px;
		border-radius: 999px;
		padding: 0 18px;
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 600;
	}
	.hud-mode-btn.isolation-btn.active {
		background: var(--primary);
		color: var(--primary-foreground);
	}

	.hud-planet-dropdown-btn {
		min-height: 44px;
		padding: 0 14px;
		border-radius: 14px;
		border: 1.5px solid var(--border);
		background: var(--card);
		color: var(--foreground);
		font: 800 15px var(--font-sans);
		cursor: pointer;
	}
	.hud-planet-dropdown-btn:hover {
		border-color: var(--foreground);
	}
	.hud-planet-dropdown-options {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		right: 0;
		z-index: 30;
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 6px;
		max-height: 260px;
		overflow-y: auto;
		border-radius: 18px;
		background: var(--card);
		border: 1px solid var(--border);
		box-shadow: var(--shadow-card);
		animation: dropdown-in 0.2s ease both;
	}
	.hud-planet-option {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 40px;
		padding: 0 10px;
		border: 0;
		border-radius: 12px;
		background: transparent;
		color: var(--foreground);
		font: 800 14px var(--font-sans);
		text-align: left;
		cursor: pointer;
	}
	.hud-planet-option:hover {
		background: var(--secondary);
	}
	.hud-planet-option.active {
		background: var(--accent);
		color: var(--primary);
	}
	.option-index {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--muted-foreground);
	}
	.hud-planet-option.active .option-index,
	.hud-planet-option:hover .option-index {
		color: var(--primary);
	}

	.hud-bottom-left {
		bottom: 20px;
		left: clamp(16px, 3vw, 40px);
	}
	.hud-bottom-right {
		bottom: 20px;
		right: clamp(16px, 3vw, 40px);
	}
	.hud-meta {
		display: inline-block;
		padding: 6px 12px;
		border-radius: 999px;
		background: var(--card);
		border: 1px solid var(--border);
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--muted-foreground);
	}

	/* ---------- Legend ---------- */
	.hud-legend {
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		width: min(320px, calc(100% - 32px));
	}
	.legend-content {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px 16px;
		border-radius: 20px;
		background: var(--card);
		border: 1px solid var(--border);
		box-shadow: var(--shadow-float);
	}
	.legend-label,
	.legend-scale,
	.legend-pulse-text {
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: 600;
		color: var(--muted-foreground);
	}
	.legend-visual {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.legend-bar {
		height: 10px;
		border-radius: 999px;
	}
	.neon-gradient {
		background: linear-gradient(90deg, var(--cold-color), var(--primary), var(--neon-color));
	}
	.heat-gradient {
		background: linear-gradient(90deg, #dcebf2, var(--primary), var(--route));
	}
	.violet-gradient {
		background: linear-gradient(90deg, var(--cold-color), var(--heat-color));
	}
	.legend-scale {
		display: flex;
		justify-content: space-between;
	}
	.legend-pulse-container {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.legend-pulse-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--route);
		animation: legend-pulse 1.6s ease-out infinite;
	}

	/* ---------- Tooltip ---------- */
	.world-tooltip {
		position: absolute;
		z-index: 25;
		pointer-events: none;
		animation: tooltip-in 0.15s ease both;
	}
	.tooltip-accent {
		display: none;
	}
	.tooltip-content {
		padding: 8px 12px;
		border-radius: 14px;
		background: var(--foreground);
		color: var(--background);
	}
	.tooltip-location {
		margin: 0;
		font-size: 14px;
		font-weight: 900;
	}
	.tooltip-detail {
		margin: 2px 0 0;
		font-family: var(--font-mono);
		font-size: 11px;
		opacity: 0.8;
	}

	/* ---------- Detail panel ---------- */
	.detail-panel {
		position: absolute;
		z-index: 15;
		right: clamp(16px, 3vw, 40px);
		bottom: 72px;
		width: min(320px, calc(100% - 32px));
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 20px;
		border-radius: 28px;
		background: var(--card);
		border: 1.5px solid var(--primary);
		box-shadow: var(--shadow-card);
		animation: panel-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both;
	}
	.detail-close {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 36px;
		height: 36px;
		border: 0;
		border-radius: 50%;
		background: var(--secondary);
		color: var(--foreground);
		font-size: 20px;
		line-height: 1;
		cursor: pointer;
	}
	.detail-close:hover {
		background: var(--foreground);
		color: var(--background);
	}
	.detail-title {
		margin: 0;
		padding-right: 40px;
		font-size: 20px;
		font-weight: 900;
	}
	.detail-divider {
		display: none;
	}
	.detail-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 10px;
	}
	.detail-item,
	.detail-section {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.detail-label {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--muted-foreground);
	}
	.detail-value {
		font-weight: 800;
	}
	.detail-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.detail-tag {
		padding: 4px 10px;
		border-radius: 999px;
		background: var(--secondary);
		font-size: 13px;
		font-weight: 800;
	}

	/* ---------- Minimal (embedded) ---------- */
	.folded-world-container.minimal {
		min-height: 0;
	}

	@keyframes loading-spin {
		to {
			transform: rotate(360deg);
		}
	}
	@keyframes loading-slide {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(250%);
		}
	}
	@keyframes dropdown-in {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}
	}
	@keyframes legend-pulse {
		from {
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--route) 60%, transparent);
		}
		to {
			box-shadow: 0 0 0 10px transparent;
		}
	}
	@keyframes tooltip-in {
		from {
			opacity: 0;
		}
	}
	@keyframes panel-in {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
	}

	/* Phones: stack the title block on top, mode card at the bottom. */
	@media (max-width: 900px) {
		.hud-top-left {
			top: 96px;
			padding: 16px;
			border-radius: 24px;
			background: color-mix(in srgb, var(--card) 92%, transparent);
			border: 1px solid var(--border);
			gap: 10px;
		}
		.hud-desc,
		.hud-context {
			display: none;
		}
		.hud-stat {
			padding: 10px;
		}
		.hud-stat-value {
			font-size: 20px;
		}
		.hud-top-right {
			top: auto;
			bottom: 16px;
			left: 16px;
			right: 16px;
			width: auto;
			padding: 12px;
			gap: 10px !important;
		}
		.hud-mode-buttons {
			flex-direction: row;
		}
		.hud-mode-btn {
			flex: 1;
			text-align: center;
		}
		.hud-bottom-left,
		.hud-bottom-right,
		.hud-legend {
			display: none;
		}
		.detail-panel {
			bottom: auto;
			top: 96px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.loading-shape,
		.loading-bar-fill,
		.legend-pulse-dot {
			animation: none;
		}
	}
</style>
