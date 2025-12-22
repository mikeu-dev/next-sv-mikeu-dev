<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import * as SimpleIcons from 'simple-icons';

	let socials = $state({ links: [] });
	let loading = $state(true);

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		try {
			const response = await fetch('/api/socials');
			if (!response.ok) throw new Error('Failed to load data');
			socials = await response.json();
		} catch (error: any) {
			toast.error(error.message || 'Failed to load socials');
		} finally {
			loading = false;
		}
	}

	// Get SVG for an icon
	function getIconSvg(iconName: string): string {
		try {
			const key = iconName.charAt(0).toLowerCase() + iconName.slice(1);
			const icon = (SimpleIcons as any)[key];
			return icon?.svg || '';
		} catch (e) {
			return '';
		}
	}
</script>

<div class="container mx-auto p-6">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Social Links Management</h1>
			<p class="text-muted-foreground">Manage your social media links</p>
		</div>
		<button
			onclick={() => goto('/admin/socials/create')}
			class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
		>
			+ Add Social Link
		</button>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading...</div>
		</div>
	{:else}
		<div class="grid gap-4 md:grid-cols-2">
			{#each socials.links as link, idx}
				<div
					class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
				>
					<div class="flex items-start justify-between">
						<div class="flex items-center gap-4">
							<div
								class="flex h-12 w-12 items-center justify-center rounded-lg"
								style="background-color: {link.color}20; color: {link.color}"
							>
								{@html getIconSvg(link.iconName)}
							</div>
							<div>
								<h3 class="font-semibold">{link.label}</h3>
								<a href={link.href} target="_blank" class="text-sm text-blue-600 hover:underline">
									{link.href}
								</a>
							</div>
						</div>
						<button
							onclick={() => goto(`/admin/socials/edit/${idx}`)}
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

<style>
	:global(.h-12.w-12 svg) {
		width: 24px;
		height: 24px;
		fill: currentColor;
	}
</style>
