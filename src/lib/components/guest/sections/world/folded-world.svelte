<script lang="ts">
	import { onMount } from 'svelte';
	import { createFoldedWorldEngine } from './folded-world-engine.svelte';
	import { formatRelativeTime } from './folded-world-geometry';
	import type { GeoNode, ViewMode } from './folded-world.types';
	import { m } from '$lib/paraglide/messages';
	import gsap from 'gsap';

	interface Props {
		nodes: GeoNode[];
		totalVisitors: number;
		todayVisitors?: number;
		isDark?: boolean;
	}

	let { nodes, totalVisitors, todayVisitors = 0, isDark = true }: Props = $props();

	const engine = createFoldedWorldEngine();

	let containerEl: HTMLElement;
	let canvasEl: HTMLCanvasElement;

	const VIEW_MODES: { id: ViewMode; label: string }[] = [
		{ id: 'fold', label: 'FOLD' },
		{ id: 'heat', label: 'HEAT' },
		{ id: 'timeline', label: 'TIME' }
	];

	let currentModeLabel = $derived(
		VIEW_MODES.find((m) => m.id === engine.viewMode)?.label ?? 'FOLD'
	);

	onMount(() => {
		engine.init(containerEl, canvasEl, nodes, isDark);

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
		if (engine.state.ready) {
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
					'.hud-bottom-left, .hud-bottom-right, .hud-context',
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

	function formatCount(n: number): string {
		if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
		return n.toString();
	}
</script>

<div class="folded-world-container" bind:this={containerEl}>
	<!-- Three.js Canvas -->
	<canvas bind:this={canvasEl} class="folded-world-canvas"></canvas>

	<!-- Loading State -->
	{#if engine.state.loading}
		<div class="loading-overlay">
			<div class="loading-shape"></div>
			<p class="loading-text">{m.world_loading()}</p>
			<div class="loading-bar">
				<div class="loading-bar-fill"></div>
			</div>
		</div>
	{/if}

	<!-- Error State -->
	{#if engine.state.error}
		<div class="error-overlay">
			<p class="error-code">ERR::WEBGL_FAIL</p>
			<p class="error-msg">{engine.state.error}</p>
			<p class="error-hint">{m.world_err_webgl()}</p>
		</div>
	{/if}

	<!-- HUD Overlay -->
	{#if engine.state.ready}
		<!-- Top-left: Title & Stats -->
		<div class="hud hud-top-left">
			<h2 class="hud-title">
				{#each m.world_title().split(' ') as word, i (i)}
					{word}{#if i < m.world_title().split(' ').length - 1}<br />{/if}
				{/each}
			</h2>
			<div class="hud-divider"></div>
			<div class="hud-stats">
				<div class="hud-stat">
					<span class="hud-stat-label">{m.world_hud_total()}</span>
					<span class="hud-stat-value">{formatCount(totalVisitors)}</span>
				</div>
				{#if todayVisitors > 0}
					<div class="hud-stat">
						<span class="hud-stat-label">{m.world_hud_today()}</span>
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

		<!-- Top-right: Mode Toggle -->
		<div class="hud hud-top-right">
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

		<!-- Bottom-left: FPS & Face count -->
		<div class="hud hud-bottom-left">
			<span class="hud-meta">{engine.state.fps} FPS · {engine.state.faceCount} FACES</span>
		</div>

		<!-- Bottom-right: Instructions -->
		<div class="hud hud-bottom-right">
			<span class="hud-meta">{m.world_hud_instructions()}</span>
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
			<button class="detail-close" onclick={() => engine.closeDetailPanel()}>×</button>

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
	   FOLDED WORLD — Brutalist + Origami Aesthetics
	   ================================================ */

	.folded-world-container {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 100dvh;
		overflow: hidden;
		background: #f0f0f0;
		font-family: 'JetBrains Mono', 'Courier New', monospace;
	}

	:global(.dark) .folded-world-container {
		background: #0a0a0a;
	}

	.folded-world-canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		cursor: grab;
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
		z-index: 10;
		pointer-events: none;
	}

	.hud-top-left {
		top: 112px;
		left: 24px;
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

	/* --- Detail Panel --- */

	.detail-panel {
		position: absolute;
		right: 24px;
		top: 50%;
		transform: translateY(-50%);
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
			transform: translateY(-50%) translateX(20px);
		}
		to {
			opacity: 1;
			transform: translateY(-50%) translateX(0);
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
