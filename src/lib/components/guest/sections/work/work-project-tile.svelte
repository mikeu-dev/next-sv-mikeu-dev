<script lang="ts">
	import { ArrowUpRight } from '@lucide/svelte';
	import type { LocalizedProject } from '$lib/utils/project-mapper';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { optimizeImage } from '$lib/utils/image.util';
	import { randomOrigamiClipPath } from '$lib/utils/origami-shape';
	import { puzzlePiecePath, type PuzzleEdgeState } from '$lib/utils/puzzle-shape';

	let {
		project,
		index,
		isFeature,
		edges
	}: {
		project: LocalizedProject;
		index: number;
		isFeature: boolean;
		edges?: Record<'top' | 'right' | 'bottom' | 'left', PuzzleEdgeState>;
	} = $props();

	const primaryTag = $derived(project.tags?.[0]?.name);

	// The arrow badge keeps the smaller torn-paper corner treatment — it's
	// tiny and isolated, not a puzzle piece sharing edges with neighbors.
	const badgeClipPath = $derived(
		randomOrigamiClipPath(`${project.id}-badge`, {
			minCut: 10,
			maxCut: 22,
			sharpChance: 0,
			family: 'notch'
		})
	);

	// Measured from the actual grid cell so the knob radius — and therefore
	// where a bump/socket lands — is based on real pixels, not a guess.
	let tileWidth = $state(0);
	let tileHeight = $state(0);
	const measured = $derived(tileWidth > 0 && tileHeight > 0);
	const piece = $derived(
		measured ? puzzlePiecePath(tileWidth, tileHeight, edges ?? {}) : { path: 'none', bleed: 0 }
	);
</script>

<!-- The hard offset "shadow" has to live on a sibling, not a child of the clipped
     article — clip-path clips a box's entire subtree (including filter/box-shadow
     and any child that pokes past its edges) to its own polygon, so a shadow tied
     to the article itself gets silently clipped away too. Same reason the knob's
     bump has to live on a sibling rather than just overflowing the article. -->
<div
	class="work-item group relative h-full {isFeature ? 'sm:col-span-2' : ''}"
	bind:clientWidth={tileWidth}
	bind:clientHeight={tileHeight}
>
	<div
		class="pointer-events-none absolute bg-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100"
		style="inset: -{piece.bleed}px; clip-path: {piece.path}; transform: translate(6px, 6px);"
	></div>

	<article
		class="absolute border-2 border-foreground/15 bg-muted transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1"
		style="inset: -{piece.bleed}px; clip-path: {piece.path};"
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

			<!-- Pulls back to the tile's nominal rectangle (excluding the knob
			     bleed) so captions/badge stay put regardless of how big the
			     bump/socket margin is. -->
			<div class="absolute" style="inset: {piece.bleed}px;">
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
					<span class="font-mono text-[10px] text-white/60"
						>{String(index + 1).padStart(2, '0')}</span
					>
					<h3 class="font-poppins text-xl font-bold tracking-tight text-white sm:text-2xl">
						{project.title}
					</h3>
					{#if primaryTag}
						<p class="mt-1 font-mono text-xs tracking-wide text-white/70 uppercase">{primaryTag}</p>
					{/if}
				</div>
			</div>
		</a>
	</article>
</div>
