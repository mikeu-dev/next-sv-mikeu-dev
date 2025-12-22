<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import IconPicker from '$lib/components/admin/icon-picker.svelte';

	let label = $state('');
	let href = $state('');
	let iconName = $state('SiDefault');
	let color = $state('#000000');
	let saving = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		saving = true;

		try {
			// Fetch current socials data
			const response = await fetch('/api/socials');
			if (!response.ok) throw new Error('Failed to load socials');

			const currentData = await response.json();

			// Add new link
			const newLink = {
				label,
				href,
				iconName,
				color
			};

			const updatedLinks = [...currentData.links, newLink];

			// Save back
			const saveResponse = await fetch('/api/socials', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ links: updatedLinks })
			});

			if (!saveResponse.ok) {
				throw new Error('Failed to create social link');
			}

			toast.success('Social link created successfully!');
			goto('/admin/socials');
		} catch (error: any) {
			toast.error(error.message || 'Failed to create social link');
		} finally {
			saving = false;
		}
	}
</script>

<div class="container mx-auto max-w-2xl p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">Add Social Link</h1>
		<p class="text-muted-foreground">Add a new social media link</p>
	</div>

	<form onsubmit={handleSubmit} class="space-y-6">
		<div
			class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
		>
			<!-- Label -->
			<div class="mb-4">
				<label for="label" class="mb-2 block text-sm font-medium">
					Label <span class="text-red-500">*</span>
				</label>
				<input
					id="label"
					type="text"
					bind:value={label}
					required
					class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
					placeholder="e.g., GitHub, LinkedIn, Twitter"
				/>
			</div>

			<!-- URL -->
			<div class="mb-4">
				<label for="href" class="mb-2 block text-sm font-medium">
					URL <span class="text-red-500">*</span>
				</label>
				<input
					id="href"
					type="url"
					bind:value={href}
					required
					class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
					placeholder="https://..."
				/>
			</div>

			<!-- Icon Picker -->
			<div class="mb-4">
				<label for="icon-picker" class="mb-2 block text-sm font-medium">
					Icon <span class="text-red-500">*</span>
				</label>
				<IconPicker id="icon-picker" bind:value={iconName} {color} />
			</div>

			<!-- Color Picker -->
			<div class="mb-4">
				<label for="color-picker" class="mb-2 block text-sm font-medium">
					Color <span class="text-red-500">*</span>
				</label>
				<div class="flex gap-2">
					<input
						type="color"
						bind:value={color}
						class="h-10 w-20 cursor-pointer rounded-lg border border-gray-300 dark:border-gray-700"
					/>
					<input
						id="color-picker"
						type="text"
						bind:value={color}
						required
						minlength="4"
						maxlength="7"
						class="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
						placeholder="#000000"
					/>
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="flex gap-4">
			<button
				type="submit"
				disabled={saving}
				class="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
			>
				{saving ? 'Creating...' : 'Create Social Link'}
			</button>
			<button
				type="button"
				onclick={() => goto('/admin/socials')}
				class="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
			>
				Cancel
			</button>
		</div>
	</form>
</div>
