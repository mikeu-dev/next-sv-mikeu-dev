<script lang="ts">
	import ProjectCard from '@/lib/components/guest/card/project-card.svelte';
	import * as Tooltip from '@/lib/components/ui/tooltip';
	import type { Project } from '$lib/types';
	import { useWorkSection } from './work.svelte.js';
	import { getLocale } from '@/lib/paraglide/runtime.js';
	import * as m from '@/lib/paraglide/messages.js';
	import { getLocalizedProject } from '$lib/utils/project-mapper';

	let { projects }: { projects: Record<string, Project[]> } = $props();
	let initialLocale = $state(getLocale());
	let projectsData = $derived(projects[initialLocale] || projects['en']);
	let projectByPinned = $derived(projectsData.filter((project) => project.pinned));

	// Transform for display
	let localizedProjects = $derived(
		projectByPinned.map((p) => getLocalizedProject(p, initialLocale))
	);

	const { workSection, projectCardElements, tooltipOpen, virtualAnchor, tooltipText } =
		useWorkSection();
</script>

<Tooltip.Provider>
	<Tooltip.Root bind:open={$tooltipOpen}>
		<section
			bind:this={$workSection}
			id="work"
			class="draggable-wrapper relative mb-0! overflow-hidden pt-16 pb-0! md:pt-24"
		>
			<div class="mb-16 text-center">
				<h2 class="font-poppins text-3xl font-bold tracking-tight">{m.work_title()}</h2>
				<p class="mx-auto mt-2 max-w-2xl text-lg text-muted-foreground">
					{m.work_subtitle()}
				</p>
			</div>

			<div class="projects-grid mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each localizedProjects as project, i (project.id)}
					<div bind:this={$projectCardElements[i]} class="will-change-transform">
						<ProjectCard {project} />
					</div>
				{/each}
			</div>
		</section>

		<Tooltip.Content customAnchor={$virtualAnchor}>
			<p>{$tooltipText}</p>
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
