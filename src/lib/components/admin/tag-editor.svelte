<script lang="ts">
	import type { SerializedTag } from '$lib/types';
	import IconPicker from './icon-picker.svelte';
	import { toast } from 'svelte-sonner';

	let { tags = $bindable([]) } = $props<{ tags: SerializedTag[] }>();

	let newTag = $state<SerializedTag>({
		name: '',
		iconName: '',
		color: '#000000',
		url: ''
	});

	function addTag() {
		if (!newTag.name.trim()) {
			toast.error('Tag name is required');
			return;
		}
		if (!newTag.iconName) {
			toast.error('Tag icon is required');
			return;
		}

		tags = [...tags, { ...newTag }];

		// Reset form
		newTag = {
			name: '',
			iconName: '',
			color: '#000000',
			url: ''
		};
	}

	function removeTag(index: number) {
		tags = tags.filter((_: SerializedTag, i: number) => i !== index);
	}

	// Helper to get Simple Icons SVG (this logic duplicates IconPicker execution but needed for list display.
	// Ideally we export the helper from IconPicker or utils, but for now copying the SVG logic or just assuming IconPicker can be used for display too?
	// IconPicker is an input. Let's just use a small helper here or import SimpleIcons here too.
	// Actually, let's use a small display component or just import simple icons.
	import * as SimpleIcons from 'simple-icons';

	function getIconSvg(iconKey: string): string {
		if (!iconKey) return '';
		const iconKeyClean = iconKey.startsWith('Si') ? iconKey.slice(2) : iconKey;
		// Simple Icons keys in the library are usually like 'siSvelte' (camelCase starting with si)
		// BUT IconPicker logic says: keys are like 'siGithub'.
		// So we need to construct it.
		const normalized = 'si' + iconKeyClean; // e.g. siGithub
		const icon =
			(SimpleIcons as any)[normalized] ||
			(SimpleIcons as any)[iconKeyClean.toLowerCase()] ||
			(SimpleIcons as any)['si' + iconKeyClean.charAt(0).toUpperCase() + iconKeyClean.slice(1)];
		return icon?.svg || '';
	}
</script>

<div
	class="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50"
>
	<div class="grid gap-4 md:grid-cols-12">
		<!-- Name Input -->
		<div class="col-span-12 md:col-span-3">
			<label for="tag-name" class="mb-1 block text-xs font-medium text-gray-500">Name</label>
			<input
				id="tag-name"
				type="text"
				bind:value={newTag.name}
				class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
				placeholder="e.g. Svelte"
			/>
		</div>

		<!-- Color Input -->
		<div class="col-span-12 md:col-span-2">
			<label for="tag-color" class="mb-1 block text-xs font-medium text-gray-500">Color</label>
			<div class="flex gap-2">
				<input
					id="tag-color"
					type="color"
					bind:value={newTag.color}
					class="h-9 w-12 cursor-pointer rounded-md border border-gray-300 p-0.5 dark:border-gray-700 dark:bg-gray-800"
				/>
				<input
					type="text"
					bind:value={newTag.color}
					class="w-full rounded-md border border-gray-300 px-2 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
				/>
			</div>
		</div>

		<!-- Icon Picker -->
		<div class="col-span-12 md:col-span-3">
			<label for="tag-icon" class="mb-1 block text-xs font-medium text-gray-500">Icon</label>
			<IconPicker bind:value={newTag.iconName} color={newTag.color} id="tag-icon" />
		</div>

		<!-- URL Input -->
		<div class="col-span-12 md:col-span-3">
			<label for="tag-url" class="mb-1 block text-xs font-medium text-gray-500">URL</label>
			<input
				id="tag-url"
				type="url"
				bind:value={newTag.url}
				class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
				placeholder="https://..."
			/>
		</div>

		<!-- Add Button -->
		<div class="col-span-12 flex items-end md:col-span-1">
			<button
				type="button"
				onclick={addTag}
				class="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700"
			>
				Add
			</button>
		</div>
	</div>
</div>

<!-- Tags List -->
{#if tags.length > 0}
	<div class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
		{#each tags as tag, i}
			<div
				class="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800"
			>
				<div
					class="flex h-8 w-8 items-center justify-center rounded p-1.5"
					style="background-color: {tag.color}20; color: {tag.color}"
				>
					{@html getIconSvg(tag.iconName)}
				</div>
				<div class="min-w-0 flex-1">
					<div class="truncate text-sm font-medium">{tag.name}</div>
					<a
						href={tag.url}
						target="_blank"
						rel="noopener noreferrer"
						class="block truncate text-xs text-blue-500 hover:underline"
					>
						Link
					</a>
				</div>
				<button
					type="button"
					onclick={() => removeTag(i)}
					aria-label="Remove Tag"
					class="text-gray-400 hover:text-red-500"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		{/each}
	</div>
{/if}
