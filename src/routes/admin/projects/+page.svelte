<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { Project } from '$lib/types';

	let projects = $state<Project[]>([]);
	let loading = $state(true);
	let displayLang = $state<'en' | 'id'>('en');
	let filterStatus = $state<'all' | 'published' | 'draft'>('all');
	let filterPinned = $state<'all' | 'pinned' | 'unpinned'>('all');

	// Computed filtered projects
	let filteredProjects = $derived(() => {
		let result = projects;

		// Filter by published status
		if (filterStatus === 'published') {
			result = result.filter((p) => p.published === true);
		} else if (filterStatus === 'draft') {
			result = result.filter((p) => p.published !== true);
		}

		// Filter by pinned status
		if (filterPinned === 'pinned') {
			result = result.filter((p) => p.pinned === true);
		} else if (filterPinned === 'unpinned') {
			result = result.filter((p) => p.pinned !== true);
		}

		return result;
	});

	onMount(async () => {
		await loadProjects();
	});

	async function loadProjects() {
		try {
			const response = await fetch('/api/projects');
			if (!response.ok) throw new Error('Failed to load projects');
			projects = await response.json();
		} catch (error: any) {
			toast.error(error.message || 'Failed to load projects');
		} finally {
			loading = false;
		}
	}

	function switchLang(newLang: 'en' | 'id') {
		displayLang = newLang;
		console.log('Language switched to:', newLang);
		console.log('Sample project data:', projects[0]); // Debug: lihat struktur data
	}

	// Helper function to get title based on language with fallback
	// Supports both old format (lang field) and new format (bilingual fields)
	function getTitle(project: Project, lang: 'en' | 'id'): string {
		const projectAny = project as any;

		// New format: bilingual fields
		if (lang === 'en') {
			if (project.title_en) return project.title_en;
		} else {
			if (project.title_id) return project.title_id;
		}

		// Old format: single title with lang field
		if (projectAny.title) {
			// If project has lang field matching current lang, use it
			if (projectAny.lang === lang) return projectAny.title;
			// Otherwise still show it (better than nothing)
			return projectAny.title;
		}

		// Fallback
		return lang === 'en' ? 'Untitled' : 'Tanpa Judul';
	}

	// Helper function to get description based on language with fallback
	// Supports both old format (lang field) and new format (bilingual fields)
	function getDescription(project: Project, lang: 'en' | 'id'): string {
		const projectAny = project as any;

		// New format: bilingual fields
		if (lang === 'en') {
			if (project.description_en) return project.description_en;
		} else {
			if (project.description_id) return project.description_id;
		}

		// Old format: single description with lang field
		if (projectAny.description) {
			// If project has lang field matching current lang, use it
			if (projectAny.lang === lang) return projectAny.description;
			// Otherwise still show it (better than nothing)
			return projectAny.description;
		}

		// Fallback
		return lang === 'en' ? 'No description' : 'Tidak ada deskripsi';
	}

	async function deleteProject(id: string) {
		if (!confirm('Are you sure you want to delete this project?')) return;

		try {
			const response = await fetch(`/api/projects/${id}`, {
				method: 'DELETE'
			});

			if (!response.ok) throw new Error('Failed to delete project');

			toast.success('Project deleted successfully');
			await loadProjects();
		} catch (error: any) {
			toast.error(error.message || 'Failed to delete project');
		}
	}
</script>

<div class="container mx-auto p-6">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Projects</h1>
			<p class="text-muted-foreground">Manage your portfolio projects</p>
		</div>
		<div class="flex gap-2">
			<button
				onclick={() => goto('/admin/projects/create')}
				class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
			>
				+ New Project
			</button>
		</div>
	</div>

	<!-- Filters Section -->
	<div class="mb-6 flex flex-wrap gap-4">
		<!-- Language Filter -->
		<div class="flex items-center gap-2">
			<span class="text-sm font-medium text-muted-foreground">Language:</span>
			<div class="flex gap-1">
				<button
					onclick={() => switchLang('en')}
					class="rounded-lg px-3 py-1.5 text-sm {displayLang === 'en'
						? 'bg-blue-600 text-white'
						: 'border border-gray-300 dark:border-gray-700'}"
				>
					🇬🇧 EN
				</button>
				<button
					onclick={() => switchLang('id')}
					class="rounded-lg px-3 py-1.5 text-sm {displayLang === 'id'
						? 'bg-blue-600 text-white'
						: 'border border-gray-300 dark:border-gray-700'}"
				>
					🇮🇩 ID
				</button>
			</div>
		</div>

		<!-- Status Filter -->
		<div class="flex items-center gap-2">
			<span class="text-sm font-medium text-muted-foreground">Status:</span>
			<div class="flex gap-1">
				<button
					onclick={() => (filterStatus = 'all')}
					class="rounded-lg px-3 py-1.5 text-sm {filterStatus === 'all'
						? 'bg-blue-600 text-white'
						: 'border border-gray-300 dark:border-gray-700'}"
				>
					All
				</button>
				<button
					onclick={() => (filterStatus = 'published')}
					class="rounded-lg px-3 py-1.5 text-sm {filterStatus === 'published'
						? 'bg-green-600 text-white'
						: 'border border-gray-300 dark:border-gray-700'}"
				>
					Published
				</button>
				<button
					onclick={() => (filterStatus = 'draft')}
					class="rounded-lg px-3 py-1.5 text-sm {filterStatus === 'draft'
						? 'bg-gray-600 text-white'
						: 'border border-gray-300 dark:border-gray-700'}"
				>
					Draft
				</button>
			</div>
		</div>

		<!-- Pinned Filter -->
		<div class="flex items-center gap-2">
			<span class="text-sm font-medium text-muted-foreground">Featured:</span>
			<div class="flex gap-1">
				<button
					onclick={() => (filterPinned = 'all')}
					class="rounded-lg px-3 py-1.5 text-sm {filterPinned === 'all'
						? 'bg-blue-600 text-white'
						: 'border border-gray-300 dark:border-gray-700'}"
				>
					All
				</button>
				<button
					onclick={() => (filterPinned = 'pinned')}
					class="rounded-lg px-3 py-1.5 text-sm {filterPinned === 'pinned'
						? 'bg-yellow-600 text-white'
						: 'border border-gray-300 dark:border-gray-700'}"
				>
					⭐ Pinned
				</button>
				<button
					onclick={() => (filterPinned = 'unpinned')}
					class="rounded-lg px-3 py-1.5 text-sm {filterPinned === 'unpinned'
						? 'bg-gray-600 text-white'
						: 'border border-gray-300 dark:border-gray-700'}"
				>
					Unpinned
				</button>
			</div>
		</div>
	</div>

	<!-- Results Count -->
	{#if !loading && projects.length > 0}
		<div class="mb-4 text-sm text-muted-foreground">
			Showing {filteredProjects().length} of {projects.length} projects
		</div>
	{/if}

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading projects...</div>
		</div>
	{:else if projects.length === 0}
		<div class="flex flex-col items-center justify-center py-12">
			<p class="mb-4 text-muted-foreground">No projects yet</p>
			<button
				onclick={() => goto('/admin/projects/create')}
				class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
			>
				Create your first project
			</button>
		</div>
	{:else if filteredProjects().length === 0}
		<div class="flex flex-col items-center justify-center py-12">
			<p class="mb-4 text-muted-foreground">No projects match the selected filters</p>
			<button
				onclick={() => {
					filterStatus = 'all';
					filterPinned = 'all';
				}}
				class="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
			>
				Clear Filters
			</button>
		</div>
	{:else}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredProjects() as project (project.id)}
				<div
					class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
				>
					{#if project.thumbnailUrl}
						<img
							src={project.thumbnailUrl}
							alt={getTitle(project, displayLang)}
							class="h-48 w-full object-cover"
						/>
					{:else}
						<div class="flex h-48 items-center justify-center bg-gray-100 dark:bg-gray-800">
							<span class="text-muted-foreground">No image</span>
						</div>
					{/if}

					<div class="p-4">
						<div class="mb-2 flex items-start justify-between gap-2">
							<h3 class="flex-1 text-lg font-semibold">
								{#if project.pinned}
									<span class="mr-1 text-yellow-500">⭐</span>
								{/if}
								{getTitle(project, displayLang)}
							</h3>
							<div class="flex flex-col gap-1">
								{#if project.published}
									<span
										class="rounded bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200"
									>
										Published
									</span>
								{:else}
									<span
										class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200"
									>
										Draft
									</span>
								{/if}
							</div>
						</div>

						<p class="mb-4 line-clamp-2 text-sm text-muted-foreground">
							{getDescription(project, displayLang)}
						</p>

						<div class="flex gap-2">
							<button
								onclick={() => goto(`/admin/projects/${project.id}/edit`)}
								class="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
							>
								Edit
							</button>
							<button
								onclick={() => deleteProject(project.id)}
								class="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
