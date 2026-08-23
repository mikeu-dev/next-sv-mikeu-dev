<script lang="ts">
	import { atlasStore } from '../core/AtlasState.svelte';
	import {
		Download,
		Mail,
		RotateCcw,
		ArrowRight,
		Terminal,
		ShieldCheck,
		MapPin,
		Compass
	} from '@lucide/svelte';

	interface Props {
		onRestart?: () => void;
	}

	let { onRestart }: Props = $props();
</script>

<div
	class="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-6 pt-24 pb-28 sm:p-12 sm:pt-28 sm:pb-32"
>
	<!-- Dynamic Story Narrative Card -->
	<div class="max-w-2xl transition-all duration-300">
		<!-- Scene Identifier Badge -->
		<div
			class="inline-flex items-center gap-2 rounded-xs border border-[#1e293b] bg-[#111620]/90 px-3 py-1 font-mono text-[9.5px] font-bold tracking-widest text-[#10b981] uppercase shadow-lg backdrop-blur-md"
		>
			<span class="flex size-1.5 rounded-full bg-[#10b981]"></span>
			<span>SPATIAL NARRATIVE</span>
			<span class="text-[#64748b]">•</span>
			<span class="text-[#38bdf8]"
				>CH 0{atlasStore.activeSceneIndex + 1}: {atlasStore.activeScene?.title ?? 'ARRIVAL'}</span
			>
		</div>

		<!-- Main Headline -->
		<h1
			class="mt-4 font-sans text-3xl font-extrabold tracking-tight text-[#f8fafc] sm:text-5xl sm:leading-none"
		>
			{atlasStore.activeBeatNarrative}
		</h1>

		<!-- Subtitle -->
		<p class="mt-3 font-mono text-xs tracking-wider text-[#94a3b8] uppercase sm:text-sm">
			{atlasStore.activeBeatSubtitle}
		</p>

		<!-- Scene 03 (Territories) Quick Domain Switcher Pill Matrix -->
		{#if atlasStore.activeSceneIndex === 2}
			<div
				class="pointer-events-auto mt-5 flex flex-wrap gap-2 font-mono text-[9px] font-bold uppercase"
			>
				<span class="rounded border border-[#10b981]/50 bg-[#10b981]/10 px-2.5 py-1 text-[#10b981]">
					[01. GEOSPATIAL GIS]
				</span>
				<span class="rounded border border-[#0ea5e9]/50 bg-[#0ea5e9]/10 px-2.5 py-1 text-[#0ea5e9]">
					[02. ENTERPRISE WMS]
				</span>
				<span class="rounded border border-[#8b5cf6]/50 bg-[#8b5cf6]/10 px-2.5 py-1 text-[#8b5cf6]">
					[03. VISION AI]
				</span>
				<span class="rounded border border-[#f59e0b]/50 bg-[#f59e0b]/10 px-2.5 py-1 text-[#f59e0b]">
					[04. DATA INFRA]
				</span>
			</div>
		{/if}

		<!-- Scene 06 (Horizon) Full Architectural Terminal Box -->
		{#if atlasStore.activeSceneIndex === 5 || atlasStore.globalProgress >= 0.88}
			<div
				class="pointer-events-auto mt-6 rounded-md border border-[#1e293b] bg-[#0a0d12]/95 p-5 shadow-2xl backdrop-blur-md"
			>
				<!-- Terminal Header Bar -->
				<div
					class="flex items-center justify-between border-b border-[#1e293b] pb-3 font-mono text-[9.5px] text-[#64748b]"
				>
					<div class="flex items-center gap-2 text-[#38bdf8]">
						<Terminal class="size-3.5" />
						<span class="font-bold">ATLAS://SYSTEM.TERMINAL.READY</span>
					</div>
					<div class="flex items-center gap-1 text-[#10b981]">
						<ShieldCheck class="size-3.5" />
						<span>AUTH_OK</span>
					</div>
				</div>

				<!-- Terminal Log Output -->
				<div class="mt-3 space-y-1 font-mono text-[10px] text-[#cbd5e1]">
					<p class="text-[#94a3b8]">&gt; USER SESSION: AUTHENTICATED [GUEST_EXPLORER]</p>
					<p class="text-[#94a3b8]">&gt; SPATIAL NODES VISITED: 6 / 6 (100% COVERAGE)</p>
					<p class="font-semibold text-[#10b981]">
						&gt; STATUS: READY FOR HIGH-SCALE SYSTEM INITIATIVES & SPATIAL ARCHITECTURE
					</p>
				</div>

				<!-- Direct Action Matrix -->
				<div class="mt-5 flex flex-wrap items-center gap-3">
					<a
						href="mailto:rikiruswandi28@gmail.com"
						class="flex items-center gap-2 rounded-xs border border-[#10b981] bg-[#10b981] px-4 py-2 font-mono text-xs font-bold text-[#0a0d12] transition-all hover:bg-[#10b981]/90"
					>
						<Mail class="size-3.5" />
						<span>INITIATE CONTACT</span>
						<ArrowRight class="size-3.5" />
					</a>

					<a
						href="/assets/resume/CV_Riki_Ruswandi.pdf"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-2 rounded-xs border border-[#1e293b] bg-[#161e2b] px-4 py-2 font-mono text-xs font-semibold text-[#f8fafc] transition-colors hover:border-[#38bdf8] hover:text-[#38bdf8]"
					>
						<Download class="size-3.5" />
						<span>DOWNLOAD DOSSIER (CV)</span>
					</a>

					{#if onRestart}
						<button
							onclick={onRestart}
							class="flex items-center gap-1.5 rounded-xs border border-[#1e293b] bg-[#111620] px-3 py-2 font-mono text-xs text-[#94a3b8] transition-colors hover:text-[#f8fafc]"
						>
							<RotateCcw class="size-3.5" />
							<span>REPLAY TRAJECTORY</span>
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<!-- Bottom Guidance Telemetry & Scroll Cue -->
	{#if atlasStore.globalProgress < 0.05}
		<div
			class="flex items-center gap-3 font-mono text-[10px] tracking-widest text-[#64748b] uppercase"
		>
			<span class="size-1.5 animate-pulse rounded-full bg-[#10b981]"></span>
			<span>SCROLL DOWNWARD TO INITIATE RECONNAISSANCE TRAJECTORY</span>
		</div>
	{/if}
</div>
