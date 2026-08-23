<script lang="ts">
	import { atlasStore } from '../core/AtlasState.svelte';
	import { ATLAS_SCENES } from '../narrative/manifest/scenes.manifest';
	import type { AtlasEngine } from '../core/AtlasEngine';

	interface Props {
		engine: AtlasEngine;
	}

	let { engine }: Props = $props();

	let mouseX = $state(500);
	let mouseY = $state(500);
	let isMouseActive = $state(false);

	function handleMouseMove(event: MouseEvent) {
		mouseX = event.clientX;
		mouseY = event.clientY;
		isMouseActive = true;
	}

	function handleMouseLeave() {
		isMouseActive = false;
	}
</script>

<svelte:window onmousemove={handleMouseMove} onmouseleave={handleMouseLeave} />

<!-- Tactical Cartographic Crosshair Reticle (Mouse Follower) -->
{#if isMouseActive}
	<div
		class="atlas-crosshair-reticle pointer-events-none fixed z-40 hidden sm:block"
		style={`left: ${mouseX}px; top: ${mouseY}px;`}
	>
		<!-- Crosshair Lines -->
		<div class="relative size-12 -translate-x-1/2 -translate-y-1/2">
			<!-- Horizontal axis -->
			<div class="absolute top-1/2 -left-3 h-px w-18 -translate-y-1/2 bg-[#38bdf8]/40"></div>
			<!-- Vertical axis -->
			<div class="absolute -top-3 left-1/2 h-18 w-px -translate-x-1/2 bg-[#38bdf8]/40"></div>
			<!-- Center Box -->
			<div class="absolute inset-3 rounded-xs border border-[#38bdf8]/70"></div>
			<!-- Telemetry Readout -->
			<div
				class="absolute top-8 left-8 flex flex-col rounded-xs border border-[#1e293b] bg-[#0a0d12]/90 px-1.5 py-0.5 font-mono text-[8px] tracking-wider text-[#38bdf8] uppercase backdrop-blur-xs"
			>
				<span>X: {mouseX}</span>
				<span>Y: {mouseY}</span>
			</div>
		</div>
	</div>
{/if}

<!-- HUD Top Telemetry Bar -->
<header
	class="pointer-events-none fixed top-0 right-0 left-0 z-30 flex items-center justify-between border-b border-[#1e293b]/70 bg-[#0a0d12]/85 px-4 py-3 backdrop-blur-md sm:px-8"
>
	<!-- Left Telemetry: Coordinate Beacon & Location Anchor -->
	<div class="flex items-center gap-3">
		<div class="flex size-2.5 items-center justify-center">
			<span class="size-2.5 animate-ping rounded-full bg-[#10b981] opacity-75"></span>
			<span class="absolute size-1.5 rounded-full bg-[#10b981]"></span>
		</div>
		<div class="flex flex-col">
			<span class="font-mono text-[11px] font-bold tracking-widest text-[#f8fafc] uppercase">
				{atlasStore.formattedCoordinates}
			</span>
			<span class="font-mono text-[8.5px] tracking-wider text-[#64748b] uppercase">
				SYS_ANCHOR: KAB_PURWAKARTA • ZOOM: {atlasStore.camera.zoom.toFixed(2)}x
			</span>
		</div>
	</div>

	<!-- Right Telemetry: Scale Bar Graphic & Status Tag -->
	<div
		class="hidden items-center gap-6 font-mono text-[10px] tracking-widest text-[#94a3b8] uppercase sm:flex"
	>
		<!-- Dynamic Graphic Scale Bar -->
		<div class="flex flex-col items-end gap-1">
			<div class="flex items-center gap-1">
				<span class="h-2 w-px bg-[#94a3b8]"></span>
				<span class="h-px w-14 bg-[#94a3b8]"></span>
				<span class="h-2 w-px bg-[#94a3b8]"></span>
				<span class="pl-1 text-[9px] font-bold text-[#f8fafc]">{atlasStore.altitudeMeters}M</span>
			</div>
			<span class="text-[8px] text-[#64748b]">SCALE {atlasStore.scaleLabel}</span>
		</div>

		<!-- System Operational Status Badge -->
		<div
			class="flex items-center gap-1.5 rounded-xs border border-[#10b981]/40 bg-[#111620] px-2.5 py-1 text-[9px] font-bold text-[#10b981]"
		>
			<span class="size-1.5 rounded-full bg-[#10b981]"></span>
			<span>SYS_READY</span>
		</div>
	</div>
</header>

<!-- HUD Bottom Master Progress Rail -->
<footer
	class="pointer-events-none fixed right-0 bottom-0 left-0 z-30 flex flex-col border-t border-[#1e293b]/70 bg-[#0a0d12]/90 px-4 py-3 backdrop-blur-md sm:px-8"
>
	<!-- Chapter Milestones Header -->
	<div
		class="flex items-center justify-between pb-2 font-mono text-[10px] tracking-wider uppercase"
	>
		<div class="flex items-center gap-2">
			<span class="font-bold text-[#38bdf8]">
				CH 0{atlasStore.activeSceneIndex + 1}:
			</span>
			<span class="font-bold text-[#f8fafc]">
				{atlasStore.activeScene?.title ?? 'ARRIVAL'}
			</span>
		</div>
		<span class="font-bold text-[#64748b]">
			PROGRESS: <span class="text-[#f8fafc]">{Math.round(atlasStore.globalProgress * 100)}%</span>
		</span>
	</div>

	<!-- Linear Progress Bar -->
	<div class="relative h-1.5 w-full overflow-hidden rounded-full bg-[#1e293b]">
		<div
			class="h-full bg-linear-to-r from-[#10b981] via-[#0ea5e9] to-[#8b5cf6] transition-all duration-75"
			style={`width: ${Math.round(atlasStore.globalProgress * 100)}%`}
		></div>
	</div>

	<!-- Quick Chapter Jump Navigation Matrix -->
	<div
		class="pointer-events-auto mt-2.5 flex items-center justify-between font-mono text-[8.5px] text-[#64748b]"
	>
		{#each ATLAS_SCENES as scene, idx (scene.id)}
			<button
				onclick={() => engine.focusAnchor(scene.cameraTarget, scene.cameraTarget.zoom)}
				class={`transition-all duration-200 hover:text-[#f8fafc] ${
					atlasStore.activeSceneIndex === idx
						? 'border-b border-[#10b981] font-bold text-[#10b981]'
						: 'opacity-70 hover:opacity-100'
				}`}
			>
				0{idx + 1}. {scene.title}
			</button>
		{/each}
	</div>
</footer>
