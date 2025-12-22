<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let year = $state(data.item.year);
	let title_id = $state(data.item.title_id || data.item.title);
	let title_en = $state(data.item.title_en || data.item.title);
	let description_id = $state(data.item.description_id || data.item.description);
	let description_en = $state(data.item.description_en || data.item.description);
	let saving = $state(false);
	let deleting = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		saving = true;

		try {
			// Update the item in the full items array
			const updatedItems = [...data.allItems];
			updatedItems[data.index] = {
				year,
				title: data.lang === 'en' ? title_en : title_id,
				description: data.lang === 'en' ? description_en : description_id,
				title_id,
				title_en,
				description_id,
				description_en
			};

			const response = await fetch(`/api/journey/${data.lang}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ items: updatedItems })
			});

			if (!response.ok) {
				throw new Error('Failed to update journey');
			}

			toast.success('Journey updated successfully!');
			goto('/admin/journey');
		} catch (error: any) {
			toast.error(error.message || 'Failed to update journey');
		} finally {
			saving = false;
		}
	}

	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this journey item?')) {
			return;
		}

		deleting = true;

		try {
			// Remove the item from the array
			const updatedItems = data.allItems.filter((_, i) => i !== data.index);

			const response = await fetch(`/api/journey/${data.lang}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ items: updatedItems })
			});

			if (!response.ok) {
				throw new Error('Failed to delete journey');
			}

			toast.success('Journey deleted successfully!');
			goto('/admin/journey');
		} catch (error: any) {
			toast.error(error.message || 'Failed to delete journey');
		} finally {
			deleting = false;
		}
	}
</script>

<div class="container mx-auto max-w-2xl p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">Edit Journey</h1>
		<p class="text-muted-foreground">
			Editing {data.lang === 'en' ? 'English' : 'Indonesian'} version
		</p>
	</div>

	<form onsubmit={handleSubmit} class="space-y-6">
		<div
			class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
		>
			<!-- Year -->
			<div class="mb-4">
				<label for="year" class="mb-2 block text-sm font-medium">
					Year <span class="text-red-500">*</span>
				</label>
				<input
					id="year"
					type="text"
					bind:value={year}
					required
					pattern="^\d{4}$"
					class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
					placeholder="2024"
				/>
			</div>

			<!-- Title Indonesian -->
			<div class="mb-4">
				<label for="title_id" class="mb-2 block text-sm font-medium">
					Title (Indonesian) <span class="text-red-500">*</span>
				</label>
				<input
					id="title_id"
					type="text"
					bind:value={title_id}
					required
					class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
					placeholder="e.g., Lulus dari Universitas"
				/>
			</div>

			<!-- Title English -->
			<div class="mb-4">
				<label for="title_en" class="mb-2 block text-sm font-medium">
					Title (English) <span class="text-red-500">*</span>
				</label>
				<input
					id="title_en"
					type="text"
					bind:value={title_en}
					required
					class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
					placeholder="e.g., Graduated from University"
				/>
			</div>

			<!-- Description Indonesian -->
			<div class="mb-4">
				<label for="description_id" class="mb-2 block text-sm font-medium">
					Description (Indonesian) <span class="text-red-500">*</span>
				</label>
				<textarea
					id="description_id"
					bind:value={description_id}
					required
					rows="3"
					class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
					placeholder="Deskripsi singkat..."
				></textarea>
			</div>

			<!-- Description English -->
			<div class="mb-4">
				<label for="description_en" class="mb-2 block text-sm font-medium">
					Description (English) <span class="text-red-500">*</span>
				</label>
				<textarea
					id="description_en"
					bind:value={description_en}
					required
					rows="3"
					class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
					placeholder="Brief description..."
				></textarea>
			</div>
		</div>

		<!-- Actions -->
		<div class="flex items-center justify-between">
			<button
				type="button"
				onclick={handleDelete}
				disabled={deleting}
				class="rounded-lg border border-red-600 px-6 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950"
			>
				{deleting ? 'Deleting...' : 'Delete'}
			</button>

			<div class="flex gap-4">
				<button
					type="button"
					onclick={() => goto('/admin/journey')}
					class="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={saving}
					class="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
				>
					{saving ? 'Saving...' : 'Save Changes'}
				</button>
			</div>
		</div>
	</form>
</div>
