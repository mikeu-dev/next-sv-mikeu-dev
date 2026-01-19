<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import * as SimpleIcons from 'simple-icons';

	interface TechItem {
		name: string;
		iconName: string;
		url: string;
		color: string;
		iconSvg?: string;
	}

	interface TechCategory {
		category: string;
		description: string;
		items: TechItem[];
	}

	let techstack = $state<{ categories: TechCategory[] }>({ categories: [] });
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
			const data = await response.json();
			// API might return 'items' or 'categories' as the top-level array of categories
			const categoriesData = data.categories || data.items || [];

			techstack = {
				categories: categoriesData.map((category: unknown) => {
					const cat = category as Record<string, unknown>;
					return {
						...cat,
						items: ((cat.items as unknown[]) || []).map((item: unknown) => {
							const it = item as Record<string, unknown>;
							return {
								...it,
								iconSvg: getIconSvg(it.iconName as string)
							};
						})
					};
				})
			};
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Failed to load techstack';
			toast.error(message);
		} finally {
			loading = false;
		}
	}

	function switchLang(newLang: 'en' | 'id') {
		lang = newLang;
		loadData();
	}

	// Get Simple Icon SVG from icon name
	function getIconSvg(iconName: string): string {
		try {
			// Convert "SiReact" to "siReact" format used by simple-icons
			const key = iconName.charAt(0).toLowerCase() + iconName.slice(1);
			const icon = (SimpleIcons as unknown as Record<string, { svg: string }>)[key];

			if (icon && icon.svg) {
				return icon.svg;
			}
		} catch {
			console.warn(`Icon not found: ${iconName}`);
		}

		// Fallback: return a simple square icon
		return '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" x="2" y="2" rx="3"/></svg>';
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
			{#each techstack.categories as category, idx (category.category || idx)}
				<div
					class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
				>
					<div class="mb-4 flex items-start justify-between">
						<div>
							<h2 class="text-xl font-semibold">{category.category}</h2>
							<p class="text-sm text-muted-foreground">{category.description}</p>
						</div>
						<button
							onclick={() => {
								// eslint-disable-next-line svelte/no-navigation-without-resolve
								goto(`${base}/admin/techstack/edit/${lang}/${idx}`);
							}}
							class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
						>
							Edit
						</button>
					</div>

					<div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
						{#each category.items as item (item.name)}
							<div
								class="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800"
							>
								<div
									class="flex h-10 w-10 items-center justify-center rounded-lg"
									style="background-color: {item.color}20; color: {item.color}"
								>
									<!-- eslint-disable-next-line svelte/no-at-html-tags -->
									{@html item.iconSvg}
								</div>
								<div class="flex-1">
									<div class="font-medium">{item.name}</div>
									<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
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

<style>
	:global(.h-10.w-10 svg) {
		width: 24px;
		height: 24px;
		fill: currentColor;
	}
</style>
