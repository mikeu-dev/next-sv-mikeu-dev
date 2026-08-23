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

	function handleMouseMove(event: MouseEvent) {
		mouseX = event.clientX;
		mouseY = event.clientY;
	}
</script>

<svelte:window onmousemove={handleMouseMove} />

<!-- HUD Top Telemetry Bar -->
<header
	class="pointer-events-none fixed top-0 right-0 left-0 z-30 flex items-center justify-between border-b border-[#1e293b]/60 bg-[#0a0d12]/80 px-4 py-3 backdrop-blur-md sm:px-8"
>
	<!-- Left Telemetry: Coordinate Beacon -->
	<div class="flex items-center gap-3">
		<div class="flex size-2 items-center justify-center">
			<span class="size-2 animate-ping rounded-full bg-[#10b981] opacity-75"></span>
			<span class="absolute size-1.5 rounded-full bg-[#10b981]"></span>
		</div>
		<div class="flex flex-col">
			<span class="font-mono text-[11px] font-bold tracking-widest text-[#f8fafc] uppercase">
				{atlasStore.formattedCoordinates}
			</span>
			<span class="font-mono text-[9px] tracking-wider text-[#64748b] uppercase">
				SYS_LOC: PURWAKARTA_ANCHOR • ZOOM: {atlasStore.camera.zoom.toFixed(2)}x
			</span>
		</div>
	</div>

	<!-- Right Telemetry: Scale & Altitude -->
	<div
		class="hidden items-center gap-6 font-mono text-[10px] tracking-widest text-[#94a3b8] uppercase sm:flex"
	>
		<div class="flex items-center gap-2">
			<span class="text-[#64748b]">ALT:</span>
			<span class="font-bold text-[#f8fafc]">{atlasStore.altitudeMeters}M</span>
		</div>
		<div class="flex items-center gap-2">
			<span class="text-[#64748b]">SCALE:</span>
			<span class="font-bold text-[#f8fafc]">{atlasStore.scaleLabel}</span>
		</div>
		<div
			class="border border-[#1e293b] bg-[#111620] px-2.5 py-1 text-[9px] font-bold text-[#10b981]"
		>
			[STATUS: ACTIVE]
		</div>
	</div>
</header>

<!-- HUD Bottom Master Progress Rail -->
<footer
	class="pointer-events-none fixed right-0 bottom-0 left-0 z-30 flex flex-col border-t border-[#1e293b]/60 bg-[#0a0d12]/85 px-4 py-3 backdrop-blur-md sm:px-8"
>
	<!-- Chapter Milestones Bar -->
	<div
		class="flex items-center justify-between pb-2 font-mono text-[10px] tracking-wider uppercase"
	>
		<div class="flex items-center gap-2">
			<span class="font-bold text-[#38bdf8]">
				CH {atlasStore.activeSceneIndex + 1}:
			</span>
			<span class="text-[#f8fafc]">
				{atlasStore.activeScene?.title ?? 'ARRIVAL'}
			</span>
		</div>
		<span class="text-[#64748b]">
			PROGRESS: {Math.round(atlasStore.globalProgress * 100)}%
		</span>
	</div>

	<!-- Linear Progress Bar with Scene Markers -->
	<div class="relative h-1.5 w-full overflow-hidden rounded-full bg-[#1e293b]">
		<div
			class="h-full bg-gradient-to-r from-[#10b981] via-[#0ea5e9] to-[#8b5cf6] transition-all duration-75"
			style={`width: ${Math.round(atlasStore.globalProgress * 100)}%`}
		></div>
	</div>

	<!-- Chapter Indicators -->
	<div
		class="pointer-events-auto mt-2 flex items-center justify-between font-mono text-[8.5px] text-[#64748b]"
	>
		{#each ATLAS_SCENES as scene, idx (scene.id)}
			<button
				onclick={() => engine.focusAnchor(scene.cameraTarget, scene.cameraTarget.zoom)}
				class={`transition-colors hover:text-[#f8fafc] ${
					atlasStore.activeSceneIndex === idx ? 'font-bold text-[#10b981]' : ''
				}`}
			>
				0{idx + 1}. {scene.title}
			</button>
		{/each}
	</div>
</footer>
