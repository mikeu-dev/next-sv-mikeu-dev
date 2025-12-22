<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let techstack = $state({ categories: [] });
	let loading = $state(true);
	let lang = $state<'en' | 'id'>('en');

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		try {
			const response = await fetch(`/api/techstack?lang=${lang}`);
			if (!response.ok) throw new Error('Failed to load data');
			techstack = await response.json();
		} catch (error: any) {
			toast.error(error.message || 'Failed to load techstack');
		} finally {
			loading = false;
		}
	}

	function switchLang(newLang: 'en' | 'id') {
		lang = newLang;
		loadData();
	}
</script>

<div class="container mx-auto p-6">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">TechStack Management</h1>
			<p class="text-muted-foreground">Manage your technology stack</p>
		</div>
		<div class="flex gap-2">
			<button
				onclick={() => switchLang('en')}
				class="rounded-lg px-4 py-2 {lang === 'en'
					? 'bg-blue-600 text-white'
					: 'border border-gray-300 dark:border-gray-700'}"
			>
				English
			</button>
			<button
				onclick={() => switchLang('id')}
				class="rounded-lg px-4 py-2 {lang === 'id'
					? 'bg-blue-600 text-white'
					: 'border border-gray-300 dark:border-gray-700'}"
			>
				Indonesia
			</button>
		</div>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading...</div>
		</div>
	{:else}
		<div class="space-y-6">
			{#each techstack.categories as category, idx}
				<div
					class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
				>
					<div class="mb-4 flex items-start justify-between">
						<div>
							<h2 class="text-xl font-semibold">{category.category}</h2>
							<p class="text-sm text-muted-foreground">{category.description}</p>
						</div>
						<button
							onclick={() => goto(`/admin/techstack/edit/${lang}/${idx}`)}
							class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
						>
							Edit
						</button>
					</div>

					<div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
						{#each category.items as item}
							<div
								class="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800"
							>
								<div
									class="flex h-10 w-10 items-center justify-center rounded-lg"
									style="background-color: {item.color}20"
								>
									<span class="font-mono text-xs">{item.iconName}</span>
								</div>
								<div class="flex-1">
									<div class="font-medium">{item.name}</div>
									<a href={item.url} target="_blank" class="text-xs text-blue-600 hover:underline">
										{item.url}
									</a>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
