<script lang="ts">
	import { ArrowUpRight } from '@lucide/svelte';
	import type { LocalizedProject } from '$lib/utils/project-mapper';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { optimizeImage } from '$lib/utils/image.util';
	import { randomOrigamiClipPath } from '$lib/utils/origami-shape';

	let { project, index }: { project: LocalizedProject; index: number } = $props();

	// Deterministic bento rhythm: every 3rd tile is a wide feature tile — at both the
	// 2-col (sm) and 3-col (lg) grid, a span-2 tile plus the following span-1 tile(s)
	// tile evenly into full rows, so no dense-packing gaps appear. All tiles share the
	// same row height (set by the grid container's auto-rows) and stretch to fill it,
	// so the gap between rows stays visually identical everywhere.
	const isFeature = $derived(index % 3 === 0);
	const primaryTag = $derived(project.tags?.[0]?.name);

	// Every tile gets its own torn-paper silhouette instead of a uniform stamped
	// corner cut — seeded off the project id so it's stable across SSR/hydration
	// and doesn't reshuffle on every re-render. Feature tiles are pinned to the
	// "notch" family: a whole-edge skew is a percentage of that edge's own
	// length, so on a 2-column-wide tile it turns into a much bigger pixel
	// shift than on a square one and can slice into the title/caption text.
	const tileClipPath = $derived(
		randomOrigamiClipPath(project.id, isFeature ? { family: 'notch' } : {})
	);
	const badgeClipPath = $derived(
		randomOrigamiClipPath(`${project.id}-badge`, {
			minCut: 10,
			maxCut: 22,
			sharpChance: 0,
			family: 'notch'
		})
	);
</script>

<!-- The hard offset "shadow" has to live on a sibling, not a child of the clipped
     article — clip-path clips a box's entire subtree (including filter/box-shadow
     and any child that pokes past its edges) to its own polygon, so a shadow tied
     to the article itself gets silently clipped away too. -->
<div class="work-item group relative h-full {isFeature ? 'sm:col-span-2' : ''}">
	<div
		class="pointer-events-none absolute inset-0 bg-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100"
		style="clip-path: {tileClipPath}; transform: translate(6px, 6px);"
	></div>

	<article
		class="relative h-full overflow-hidden border-2 border-foreground/15 bg-muted transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1"
		style="clip-path: {tileClipPath};"
	>
		<a href={localizeHref(`/projects/${project.slug}`)} class="absolute inset-0">
			{#if project.thumbnailUrl}
				<img
					src={optimizeImage(project.thumbnailUrl, { width: 900, quality: 75 })}
					alt={project.title}
					class="h-full w-full object-cover grayscale transition-all duration-500 ease-out group-hover:scale-105 group-hover:grayscale-0"
					loading="lazy"
				/>
			{/if}

			<!-- Bottom gradient scrim for caption legibility -->
			<div
				class="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/80 via-black/10 to-transparent"
			></div>

			<!-- Arrow badge -->
			<div
				class="absolute top-4 right-4 flex size-9 items-center justify-center border border-white/40 bg-white/10 text-white backdrop-blur-md transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
				style="clip-path: {badgeClipPath};"
			>
				<ArrowUpRight class="size-4" />
			</div>

			<!-- Caption -->
			<div class="absolute inset-x-0 bottom-0 z-10 p-5">
				<span class="font-mono text-[10px] text-white/60">{String(index + 1).padStart(2, '0')}</span
				>
				<h3 class="font-poppins text-xl font-bold tracking-tight text-white sm:text-2xl">
					{project.title}
				</h3>
				{#if primaryTag}
					<p class="mt-1 font-mono text-xs tracking-wide text-white/70 uppercase">{primaryTag}</p>
				{/if}
			</div>
		</a>
	</article>
</div>
