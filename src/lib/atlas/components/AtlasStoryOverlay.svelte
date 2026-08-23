<script lang="ts">
	import { atlasStore } from '../core/AtlasState.svelte';
	import { Download, Mail, RotateCcw, ArrowRight } from '@lucide/svelte';

	interface Props {
		onRestart?: () => void;
	}

	let { onRestart }: Props = $props();
</script>

<div
	class="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-6 pt-24 pb-28 sm:p-12 sm:pt-28 sm:pb-32"
>
	<!-- Dynamic Story Narrative Card -->
	<div class="max-w-xl transition-all duration-300">
		<div
			class="inline-flex items-center gap-2 rounded-xs border border-[#1e293b] bg-[#111620]/90 px-3 py-1 font-mono text-[9.5px] font-bold tracking-widest text-emerald uppercase shadow-lg backdrop-blur-md"
		>
			<span class="flex size-1.5 rounded-full bg-emerald"></span>
			<span>SPATIAL NARRATIVE</span>
			<span class="text-[#64748b]">•</span>
			<span class="text-[#38bdf8]"
				>SCENE 0{atlasStore.activeSceneIndex + 1}: {atlasStore.activeScene?.title ??
					'ARRIVAL'}</span
			>
		</div>

		<h1
			class="mt-4 font-sans text-3xl font-extrabold tracking-tight text-background sm:text-5xl sm:leading-none"
		>
			{atlasStore.activeBeatNarrative}
		</h1>

		<p class="mt-3 font-mono text-xs tracking-wider text-[#94a3b8] uppercase sm:text-sm">
			{atlasStore.activeBeatSubtitle}
		</p>

		<!-- Scene 06 (Horizon) Interactive Actions Terminal -->
		{#if atlasStore.activeSceneIndex === 5 || atlasStore.globalProgress >= 0.88}
			<div class="pointer-events-auto mt-6 flex flex-wrap items-center gap-3">
				<a
					href="mailto:rikiruswandi28@gmail.com"
					class="flex items-center gap-2 rounded-xs border border-emerald bg-emerald/15 px-4 py-2 font-mono text-xs font-bold text-emerald transition-all hover:bg-emerald hover:text-[#0a0d12]"
				>
					<Mail class="size-3.5" />
					<span>INITIATE CONTACT</span>
					<ArrowRight class="size-3.5" />
				</a>

				<a
					href="/assets/resume/CV_Riki_Ruswandi.pdf"
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center gap-2 rounded-xs border border-[#1e293b] bg-[#161e2b] px-4 py-2 font-mono text-xs font-semibold text-background transition-colors hover:border-[#38bdf8] hover:text-[#38bdf8]"
				>
					<Download class="size-3.5" />
					<span>DOWNLOAD DOSSIER (CV)</span>
				</a>

				{#if onRestart}
					<button
						onclick={onRestart}
						class="flex items-center gap-1.5 rounded-xs border border-[#1e293b] bg-[#111620] px-3 py-2 font-mono text-xs text-[#94a3b8] transition-colors hover:text-background"
					>
						<RotateCcw class="size-3.5" />
						<span>REPLAY</span>
					</button>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Initial Guidance Telemetry & Scroll Cue -->
	{#if atlasStore.globalProgress < 0.05}
		<div
			class="flex items-center gap-3 font-mono text-[10px] tracking-widest text-[#64748b] uppercase"
		>
			<span class="size-1.5 animate-pulse rounded-full bg-emerald"></span>
			<span>SCROLL DOWNWARD TO INITIATE RECONNAISSANCE TRAJECTORY</span>
		</div>
	{/if}
</div>
