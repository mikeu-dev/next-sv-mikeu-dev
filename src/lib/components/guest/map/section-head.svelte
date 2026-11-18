<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		id,
		eyebrow,
		title,
		lead,
		children
	}: {
		id: string;
		eyebrow?: string;
		title: string;
		lead?: string;
		/** right-hand action (button / link) */
		children?: Snippet;
	} = $props();
</script>

<div class="map-reveal mb-10 flex flex-wrap items-end justify-between gap-5">
	<div class="flex max-w-[720px] flex-col gap-3.5">
		{#if eyebrow}<p class="eyebrow">{eyebrow}</p>{/if}
		<h2
			{id}
			class="m-0 text-[clamp(34px,4.2vw,58px)] leading-[1.05] font-black tracking-[-0.025em]"
		>
			{title}
		</h2>
		{#if lead}<p class="m-0 text-[17px] leading-relaxed text-ink-soft">{lead}</p>{/if}
	</div>
	{@render children?.()}
</div>
