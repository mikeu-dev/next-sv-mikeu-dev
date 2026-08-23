<script lang="ts">
	import { atlasStore } from '../core/AtlasState.svelte';
	import { X, Code2, Gauge, CheckCircle2 } from '@lucide/svelte';
</script>

{#if atlasStore.isEvidenceDrawerOpen && atlasStore.activeEvidence}
	<!-- Backdrop Blur overlay -->
	<div
		class="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
		onclick={() => atlasStore.closeEvidence()}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && atlasStore.closeEvidence()}
	></div>

	<!-- Slide-over Drawer Panel -->
	<aside
		class="fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-xl flex-col border-l border-[#1e293b] bg-[#0f141d] p-6 text-[#f8fafc] shadow-2xl transition-transform duration-300 sm:p-8"
	>
		<!-- Drawer Header -->
		<div class="flex items-center justify-between border-b border-[#1e293b] pb-4">
			<div class="flex flex-col">
				<div
					class="flex items-center gap-2 font-mono text-[9px] font-bold tracking-widest text-[#10b981] uppercase"
				>
					<CheckCircle2 class="size-3.5" />
					<span>EVIDENCE ARTIFACT VERIFIED</span>
				</div>
				<h2 class="mt-1 font-sans text-xl font-bold tracking-tight text-[#f8fafc]">
					{atlasStore.activeEvidence.title}
				</h2>
			</div>

			<button
				onclick={() => atlasStore.closeEvidence()}
				class="rounded-md border border-[#1e293b] bg-[#161e2b] p-2 text-[#94a3b8] transition-colors hover:border-[#38bdf8] hover:text-[#f8fafc]"
				aria-label="Close evidence drawer"
			>
				<X class="size-4" />
			</button>
		</div>

		<!-- Drawer Body -->
		<div class="flex-1 overflow-y-auto pt-6 pr-1">
			{#each atlasStore.activeEvidence.artifacts as artifact (artifact.id)}
				<div class="mb-6 rounded-md border border-[#1e293b] bg-[#111620] p-5">
					<div class="flex items-center justify-between">
						<span class="font-mono text-[10px] font-bold tracking-widest text-[#38bdf8] uppercase">
							ARTIFACT #{artifact.id}
						</span>
						<span
							class="rounded bg-[#1e293b] px-2 py-0.5 font-mono text-[8px] font-bold text-[#94a3b8] uppercase"
						>
							{artifact.type}
						</span>
					</div>

					<h3 class="mt-2 font-sans text-base font-bold text-[#f8fafc]">
						{artifact.title}
					</h3>

					<p class="mt-2 font-sans text-sm leading-relaxed text-[#94a3b8]">
						{artifact.summary}
					</p>

					<!-- Metric Display if present -->
					{#if artifact.metricValue}
						<div
							class="mt-4 flex items-center gap-3 rounded border border-[#1e293b] bg-[#161e2b] p-3"
						>
							<Gauge class="size-5 text-[#10b981]" />
							<div class="flex flex-col">
								<span class="font-mono text-lg font-extrabold text-[#10b981]">
									{artifact.metricValue}
								</span>
								<span class="font-mono text-[9px] tracking-wider text-[#64748b] uppercase">
									{artifact.metricLabel ?? 'VERIFIED BENCHMARK'}
								</span>
							</div>
						</div>
					{/if}

					<!-- Code Snippet Display if present -->
					{#if artifact.contentSnippet}
						<div class="mt-4 overflow-hidden rounded border border-[#1e293b] bg-[#0a0d12]">
							<div
								class="flex items-center justify-between border-b border-[#1e293b] px-3 py-1.5 font-mono text-[9px] text-[#64748b]"
							>
								<div class="flex items-center gap-1.5">
									<Code2 class="size-3 text-[#38bdf8]" />
									<span>{artifact.language ?? 'SOURCE'}</span>
								</div>
								<span>READ-ONLY</span>
							</div>
							<pre class="overflow-x-auto p-3 font-mono text-xs text-[#cbd5e1]"><code
									>{artifact.contentSnippet}</code
								></pre>
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Drawer Footer -->
		<div class="border-t border-[#1e293b] pt-4">
			<button
				onclick={() => atlasStore.closeEvidence()}
				class="w-full rounded border border-[#10b981] bg-[#10b981]/10 py-2.5 font-mono text-xs font-bold tracking-widest text-[#10b981] uppercase transition-colors hover:bg-[#10b981] hover:text-[#0a0d12]"
			>
				RETURN TO SPATIAL RECONNAISSANCE
			</button>
		</div>
	</aside>
{/if}
