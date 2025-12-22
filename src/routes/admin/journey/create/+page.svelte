<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';

	const lang = $page.url.searchParams.get('lang') || 'en';

	let year = $state('');
	let title_id = $state('');
	let title_en = $state('');
	let description_id = $state('');
	let description_en = $state('');
	let saving = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		saving = true;

		try {
			// Fetch current journey data
			const response = await fetch(`/api/journey?lang=${lang}`);
			if (!response.ok) throw new Error('Failed to load journey');

			const currentData = await response.json();

			// Add new item
			const newItem = {
				year,
				title: lang === 'en' ? title_en : title_id,
				description: lang === 'en' ? description_en : description_id,
				title_id,
				title_en,
				description_id,
				description_en
			};

			const updatedItems = [...currentData.items, newItem];

			// Save back
			const saveResponse = await fetch(`/api/journey/${lang}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ items: updatedItems })
			});

			if (!saveResponse.ok) {
				throw new Error('Failed to create journey');
			}

			toast.success('Journey created successfully!');
			goto('/admin/journey');
		} catch (error: any) {
			toast.error(error.message || 'Failed to create journey');
		} finally {
			saving = false;
		}
	}
</script>

<div class="container mx-auto max-w-2xl p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">Add Journey</h1>
		<p class="text-muted-foreground">
			Adding to {lang === 'en' ? 'English' : 'Indonesian'} version
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
		<div class="flex gap-4">
			<button
				type="submit"
				disabled={saving}
				class="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
			>
				{saving ? 'Creating...' : 'Create Journey'}
			</button>
			<button
				type="button"
				onclick={() => goto('/admin/journey')}
				class="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
			>
				Cancel
			</button>
		</div>
	</form>
</div>
