<script lang="ts">
	import * as SimpleIcons from 'simple-icons';

	let { value = $bindable(''), color = '#000000' } = $props();

	let searchQuery = $state('');
	let isOpen = $state(false);

	// Get all available icons
	const allIcons = Object.keys(SimpleIcons)
		.filter((key) => key.startsWith('si'))
		.map((key) => ({
			key,
			name: key.slice(2), // Remove 'si' prefix
			displayName: key.charAt(2).toUpperCase() + key.slice(3) // Capitalize
		}));

	// Filter icons based on search
	let filteredIcons = $derived(
		searchQuery.trim()
			? allIcons
					.filter((icon) => icon.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
					.slice(0, 100) // Limit to 100 results
			: allIcons.slice(0, 100) // Show first 100 by default
	);

	// Get SVG for an icon
	function getIconSvg(iconKey: string): string {
		const icon = (SimpleIcons as any)[iconKey];
		return icon?.svg || '';
	}

	// Get selected icon display name
	let selectedIconName = $derived(() => {
		if (!value) return 'Select Icon';
		const iconKey = value.charAt(0).toLowerCase() + value.slice(1);
		const icon = allIcons.find((i) => i.key === iconKey);
		return icon?.displayName || value;
	});

	function selectIcon(icon: (typeof allIcons)[0]) {
		// Convert back to "Si" prefix format
		value = 'Si' + icon.name;
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
		onclick={(e) => {
			e.stopPropagation();
			isOpen = !isOpen;
		}}
		class="flex w-full items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
	>
		{#if value && value !== 'SiDefault'}
			<div
				class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded"
				style="background-color: {color}15; color: {color}"
			>
				{@html getIconSvg(value.charAt(0).toLowerCase() + value.slice(1))}
			</div>
		{:else}
			<div
				class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-700"
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
			class="h-4 w-4 flex-shrink-0 text-gray-400 transition-transform {isOpen ? 'rotate-180' : ''}"
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
					<div class="grid grid-cols-8 gap-2">
						{#each filteredIcons as icon (icon.key)}
							<button
								type="button"
								onclick={(e) => {
									e.stopPropagation();
									selectIcon(icon);
								}}
								class="group flex items-center justify-center rounded-lg border p-3 transition-all hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 {value ===
								'Si' + icon.name
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
									: 'border-gray-200 dark:border-gray-700'}"
								title={icon.displayName}
							>
								<div
									class="icon-container flex h-6 w-6 items-center justify-center transition-transform group-hover:scale-110"
									style="color: {color}"
								>
									{@html getIconSvg(icon.key)}
								</div>
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
