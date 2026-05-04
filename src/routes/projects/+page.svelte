<script lang="ts">
	import ProjectCard from '@/lib/components/guest/card/project-card.svelte';
	import ProjectSkeleton from '@/lib/components/guest/card/project-skeleton.svelte';
	import type { PageData } from './$types';
	import type { Project } from '$lib/types';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import Icon from '@/lib/components/ui/icon.svelte';
	import { buttonVariants } from '@/lib/components/ui/button';
	import { getLocale } from '@/lib/paraglide/runtime';
	import { getLocalizedProject } from '$lib/utils/project-mapper';
	import { m } from '@/lib/paraglide/messages';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { Search, SortAsc, SortDesc, BoxSelect } from '@lucide/svelte';
	import type { Tag } from '$lib/types';

	interface FilterTag extends Partial<Tag> {
		name: string;
		color: string;
		iconName?: string;
	}

	let { data }: { data: PageData } = $props();
	const { projects }: { projects: Record<string, Project[]> } = data;

	let locale = $derived(getLocale());
	let isLoading = $state(true);

	// Transform projects to localized version
	let rawProjects = $derived(projects[locale] || projects['en'] || []);
	let projectsData = $derived(rawProjects.map((p) => getLocalizedProject(p, locale)));

	// Derived tags including 'All'
	let allTags = $derived.by<FilterTag[]>(() => {
		const uniqueTags = Array.from(
			new Map((projectsData ?? []).flatMap((p) => p.tags || []).map((t) => [t.name, t])).values()
		);
		return [{ name: 'All', color: '#6366f1', iconName: 'LayoutGrid' }, ...uniqueTags];
	});

	// States for filtering and searching
	let selectedTag = $state<string>('All');
	let searchQuery = $state<string>('');
	let sortBy = $state<'date' | 'title'>('date');
	let sortDirection = $state<'asc' | 'desc'>('desc');

	// Filtered and sorted projects
	let filteredProjects = $derived.by(() => {
		let result = [...projectsData];

		// Filter by tag
		if (selectedTag !== 'All') {
			result = result.filter((p) => p.tags?.some((t) => t.name === selectedTag));
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(p) => p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
			);
		}

		// Sort
		result.sort((a, b) => {
			let comparison = 0;
			if (sortBy === 'date') {
				const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
				const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
				comparison = dateA - dateB;
			} else {
				comparison = a.title.localeCompare(b.title);
			}
			return sortDirection === 'asc' ? comparison : -comparison;
		});

		return result;
	});

	function filterProjects(tagName: string) {
		selectedTag = tagName;
	}

	function toggleSortDirection() {
		sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
	}

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);
		
		// Simulate loading for better UX feel (skeleton demo)
		setTimeout(() => {
			isLoading = false;
			gsap.from('.project-stagger', {
				y: 30,
				opacity: 0,
				duration: 0.6,
				stagger: 0.1,
				ease: 'power2.out'
			});
		}, 800);
	});
</script>

<div class="mt-28 space-y-16 pb-20">
	<!-- Header Section -->
	<section class="text-center">
		<h1 class="project-stagger font-poppins text-4xl font-black tracking-tight md:text-6xl">
			{m.projects_title()}<span class="text-primary">.</span>
		</h1>
		<p
			class="project-stagger mx-auto mt-6 max-w-2xl font-poppins text-lg leading-relaxed text-muted-foreground"
		>
			{m.projects_subtitle()}
		</p>
	</section>

	<!-- Controls Section (Search, Sort, Filter) -->
	<section class="mx-auto max-w-6xl space-y-8 px-4">
		<div class="flex flex-col items-center justify-between gap-6 md:flex-row">
			<!-- Search Bar -->
			<div class="relative w-full md:max-w-md">
				<Search class="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search projects..."
					class="h-12 w-full rounded-2xl border border-border/50 bg-card/50 pl-12 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
				/>
			</div>

			<!-- Sorting & Additional Filters -->
			<div class="flex items-center gap-3">
				<div class="flex items-center rounded-2xl border border-border/50 bg-card/50 p-1">
					<button
						onclick={() => (sortBy = 'date')}
						class="rounded-xl px-4 py-2 text-xs font-bold transition-all {sortBy === 'date' ? 'bg-primary text-white' : 'hover:bg-muted'}"
					>
						Date
					</button>
					<button
						onclick={() => (sortBy = 'title')}
						class="rounded-xl px-4 py-2 text-xs font-bold transition-all {sortBy === 'title' ? 'bg-primary text-white' : 'hover:bg-muted'}"
					>
						Name
					</button>
				</div>
				<button
					onclick={toggleSortDirection}
					class="flex size-11 items-center justify-center rounded-2xl border border-border/50 bg-card/50 transition-all hover:bg-muted"
					title="Change Sort Direction"
				>
					{#if sortDirection === 'asc'}
						<SortAsc class="size-5" />
					{:else}
						<SortDesc class="size-5" />
					{/if}
				</button>
			</div>
		</div>

		<!-- Tag Filters -->
		<div class="flex flex-wrap justify-center gap-2">
			{#each allTags as tag (tag.name)}
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger
							onclick={() => filterProjects(tag.name)}
							class={`${buttonVariants({ variant: selectedTag === tag.name ? 'default' : 'outline' })}
									cursor-pointer rounded-full border-0 transition-all hover:scale-105 active:scale-95
									${tag.color === '#171d26' ? 'dark:text-white!' : ''}
							`}
							style={selectedTag !== tag.name
								? `background-color: ${tag.color}1A; color: ${tag.color};`
								: ''}
						>
							{#if 'iconName' in tag && tag.iconName}
								<Icon iconName={tag.iconName as string} size={14} />
							{:else if 'icon' in tag && tag.icon}
								<Icon src={tag.icon} size={14} />
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
	</section>

	<!-- Projects Grid -->
	<section class="mx-auto max-w-7xl px-4">
		{#if isLoading}
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each Array(6) as _, i (i)}
					<ProjectSkeleton />
				{/each}
			</div>
		{:else if filteredProjects.length > 0}
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each filteredProjects as project (project.id)}
					<div class="project-stagger h-full">
						<ProjectCard {project} />
					</div>
				{/each}
			</div>
		{:else}
			<!-- Empty State -->
			<div class="flex flex-col items-center justify-center space-y-6 py-20 text-center">
				<div class="rounded-full bg-muted p-8">
					<BoxSelect class="size-16 text-muted-foreground/50" />
				</div>
				<div class="space-y-2">
					<h3 class="text-2xl font-black">No Projects Found</h3>
					<p class="text-muted-foreground">Try adjusting your filters or search query.</p>
				</div>
				<button
					onclick={() => {
						selectedTag = 'All';
						searchQuery = '';
					}}
					class={buttonVariants({ variant: 'default' })}
				>
					Reset All Filters
				</button>
			</div>
		{/if}
	</section>
</div>
