<script lang="ts">
	import ProjectCard from '@/lib/components/ProjectCard.svelte';
	import type { PageData } from './$types';
	import { Button } from '@/lib/components/ui/button';

	export let data: PageData;
	const { projects } = data;

	// Get all unique tags from all projects
	const allTags = ['All', ...new Set(projects.flatMap((p) => p.tags || []))];

	let selectedTag: string = 'All';
	let filteredProjects = projects;

	function filterProjects(tag: string) {
		selectedTag = tag;
		if (tag === 'All') {
			filteredProjects = projects;
		} else {
			filteredProjects = projects.filter((p) => p.tags?.includes(tag));
		}
	}
</script>

<div class="space-y-12">
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
				<Button
					on:click={() => filterProjects(tag)}
					variant={selectedTag === tag ? 'default' : 'outline'}
					class="rounded-full"
				>
					{tag}
				</Button>
			{/each}
		</div>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredProjects as project (project.id)}
				<ProjectCard {project} />
			{/each}
		</div>
	</section>
</div>
