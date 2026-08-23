<script lang="ts">
	import { atlasStore } from '../core/AtlasState.svelte';
	import { X, ExternalLink, MapPin, Calendar, Layers, CheckCircle2 } from '@lucide/svelte';

	function handleEvidenceClick(evidenceId: string) {
		if (atlasStore.activeProject) {
			const found = atlasStore.activeProject.evidence.find((e) => e.id === evidenceId);
			if (found) {
				atlasStore.closeProject();
				atlasStore.openEvidence(found);
			}
		}
	}
</script>

{#if atlasStore.isProjectCardOpen && atlasStore.activeProject}
	<!-- Backdrop Blur overlay -->
	<div
		class="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs transition-opacity duration-300"
		onclick={() => atlasStore.closeProject()}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && atlasStore.closeProject()}
	></div>

	<!-- Project Card Dialog (Cartographic Blueprint Theme) -->
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
		<div
			class="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-md border border-[#1e293b] bg-[#0f141d] text-[#f8fafc] shadow-2xl"
		>
			<!-- Top Accent Stripe based on Territory Domain -->
			<div
				class={`h-1.5 w-full ${
					atlasStore.activeProject.domain === 'gis'
						? 'bg-[#10b981]'
						: atlasStore.activeProject.domain === 'erp'
							? 'bg-[#0ea5e9]'
							: 'bg-[#8b5cf6]'
				}`}
			></div>

			<!-- Card Header -->
			<div class="flex items-start justify-between border-b border-[#1e293b] p-6 pb-4">
				<div class="flex flex-col">
					<div
						class="flex items-center gap-2 font-mono text-[9px] font-bold tracking-widest text-[#38bdf8] uppercase"
					>
						<span class="rounded border border-[#1e293b] bg-[#111620] px-2 py-0.5">
							DOM: {atlasStore.activeProject.domain.toUpperCase()}
						</span>
						<span class="text-[#64748b]">•</span>
						<span class="flex items-center gap-1 text-[#94a3b8]">
							<Calendar class="size-3" />
							{atlasStore.activeProject.year}
						</span>
					</div>

					<h2 class="mt-2 font-sans text-2xl font-bold tracking-tight text-[#f8fafc]">
						{atlasStore.activeProject.title}
					</h2>

					<p class="mt-1 font-mono text-xs text-[#94a3b8]">
						{atlasStore.activeProject.tagLine}
					</p>
				</div>

				<button
					onclick={() => atlasStore.closeProject()}
					class="rounded-md border border-[#1e293b] bg-[#161e2b] p-2 text-[#94a3b8] transition-colors hover:border-[#38bdf8] hover:text-[#f8fafc]"
					aria-label="Close project modal"
				>
					<X class="size-4" />
				</button>
			</div>

			<!-- Card Body -->
			<div class="max-h-[65vh] overflow-y-auto p-6">
				<!-- Client & Geographic Base Info -->
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div class="rounded border border-[#1e293b] bg-[#111620] p-3">
						<span class="font-mono text-[8.5px] font-bold tracking-wider text-[#64748b] uppercase"
							>CLIENT / PARTNER</span
						>
						<p class="mt-0.5 font-mono text-xs font-semibold text-[#f8fafc]">
							{atlasStore.activeProject.clientOrOrg}
						</p>
					</div>
					<div class="rounded border border-[#1e293b] bg-[#111620] p-3">
						<span class="font-mono text-[8.5px] font-bold tracking-wider text-[#64748b] uppercase"
							>SPATIAL ANCHOR</span
						>
						<p
							class="mt-0.5 flex items-center gap-1 font-mono text-xs font-semibold text-[#10b981]"
						>
							<MapPin class="size-3" />
							{atlasStore.activeProject.location.label}
						</p>
					</div>
				</div>

				<!-- Tech Stack Matrix -->
				<div class="mt-5">
					<div
						class="flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-widest text-[#64748b] uppercase"
					>
						<Layers class="size-3 text-[#38bdf8]" />
						<span>TECHNOLOGY STACK ARCHITECTURE</span>
					</div>
					<div class="mt-2.5 flex flex-wrap gap-1.5">
						{#each atlasStore.activeProject.stack as tech (tech)}
							<span
								class="rounded border border-[#1e293b] bg-[#161e2b] px-2.5 py-1 font-mono text-[10px] text-[#cbd5e1]"
							>
								{tech}
							</span>
						{/each}
					</div>
				</div>

				<!-- Evidence Artifacts List -->
				<div class="mt-6">
					<div
						class="flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-widest text-[#10b981] uppercase"
					>
						<CheckCircle2 class="size-3" />
						<span>ATTACHED PRODUCTION EVIDENCE ({atlasStore.activeProject.evidence.length})</span>
					</div>

					<div class="mt-3 space-y-2.5">
						{#each atlasStore.activeProject.evidence as ev (ev.id)}
							<div
								class="flex items-center justify-between rounded border border-[#1e293b] bg-[#111620] p-3.5 transition-all hover:border-[#10b981]/50"
							>
								<div class="flex flex-col">
									<span class="font-sans text-sm font-semibold text-[#f8fafc]">{ev.title}</span>
									<span class="font-mono text-[9px] text-[#64748b]">
										{ev.artifacts.length} Verified Artifacts (Metrics & Code Snippets)
									</span>
								</div>

								<button
									onclick={() => handleEvidenceClick(ev.id)}
									class="flex items-center gap-1 rounded border border-[#10b981]/60 bg-[#10b981]/10 px-3 py-1.5 font-mono text-[10px] font-bold text-[#10b981] transition-colors hover:bg-[#10b981] hover:text-[#0a0d12]"
								>
									<span>INSPECT</span>
									<ExternalLink class="size-3" />
								</button>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Card Footer -->
			<div
				class="flex items-center justify-between border-t border-[#1e293b] bg-[#0a0d12] px-6 py-3.5 font-mono text-[9px] text-[#64748b]"
			>
				<span>ATLAS PROJECT DNA // ID: {atlasStore.activeProject.id}</span>
				<button
					onclick={() => atlasStore.closeProject()}
					class="font-bold text-[#f8fafc] hover:underline"
				>
					[CLOSE DIALOG]
				</button>
			</div>
		</div>
	</div>
{/if}
