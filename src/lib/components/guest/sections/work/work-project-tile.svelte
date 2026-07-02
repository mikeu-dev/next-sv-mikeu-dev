<script lang="ts">
	import { ArrowUpRight } from '@lucide/svelte';
	import type { LocalizedProject } from '$lib/utils/project-mapper';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { optimizeImage } from '$lib/utils/image.util';

	let { project, index }: { project: LocalizedProject; index: number } = $props();

	// Deterministic bento rhythm: every 4 tiles, the 1st and 4th span both columns and are taller.
	const isFeature = $derived(index % 4 === 0 || index % 4 === 3);
	const primaryTag = $derived(project.tags?.[0]?.name);
</script>

<article
	class="work-item group relative overflow-hidden rounded-2xl bg-muted {isFeature
		? 'col-span-2 h-72 md:h-96'
		: 'col-span-2 h-64 sm:col-span-1 md:h-80'}"
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
			class="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
		>
			<ArrowUpRight class="size-4" />
		</div>

		<!-- Caption -->
		<div class="absolute inset-x-0 bottom-0 z-10 p-5">
			<span class="font-mono text-[10px] text-white/60">{String(index + 1).padStart(2, '0')}</span>
			<h3 class="font-poppins text-xl font-bold tracking-tight text-white sm:text-2xl">
				{project.title}
			</h3>
			{#if primaryTag}
				<p class="mt-1 font-mono text-xs tracking-wide text-white/70 uppercase">{primaryTag}</p>
			{/if}
		</div>
	</a>
</article>
