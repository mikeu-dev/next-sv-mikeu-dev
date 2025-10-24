<script lang="ts">
	import ProjectCard from '@/lib/components/ProjectCard.svelte';
	import * as Tooltip from '@/lib/components/ui/tooltip';
	import type { Project } from '$lib/types';
	import { useWorkSection } from './work.svelte.js';

	let { projects }: { projects: Project[] } = $props();

	// gunakan composable hook untuk mengatur semua logika
	const {
		workSection,
		projectCardElements,
		tooltipOpen,
		virtualAnchor,
		isDragging
	} = useWorkSection();

	// Teks tooltip dinamis berdasarkan status drag
	const tooltipText = $derived($isDragging
		? 'Klik kanan untuk melepas jika menempel.'
		: 'Click and drag the cards to play!');
</script>

<Tooltip.Provider>

	<Tooltip.Root bind:open={$tooltipOpen}>
		<section
			bind:this={$workSection}
			id="work"
			class="relative mb-0! overflow-hidden pt-16 pb-0! md:pt-24"
		>
			<div class="mb-16 text-center">
				<h2 class="font-poppins text-3xl font-bold tracking-tight">Featured Projects</h2>
				<p class="mx-auto mt-2 max-w-2xl text-lg text-muted-foreground">
					A selection of projects that I'm proud of.
				</p>
			</div>

			<div class="projects-grid grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each projects as project, i (project.id)}
					<div bind:this={$projectCardElements[i]}>
						<ProjectCard {project} />
					</div>
				{/each}
			</div>
		</section>

		<Tooltip.Content customAnchor={$virtualAnchor}>
			<p>{tooltipText}</p>
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
