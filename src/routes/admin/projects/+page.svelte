<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { Project } from '$lib/types';

	let projects = $state<Project[]>([]);
	let loading = $state(true);
	let displayLang = $state<'en' | 'id'>('en');

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
				onclick={() => switchLang('en')}
				class="rounded-lg px-4 py-2 {displayLang === 'en'
					? 'bg-blue-600 text-white'
					: 'border border-gray-300 dark:border-gray-700'}"
			>
				🇬🇧 English
			</button>
			<button
				onclick={() => switchLang('id')}
				class="rounded-lg px-4 py-2 {displayLang === 'id'
					? 'bg-blue-600 text-white'
					: 'border border-gray-300 dark:border-gray-700'}"
			>
				🇮🇩 Indonesia
			</button>
			<button
				onclick={() => goto('/admin/projects/create')}
				class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
			>
				+ New Project
			</button>
		</div>
	</div>

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
	{:else}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each projects as project (project.id)}
				<div
					class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
				>
					{#if project.thumbnailUrl}
						<img
							src={project.thumbnailUrl}
							alt={displayLang === 'en' ? project.title_en : project.title_id}
							class="h-48 w-full object-cover"
						/>
					{:else}
						<div class="flex h-48 items-center justify-center bg-gray-100 dark:bg-gray-800">
							<span class="text-muted-foreground">No image</span>
						</div>
					{/if}

					<div class="p-4">
						<div class="mb-2 flex items-start justify-between">
							<h3 class="text-lg font-semibold">
								{displayLang === 'en' ? project.title_en : project.title_id}
							</h3>
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

						<p class="mb-4 line-clamp-2 text-sm text-muted-foreground">
							{displayLang === 'en' ? project.description_en : project.description_id}
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
