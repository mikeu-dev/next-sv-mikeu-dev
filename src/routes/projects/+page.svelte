<script lang="ts">
	import ProjectCard from '@/lib/components/guest/card/project-card.svelte';
	import type { PageData } from './$types';
	import type { Project } from '$lib/types';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import Icon from '@/lib/components/ui/icon.svelte';
	import { buttonVariants } from '@/lib/components/ui/button';
	import { getLocale } from '@/lib/paraglide/runtime';
	import { getLocalizedProject } from '$lib/utils/project-mapper';
	import * as m from '@/lib/paraglide/messages';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

	let { data }: { data: PageData } = $props();
	const { projects }: { projects: Record<string, Project[]> } = data;

	let locale = $derived(getLocale());

	// We already have localized arrays coming from the server, but they are still 'Project' type which has the multilingual fields
	// We want to transform them to 'LocalizedProject' for better type safety in the UI
	let rawProjects = $derived(projects[locale] || projects['en']);

	let projectsData = $derived(rawProjects.map((p) => getLocalizedProject(p, locale)));

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

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);
		const tl = gsap.timeline();
		tl.from('.project-stagger', {
			y: 30,
			opacity: 0,
			duration: 0.6,
			stagger: 0.1,
			ease: 'power2.out'
		});
	});
</script>

<div class="mt-28 space-y-12">
	<section class="text-center">
		<h1 class="font-poppins project-stagger text-4xl font-black tracking-tight md:text-6xl">
			{m.projects_title()}<span class="text-primary">.</span>
		</h1>
		<p
			class="font-poppins project-stagger mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
		>
			{m.projects_subtitle()}
		</p>
	</section>

	<section class="space-y-8">
		<div class="flex flex-wrap justify-center gap-2">
			{#each allTags as tag (tag.name)}
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger
							onclick={() => filterProjects(tag.name)}
							class={`${buttonVariants({ variant: selectedTag === tag.name ? 'default' : 'outline' })}
									cursor-pointer rounded-full border-0
									${tag.color === '#171d26' ? 'dark:text-white!' : ''}
							`}
							style={selectedTag !== tag.name
								? `background-color: ${tag.color}1A; color: ${tag.color};`
								: ''}
						>
							{#if tag.icon}
								<Icon src={tag.icon} size={16} />
							{/if}
							{tag.name === 'All' ? m.projects_filter_all() : tag.name}
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>{m.projects_filter_tooltip()}</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
			{/each}
		</div>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredProjects as project (project.id)}
				<div class="project-stagger">
					<ProjectCard {project} />
				</div>
			{/each}
		</div>
	</section>
</div>
