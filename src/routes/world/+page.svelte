<script lang="ts">
	import type { PageData } from './$types';
	import { m } from '#lib/paraglide/messages.js';
	import SEO from '#lib/components/seo/seo.svelte';

	let { data }: { data: PageData } = $props();
</script>

<SEO title={m.gis_world_title()} description={m.world_description()} />

<div class="relative h-dvh min-h-[640px] bg-background">
	{#await import('#lib/components/guest/sections/world/folded-world.svelte')}
		<div class="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
			<div
				class="size-14 animate-spin rounded-full border-[3px] border-border border-t-primary motion-reduce:animate-none"
			></div>
			<p class="m-0 font-mono text-[13px] font-semibold text-primary">{m.world_loading()}</p>
			<p class="m-0 text-sm text-muted-foreground">{m.world_loading_engine()}</p>
		</div>
	{:then module}
		<module.default
			nodes={data.geoNodes}
			totalVisitors={data.stats.total}
			todayVisitors={data.stats.today}
		/>
	{:catch}
		<!-- Fallback for devices that can't load Three.js -->
		<div class="mx-auto flex h-full max-w-[720px] flex-col justify-center gap-5 px-6 pt-24">
			<p class="eyebrow">{m.gis_world_eyebrow()}</p>
			<h1 class="m-0 text-[clamp(40px,5vw,64px)] leading-none font-black tracking-[-0.03em]">
				{m.gis_world_title()}
			</h1>
			<p class="m-0 font-mono text-sm text-muted-foreground">
				{data.stats.total.toLocaleString()} · {m.gis_world_locations({
					count: data.geoNodes.length
				})}
			</p>
			<div class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
				{#each data.geoNodes.slice(0, 12) as node (node.id)}
					<div
						class="flex items-center justify-between rounded-2xl border border-border bg-card px-3.5 py-2.5"
					>
						<span class="text-sm font-bold">{node.city ? `${node.city}, ` : ''}{node.country}</span>
						<span class="font-mono text-sm font-semibold text-primary">{node.count}</span>
					</div>
				{/each}
			</div>
		</div>
	{/await}
</div>
