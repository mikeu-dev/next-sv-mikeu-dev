<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let journey = $state<{ items: any[] }>({ items: [] });
	let loading = $state(true);
	let lang = $state<'en' | 'id'>('en');

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		try {
			const response = await fetch(`/api/journey?lang=${lang}`);
			if (!response.ok) throw new Error('Failed to load data');
			journey = await response.json();
		} catch (error: any) {
			toast.error(error.message || 'Failed to load journey');
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
			<h1 class="text-3xl font-bold">Journey Management</h1>
			<p class="text-muted-foreground">Manage your career journey timeline</p>
		</div>
		<div class="flex gap-2">
			<button
				onclick={() => goto(`/admin/journey/create?lang=${lang}`)}
				class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
			>
				+ Add Journey
			</button>
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
		<div class="space-y-4">
			{#each journey.items as item, idx}
				<div
					class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
				>
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<div class="mb-2 flex items-center gap-3">
								<span
									class="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200"
								>
									{item.year}
								</span>
								<h3 class="text-lg font-semibold">{item.title}</h3>
							</div>
							<p class="text-muted-foreground">{item.description}</p>
						</div>
						<button
							onclick={() => goto(`/admin/journey/edit/${lang}/${idx}`)}
							class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
						>
							Edit
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
