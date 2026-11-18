<script lang="ts">
	import type { JourneyItem } from '#lib/types.js';
	import { m } from '#lib/paraglide/messages.js';

	/**
	 * Career timeline drawn as a dashed route: the newest stop is the blue
	 * "you are here" pin, earlier stops are orange waypoints.
	 * Ordered newest-first: ongoing roles ("now", "sekarang", "present") lead,
	 * then by the latest year mentioned.
	 */
	let { items = [] }: { items?: JourneyItem[] } = $props();

	const ONGOING = /now|present|sekarang|kini|current/i;
	function rank(item: JourneyItem): number {
		const years = (String(item.year).match(/\d{4}/g) || []).map(Number);
		return (ONGOING.test(String(item.year)) ? 10_000 : 0) + Math.max(0, ...years);
	}
	let ordered = $derived(
		items
			.map((item, i) => ({ item, i }))
			.sort((a, b) => rank(b.item) - rank(a.item) || a.i - b.i)
			.map((x) => x.item)
	);
</script>

<ol class="relative m-0 flex list-none flex-col gap-[18px] p-0">
	{#if ordered.length > 1}
		<li
			aria-hidden="true"
			class="absolute top-6 bottom-6 left-[23px] w-0 border-l-4 border-dashed border-route"
		></li>
	{/if}
	{#each ordered as item, i (i)}
		{@const current = i === 0}
		<li class="relative flex items-start gap-[18px]">
			{#if current}
				<span
					class="flex size-[50px] flex-none items-center justify-center rounded-full border-4 border-background bg-primary"
				>
					<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
						<path
							d="M10 2c-3.6 0-6.5 2.8-6.5 6.4C3.5 13 10 18 10 18s6.5-5 6.5-9.6C16.5 4.8 13.6 2 10 2z"
							fill="#FFFFFF"
						/>
					</svg>
				</span>
			{:else}
				<span
					class="box-border flex size-[50px] flex-none items-center justify-center rounded-full border-4 border-route bg-card"
				>
					<span class="size-3 rounded-full bg-route"></span>
				</span>
			{/if}
			<div
				class="flex flex-1 flex-col gap-2 rounded-3xl bg-card px-6 py-5 {current
					? 'border-[1.5px] border-primary'
					: 'border border-border'}"
			>
				<span
					class="font-mono text-[13px] font-semibold {current
						? 'text-primary'
						: 'text-muted-foreground'}"
				>
					{item.year}
					{#if current}· {m.gis_journey_current()}{:else if i === ordered.length - 1}
						· {m.gis_journey_start()}{/if}
				</span>
				<h3 class="m-0 text-[22px] font-black">{item.title}</h3>
				<p class="m-0 text-base leading-relaxed text-ink-soft">{item.description}</p>
			</div>
		</li>
	{/each}
</ol>
