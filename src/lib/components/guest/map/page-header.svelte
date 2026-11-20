<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * Page header: a full-bleed map scene (inline SVG, so its labels use the
	 * site's fonts) with a folder-tab title card floating over it. Leaves room
	 * at the top for the absolutely positioned navbar.
	 */
	let {
		eyebrow,
		title,
		lead,
		scene,
		children,
		aside
	}: {
		eyebrow: string;
		title: string;
		lead?: string;
		/** raw SVG markup of the header illustration (trusted, from src/lib/assets/scenes) */
		scene?: string;
		children?: Snippet;
		/** optional second card next to the title card */
		aside?: Snippet;
	} = $props();
</script>

<header class="relative overflow-hidden bg-well pt-[88px] pb-10 sm:pt-24">
	{#if scene}
		<div
			aria-hidden="true"
			class="map-art absolute inset-0 overflow-hidden bg-[#dcdad4] [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- static SVG bundled with the app -->
			{@html scene}
		</div>
	{/if}
	<div class="relative mx-[clamp(16px,4vw,56px)] mt-6 flex flex-wrap items-stretch gap-5 sm:mt-10">
		<div class="shard flex max-w-[760px] min-w-0 flex-[1_1_520px] flex-col">
			<p class="tab tab-r eyebrow flex h-[50px] items-center self-start px-[22px] text-sm">
				{eyebrow}
			</p>
			<div
				class="flex flex-1 flex-col gap-4 rounded-[0_34px_34px_34px] bg-card p-[clamp(24px,3vw,40px)]"
			>
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
		</div>
		{@render aside?.()}
	</div>
</header>
