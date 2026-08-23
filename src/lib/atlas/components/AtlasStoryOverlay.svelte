<script lang="ts">
	import { atlasStore } from '../core/AtlasState.svelte';
</script>

<div
	class="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-6 pt-24 pb-28 sm:p-12 sm:pt-28 sm:pb-32"
>
	<!-- Dynamic Story Narrative Card -->
	<div class="max-w-xl">
		<div
			class="inline-flex items-center gap-2 border border-[#1e293b] bg-[#111620]/90 px-3 py-1 font-mono text-[9.5px] font-bold tracking-widest text-[#10b981] uppercase shadow-lg backdrop-blur-md"
		>
			<span>● SPATIAL NARRATIVE</span>
			<span class="text-[#64748b]">•</span>
			<span class="text-[#94a3b8]">SCENE 0{atlasStore.activeSceneIndex + 1}</span>
		</div>

		<h1
			class="mt-4 font-sans text-3xl font-extrabold tracking-tight text-[#f8fafc] sm:text-5xl sm:leading-none"
		>
			{atlasStore.activeBeatNarrative}
		</h1>

		<p class="mt-3 font-mono text-xs tracking-wider text-[#94a3b8] uppercase sm:text-sm">
			{atlasStore.activeBeatSubtitle}
		</p>
	</div>

	<!-- Subtle Scroll Instruction Hint on Initial Landing -->
	{#if atlasStore.globalProgress < 0.05}
		<div
			class="flex items-center gap-3 font-mono text-[10px] tracking-widest text-[#64748b] uppercase"
		>
			<span class="size-1.5 animate-pulse rounded-full bg-[#10b981]"></span>
			<span>SCROLL TO INITIATE RECONNAISSANCE TRAJECTORY</span>
		</div>
	{/if}
</div>
