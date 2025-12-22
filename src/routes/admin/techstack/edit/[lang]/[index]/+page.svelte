<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import IconPicker from '$lib/components/admin/icon-picker.svelte';

	let { data }: { data: PageData } = $props();

	let category = $state(data.category.category);
	let description = $state(data.category.description);
	let items = $state<{ name: string; iconName: string; color: string; url: string }[]>(
		data.category.items.map((item: any) => ({
			name: item.name,
			iconName: item.iconName,
			color: item.color,
			url: item.url
		}))
	);
	let saving = $state(false);

	function addItem() {
		items = [
			...items,
			{
				name: '',
				iconName: 'SiDefault',
				color: '#000000',
				url: ''
			}
		];
	}

	function removeItem(index: number) {
		items = items.filter((_, i) => i !== index);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		saving = true;

		try {
			// Update the category in the full categories array
			const updatedCategories = [...data.allCategories];
			updatedCategories[data.index] = {
				category,
				description,
				items
			};

			const response = await fetch(`/api/techstack/${data.lang}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ categories: updatedCategories })
			});

			if (!response.ok) {
				throw new Error('Failed to update techstack');
			}

			toast.success('Techstack updated successfully!');
			goto('/admin/techstack');
		} catch (error: any) {
			toast.error(error.message || 'Failed to update techstack');
		} finally {
			saving = false;
		}
	}
</script>

<div class="container mx-auto max-w-4xl p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">Edit Techstack Category</h1>
		<p class="text-muted-foreground">
			Editing {data.lang === 'en' ? 'English' : 'Indonesian'} version
		</p>
	</div>

	<form onsubmit={handleSubmit} class="space-y-6">
		<!-- Category Info -->
		<div
			class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
		>
			<h2 class="mb-4 text-xl font-semibold">Category Information</h2>

			<div class="space-y-4">
				<!-- Category Name -->
				<div>
					<label for="category" class="mb-2 block text-sm font-medium">
						Category Name <span class="text-red-500">*</span>
					</label>
					<input
						id="category"
						type="text"
						bind:value={category}
						required
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
						placeholder="e.g., Frontend Development"
					/>
				</div>

				<!-- Description -->
				<div>
					<label for="description" class="mb-2 block text-sm font-medium">
						Description <span class="text-red-500">*</span>
					</label>
					<textarea
						id="description"
						bind:value={description}
						required
						rows="3"
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
						placeholder="Brief description of this category..."
					></textarea>
				</div>
			</div>
		</div>

		<!-- Items -->
		<div
			class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
		>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold">Technologies</h2>
				<button
					type="button"
					onclick={addItem}
					class="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
				>
					+ Add Technology
				</button>
			</div>

			<div class="space-y-4">
				{#each items as item, index (index)}
					<div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
						<div class="mb-3 flex items-center justify-between">
							<span class="text-sm font-medium text-muted-foreground">
								Technology #{index + 1}
							</span>
							<button
								type="button"
								onclick={() => removeItem(index)}
								class="text-sm text-red-600 hover:text-red-700"
							>
								Remove
							</button>
						</div>

						<div class="grid gap-4 md:grid-cols-2">
							<!-- Name -->
							<div>
								<label for="name-{index}" class="mb-2 block text-sm font-medium">
									Name <span class="text-red-500">*</span>
								</label>
								<input
									id="name-{index}"
									type="text"
									bind:value={item.name}
									required
									class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
									placeholder="e.g., React"
								/>
							</div>

							<!-- URL -->
							<div>
								<label for="url-{index}" class="mb-2 block text-sm font-medium">
									URL <span class="text-red-500">*</span>
								</label>
								<input
									id="url-{index}"
									type="url"
									bind:value={item.url}
									required
									class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
									placeholder="https://..."
								/>
							</div>

							<!-- Icon Picker -->
							<div>
								<label for="icon-picker-{index}" class="mb-2 block text-sm font-medium">
									Icon <span class="text-red-500">*</span>
								</label>
								<IconPicker
									id="icon-picker-{index}"
									bind:value={item.iconName}
									color={item.color}
								/>
							</div>

							<!-- Color Picker -->
							<div>
								<label for="color-picker-{index}" class="mb-2 block text-sm font-medium">
									Color <span class="text-red-500">*</span>
								</label>
								<div class="flex gap-2">
									<input
										type="color"
										bind:value={item.color}
										class="h-10 w-20 cursor-pointer rounded-lg border border-gray-300 dark:border-gray-700"
									/>
									<input
										id="color-picker-{index}"
										type="text"
										bind:value={item.color}
										required
										minlength="4"
										maxlength="7"
										class="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
										placeholder="#000000"
									/>
								</div>
							</div>
						</div>
					</div>
				{/each}

				{#if items.length === 0}
					<div
						class="rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-700"
					>
						<p class="text-muted-foreground">No technologies added yet.</p>
						<button
							type="button"
							onclick={addItem}
							class="mt-3 text-sm text-blue-600 hover:text-blue-700"
						>
							Add your first technology
						</button>
					</div>
				{/if}
			</div>
		</div>

		<!-- Actions -->
		<div class="flex gap-4">
			<button
				type="submit"
				disabled={saving}
				class="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
			>
				{saving ? 'Saving...' : 'Save Changes'}
			</button>
			<button
				type="button"
				onclick={() => goto('/admin/techstack')}
				class="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
			>
				Cancel
			</button>
		</div>
	</form>
</div>
