<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * Map-band page header: an isometric basemap with 3D buildings rising in,
	 * and a floating white card holding the page title. Leaves room at the top
	 * for the absolutely-positioned navbar.
	 */
	let {
		eyebrow,
		title,
		lead,
		focus = '50% 50%',
		children,
		aside
	}: {
		eyebrow: string;
		title: string;
		lead?: string;
		/** object-position of the basemap, to vary the view per page */
		focus?: string;
		children?: Snippet;
		/** optional second card next to the title card */
		aside?: Snippet;
	} = $props();
</script>

<header class="relative overflow-hidden bg-secondary pt-24 pb-10 sm:pt-28">
	<img
		src="/images/map/band-basemap.svg"
		alt=""
		aria-hidden="true"
		class="map-art absolute inset-0 block size-full object-cover"
		style="object-position: {focus}"
	/>
	<img
		src="/images/map/band-buildings.svg"
		alt=""
		aria-hidden="true"
		class="map-art map-rise absolute inset-0 block size-full object-cover"
		style="object-position: {focus}; animation-delay: .3s"
	/>
	<div class="relative mx-[clamp(16px,4vw,56px)] mt-4 flex flex-wrap items-stretch gap-5 sm:mt-10">
		<div
			class="flex max-w-[760px] flex-[1_1_520px] flex-col gap-4 rounded-[32px] border border-border bg-card p-[clamp(24px,3vw,40px)] shadow-card"
		>
			<p class="eyebrow">{eyebrow}</p>
			<h1
				class="m-0 text-[clamp(40px,5vw,68px)] leading-[1.02] font-black tracking-[-0.03em] text-foreground"
			>
				{title}
			</h1>
			{#if lead}
				<p class="m-0 text-lg leading-relaxed text-ink-soft">{lead}</p>
			{/if}
			{@render children?.()}
		</div>
		{@render aside?.()}
	</div>
</header>
