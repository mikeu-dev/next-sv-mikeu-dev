<script lang="ts">
	import iconsData from 'simple-icons/icons.json';
	import { Linkedin } from '@lucide/svelte';
	import Icon from '$lib/components/ui/icon.svelte';
	import type { Component } from 'svelte';

	let { value = $bindable(), color = '#000000', id = '' } = $props();
	let safeValue = $derived(value ?? '');

	let searchQuery = $state('');
	let isOpen = $state(false);

	// Popular brand slugs to prioritize at the top
	const POPULAR_SLUGS = [
		'linkedin',
		'github',
		'instagram',
		'facebook',
		'twitter',
		'x',
		'youtube',
		'tiktok',
		'whatsapp',
		'telegram',
		'discord',
		'twitch',
		'dribbble',
		'behance',
		'medium'
	];

	interface IconInfo {
		key: string;
		name: string;
		displayName: string;
		slug: string;
		hex: string;
		source: 'simple' | 'lucide';
		isPopular: boolean;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		component?: Component<any>;
	}

	// Custom icons from other libraries (e.g. Lucide)
	const CUSTOM_ICONS = [
		{
			key: 'luLinkedin',
			name: 'Linkedin',
			displayName: 'LinkedIn',
			slug: 'linkedin',
			hex: '0A66C2',
			source: 'lucide' as const,
			component: Linkedin
		}
	];

	// Get all available icons
	const allIcons: IconInfo[] = [
		...CUSTOM_ICONS.map((icon) => ({ ...icon, isPopular: POPULAR_SLUGS.includes(icon.slug) })),
		...(iconsData as Array<{ title: string; slug: string; hex: string }>).map((icon) => {
			const name =
				icon.title.charAt(0).toUpperCase() +
				icon.title
					.slice(1)
					.replace(/\s+/g, '')
					.replace(/[^\w]/g, '');
			const key = 'si' + name;
			return {
				key,
				slug: icon.slug,
				name,
				displayName: icon.title,
				hex: icon.hex,
				source: 'simple' as const,
				isPopular: POPULAR_SLUGS.includes(icon.slug)
			};
		})
	].sort((a, b) => {
		// Sort popular icons first
		if (a.isPopular && !b.isPopular) return -1;
		if (!a.isPopular && b.isPopular) return 1;
		// Then alphabetically
		return a.displayName.localeCompare(b.displayName);
	});

	// Filter icons based on search
	let filteredIcons = $derived(
		searchQuery.trim()
			? allIcons
					.filter(
						(icon) =>
							icon.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
							icon.slug.toLowerCase().includes(searchQuery.toLowerCase())
					)
					.slice(0, 1000) // Increase limit for search results
			: allIcons.slice(0, 1000) // Show first 1000 by default (including all popular ones)
	);

	function getIcon(key: string) {
		return allIcons.find((i) => i.key === key);
	}

	// Get selected icon display name
	let selectedIconName = $derived(() => {
		if (!safeValue) return 'Select Icon';

		// Handle prefixes from Firestore
		let iconKey = '';
		if (safeValue.startsWith('Si') && safeValue.length > 2) {
			iconKey = 'si' + safeValue.slice(2);
		} else if (safeValue.startsWith('Lu') && safeValue.length > 2) {
			iconKey = 'lu' + safeValue.slice(2);
		} else {
			iconKey = safeValue.charAt(0).toLowerCase() + safeValue.slice(1);
		}

		const icon = getIcon(iconKey);
		return icon?.displayName || safeValue;
	});

	function selectIcon(icon: (typeof allIcons)[0]) {
		// Convert back to prefix format (Si or Lu)
		const prefix = icon.source === 'lucide' ? 'Lu' : 'Si';
		value = prefix + icon.name;
		isOpen = false;
		searchQuery = '';
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.icon-picker')) {
			isOpen = false;
		}
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside);
			return () => document.removeEventListener('click', handleClickOutside);
		}
	});
</script>

<div class="icon-picker relative">
	<!-- Selected Icon Display -->
	<button
		type="button"
		{id}
		onclick={(e) => {
			e.stopPropagation();
			isOpen = !isOpen;
		}}
		class="flex w-full items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
	>
		{#if safeValue && safeValue !== 'SiDefault'}
			<div
				class="flex h-6 w-6 shrink-0 items-center justify-center rounded"
				style="background-color: {color}15;"
			>
				<Icon iconName={safeValue} {color} size={16} strokeWidth={2.5} />
			</div>
		{:else}
			<div
				class="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-700"
			>
				<svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
			</div>
		{/if}
		<span class="flex-1 text-sm">{selectedIconName()}</span>
		<svg
			class="h-4 w-4 shrink-0 text-gray-400 transition-transform {isOpen ? 'rotate-180' : ''}"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	<!-- Dropdown Panel -->
	{#if isOpen}
		<div
			class="absolute right-0 left-0 z-50 mt-2 rounded-lg border border-gray-300 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
		>
			<!-- Search Input -->
			<div class="border-b border-gray-200 p-4 dark:border-gray-700">
				<div class="relative flex items-center">
					<svg
						class="absolute left-3 h-4 w-4 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search icons..."
						class="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
						onclick={(e) => e.stopPropagation()}
					/>
				</div>
			</div>

			<!-- Icons Grid -->
			<div class="max-h-80 overflow-y-auto p-4">
				{#if filteredIcons.length > 0}
					<div class="grid grid-cols-2 gap-2">
						{#each filteredIcons as icon (icon.key)}
							<button
								type="button"
								onclick={(e) => {
									e.stopPropagation();
									selectIcon(icon);
								}}
								class="group flex items-center gap-3 rounded-lg border p-2 text-left transition-all hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 {value ===
								'Si' + icon.name
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-200 dark:border-gray-700'}"
								title={icon.displayName}
							>
								<div
									class="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-800"
								>
									<Icon iconName={icon.key} color="#{icon.hex}" size={18} strokeWidth={2.5} />
								</div>
								<span class="truncate text-sm font-medium">{icon.displayName}</span>
							</button>
						{/each}
					</div>
				{:else}
					<div class="py-12 text-center">
						<svg
							class="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<p class="mt-3 text-sm text-gray-500 dark:text-gray-400">
							No icons found for "<span class="font-medium">{searchQuery}</span>"
						</p>
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div
				class="border-t border-gray-200 px-4 py-3 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400"
			>
				Showing {filteredIcons.length} of {allIcons.length} icons
				{#if searchQuery}
					<button
						type="button"
						onclick={() => (searchQuery = '')}
						class="ml-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
					>
						Clear search
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	:global(.icon-picker .flex.items-center.justify-center svg) {
		width: 100%;
		height: 100%;
		object-fit: contain;
		fill: currentColor;
	}

	:global(.icon-picker .icon-container svg) {
		width: 100%;
		height: 100%;
		object-fit: contain;
		fill: currentColor;
	}
</style>
