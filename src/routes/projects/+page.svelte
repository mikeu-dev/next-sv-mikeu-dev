<script lang="ts">
	import ProjectCard from '@/lib/components/guest/card/project-card.svelte';
	import type { PageData } from './$types';
	import type { Project } from '$lib/types';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Icon } from 'svelte-icons-pack';
	import { buttonVariants } from '@/lib/components/ui/button';
	import { getLocale } from '@/lib/paraglide/runtime';

	let { data }: { data: PageData } = $props();
	const { projects }: { projects: Record<string, Project[]> } = data;
	let initialLocale = $state(getLocale());
	let projectsData = $derived(projects[initialLocale] || projects['en']);

	let allTags = $derived.by(() => {
		const uniqueTags = Array.from(
			new Map((projectsData ?? []).flatMap((p) => p.tags || []).map((t) => [t.name, t])).values()
		);
		return uniqueTags;
	});

	let selectedTag = $state<string>('All');
	let filteredProjects = $derived.by(() => {
		if (selectedTag === 'All') return projectsData;
		return projectsData.filter((p) => p.tags?.some((t) => t.name === selectedTag));
	});

	function filterProjects(tagName: string) {
		selectedTag = tagName;
	}
</script>

<div class="space-y-12 mt-20">
	<section class="text-center">
		<h1 class="font-poppins text-4xl font-bold tracking-tight md:text-5xl">All Projects</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
			Here's a collection of my work, including personal projects, open-source contributions, and
			experiments.
		</p>
	</section>

	<section class="space-y-8">
		<div class="flex flex-wrap justify-center gap-2">
			{#each allTags as tag}
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger
							onclick={() => filterProjects(tag.name)}
							class="{buttonVariants({
								variant: selectedTag === tag.name ? 'default' : 'outline'
							})} cursor-pointer rounded-full border-0"
							style={selectedTag !== tag.name
								? `background-color: ${tag.color}1A; color: ${tag.color};`
								: ''}
						>
							{#if tag.icon}
								<Icon src={tag.icon} size={16} />
							{/if}
							{tag.name}
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>Select to filter projects by this tag.</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
			{/each}
		</div>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredProjects as project (project.id)}
				<ProjectCard {project} />
			{/each}
		</div>
	</section>
</div>
