<script lang="ts">
	import ProjectCard from '@/lib/components/guest/card/project-card.svelte';
	import ProjectSkeleton from '@/lib/components/guest/card/project-skeleton.svelte';
	import type { PageData } from './$types';
	import type { Project } from '$lib/types';
	import Icon from '@/lib/components/ui/icon.svelte';
	import { getLocale } from '@/lib/paraglide/runtime';
	import { getLocalizedProject } from '$lib/utils/project-mapper';
	import { m } from '@/lib/paraglide/messages';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { Search, SortAsc, SortDesc, BoxSelect, Database, Filter, SlidersHorizontal, Plus } from '@lucide/svelte';
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
	let isLoadingMore = $state(false);

	// Transform projects to localized version
	let rawInitialProjects = $derived(projects[locale] || projects['en'] || []);

	// Maintain a dynamic list of projects for "Load More"
	let projectsList = $state<Project[]>([]);
	let hasMore = $state(true);
	const pageSize = 6;

	// Update list when initial data changes (e.g. locale change)
	$effect(() => {
		projectsList = [...rawInitialProjects];
		hasMore = rawInitialProjects.length >= pageSize;
	});

	let projectsData = $derived(projectsList.map((p) => getLocalizedProject(p, locale)));

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

	async function loadMore() {
		if (isLoadingMore || !hasMore) return;
		isLoadingMore = true;

		try {
			const offset = projectsList.length;
			const response = await fetch(`/api/projects?limit=${pageSize}&offset=${offset}`);

			if (response.ok) {
				const newData = await response.json();
				if (newData && Array.isArray(newData)) {
					if (newData.length < pageSize) {
						hasMore = false;
					}
					const existingIds = new Set(projectsList.map((p) => p.id));
					const filteredNewData = newData.filter((p) => !existingIds.has(p.id));

					if (filteredNewData.length === 0) {
						hasMore = false;
					} else {
						projectsList = [...projectsList, ...filteredNewData];
					}
				} else {
					hasMore = false;
				}
			}
		} catch (error) {
			console.error('Failed to load more projects:', error);
		} finally {
			isLoadingMore = false;
		}
	}

	function filterProjects(tagName: string) {
		selectedTag = tagName;
	}

	function toggleSortDirection() {
		sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
	}

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		setTimeout(() => {
			isLoading = false;
			
			// Enhanced Brutalist Entrance
			const tl = gsap.timeline();
			
			tl.from('.header-origami', {
				clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
				duration: 1.2,
				ease: 'power4.inOut'
			})
			.from('.project-stagger', {
				y: 50,
				rotateX: -15,
				skewY: 2,
				opacity: 0,
				duration: 0.8,
				stagger: 0.1,
				ease: 'expo.out'
			}, '-=0.6');
		}, 600);
	});
</script>

<div class="relative mt-28 min-h-screen space-y-24 pb-32">
	<!-- Industrial Background Element -->
	<div class="pointer-events-none fixed inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]" 
		style="background-image: radial-gradient(var(--foreground) 1px, transparent 1px); background-size: 32px 32px;">
	</div>

	<!-- Header Section -->
	<section class="container mx-auto px-4">
		<div class="header-origami relative border-y-4 border-foreground py-16 text-center md:py-24"
			style="clip-path: polygon(0 0, 100% 0, 98% 100%, 2% 100%);">
			<div class="absolute inset-0 -z-10 bg-primary/5"></div>
			
			<div class="inline-block border-2 border-foreground bg-primary px-4 py-1 font-mono text-[10px] font-black tracking-[0.2em] text-primary-foreground uppercase mb-6">
				[ARCHIVE_COLLECTION_v2.0]
			</div>
			
			<h1 class="project-stagger font-poppins text-5xl font-black tracking-tighter md:text-8xl">
				{m.projects_title()}<span class="text-primary">_</span>
			</h1>
			
			<p class="project-stagger mx-auto mt-8 max-w-3xl font-mono text-xs leading-relaxed tracking-wider text-muted-foreground uppercase md:text-sm">
				// {m.projects_subtitle()}
			</p>
			
			<!-- Decorative Origami Shards -->
			<div class="absolute -top-10 -right-10 size-40 bg-primary/10 transition-transform duration-500 hover:rotate-45" style="clip-path: polygon(50% 0%, 0% 100%, 100% 100%);"></div>
			<div class="absolute -bottom-10 -left-10 size-32 bg-foreground/5 transition-transform duration-500 hover:-rotate-12" style="clip-path: polygon(0% 0%, 100% 0%, 50% 100%);"></div>
		</div>
	</section>

	<!-- Controls Section (Search, Sort, Filter) -->
	<section class="container mx-auto space-y-12 px-4">
		<div class="flex flex-col items-stretch justify-between gap-8 lg:flex-row lg:items-end">
			<!-- Search Bar -->
			<div class="project-stagger relative flex-1">
				<div class="mb-2 flex items-center gap-2 font-mono text-[10px] font-black tracking-widest uppercase">
					<Database class="size-3" /> [DATABASE_SEARCH]
				</div>
				<div class="group relative">
					<Search class="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="QUERY_ENGINE..."
						class="h-14 w-full border-2 border-foreground bg-card px-4 pl-12 font-mono text-sm tracking-tight transition-all outline-none focus:bg-primary/5 focus:shadow-[4px_4px_0_var(--primary)]"
					/>
				</div>
			</div>

			<!-- Sorting -->
			<div class="project-stagger flex flex-col gap-2">
				<div class="flex items-center gap-2 font-mono text-[10px] font-black tracking-widest uppercase">
					<SlidersHorizontal class="size-3" /> [SORT_ENGINE]
				</div>
				<div class="flex items-center border-2 border-foreground bg-card p-1">
					<button
						onclick={() => (sortBy = 'date')}
						class="flex-1 px-6 py-2.5 font-mono text-[10px] font-black tracking-widest uppercase transition-all {sortBy === 'date'
							? 'bg-foreground text-background'
							: 'hover:bg-muted'}"
					>
						[DATE]
					</button>
					<button
						onclick={() => (sortBy = 'title')}
						class="flex-1 px-6 py-2.5 font-mono text-[10px] font-black tracking-widest uppercase transition-all {sortBy === 'title'
							? 'bg-foreground text-background'
							: 'hover:bg-muted'}"
					>
						[ALPHA]
					</button>
					<div class="mx-1 h-6 w-0.5 bg-foreground/20"></div>
					<button
						onclick={toggleSortDirection}
						class="flex size-10 items-center justify-center transition-all hover:bg-primary hover:text-white"
						title="Toggle Direction"
					>
						{#if sortDirection === 'asc'}
							<SortAsc class="size-4" />
						{:else}
							<SortDesc class="size-4" />
						{/if}
					</button>
				</div>
			</div>
		</div>

		<!-- Tag Filters -->
		<div class="project-stagger space-y-4">
			<div class="flex items-center gap-2 font-mono text-[10px] font-black tracking-widest uppercase">
				<Filter class="size-3" /> [CATEGORICAL_FILTER]
			</div>
			<div class="flex flex-wrap gap-3">
				{#each allTags as tag (tag.name)}
					<button
						onclick={() => filterProjects(tag.name)}
						class="group relative flex items-center gap-3 border-2 border-foreground px-4 py-2 transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_var(--foreground)] active:translate-x-0 active:translate-y-0 active:shadow-none {selectedTag === tag.name ? 'bg-foreground text-background' : 'bg-card'}"
					>
						<div class="relative z-10 flex items-center gap-2">
							{#if 'iconName' in tag && tag.iconName}
								<Icon iconName={tag.iconName as string} size={14} />
							{:else if 'icon' in tag && tag.icon}
								<Icon src={tag.icon} size={14} />
							{/if}
							<span class="font-mono text-[10px] font-black tracking-widest uppercase">
								{tag.name === 'All' ? m.projects_filter_all() : tag.name}
							</span>
						</div>
						
						{#if selectedTag === tag.name}
							<div class="absolute inset-0 -z-10 translate-x-1 translate-y-1 bg-primary"></div>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</section>

	<!-- Projects Grid -->
	<section class="container mx-auto px-4">
		{#if isLoading}
			<div class="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
				{#each Array(6) as _, i (i)}
					<div class="border-2 border-foreground p-2">
						<ProjectSkeleton />
					</div>
				{/each}
			</div>
		{:else if filteredProjects.length > 0}
			<div class="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
				{#each filteredProjects as project (project.id)}
					<div class="project-stagger">
						<ProjectCard {project} />
					</div>
				{/each}
			</div>

			<!-- Load More Button -->
			{#if hasMore && searchQuery === '' && selectedTag === 'All'}
				<div class="mt-24 flex justify-center">
					<button
						onclick={loadMore}
						disabled={isLoadingMore}
						class="group relative flex h-16 items-center gap-4 border-4 border-foreground bg-primary px-10 font-mono text-sm font-black tracking-[0.2em] text-primary-foreground uppercase transition-all hover:-translate-x-2 hover:-translate-y-2 hover:shadow-[8px_8px_0_var(--foreground)] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-50"
					>
						<div class="absolute inset-0 -z-10 translate-x-2 translate-y-2 bg-foreground/10 transition-transform group-hover:translate-x-4 group-hover:translate-y-4"></div>
						
						{#if isLoadingMore}
							<Icon iconName="Loader2" size={20} class="animate-spin" />
							[FETCHING_MORE...]
						{:else}
							<Plus class="size-5 transition-transform group-hover:rotate-180" />
							[EXPAND_COLLECTION]
						{/if}
					</button>
				</div>
			{/if}
		{:else}
			<!-- Empty State -->
			<div class="project-stagger mx-auto flex max-w-2xl flex-col items-center justify-center border-4 border-dashed border-foreground/20 py-32 text-center">
				<div class="mb-8 border-2 border-foreground bg-muted p-8 shadow-[8px_8px_0_var(--foreground)]">
					<BoxSelect class="size-20 text-foreground" />
				</div>
				<div class="space-y-4">
					<h3 class="font-poppins text-3xl font-black uppercase tracking-tighter">[ZERO_RESULTS_FOUND]</h3>
					<p class="font-mono text-xs tracking-widest text-muted-foreground uppercase">// THE_REQUESTED_QUERY_RETURNED_NULL_SET</p>
				</div>
				<button
					onclick={() => {
						selectedTag = 'All';
						searchQuery = '';
					}}
					class="mt-10 border-2 border-foreground bg-foreground px-8 py-3 font-mono text-[10px] font-black tracking-widest text-background uppercase transition-all hover:bg-primary hover:text-white"
				>
					[RESET_FILTERS]
				</button>
			</div>
		{/if}
	</section>
</div>

<style lang="postcss">
	@reference "tailwindcss";

	:global(.header-origami) {
		transform-style: preserve-3d;
		perspective: 1000px;
	}

	input::placeholder {
		color: oklch(from var(--muted-foreground) l c h / 40%);
	}

	.container {
		@apply max-w-7xl;
	}
</style>

