<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import IconPicker from '$lib/components/admin/icon-picker.svelte';

	let { data }: { data: PageData } = $props();

	let label = $state(data.link.label);
	let href = $state(data.link.href);
	let iconName = $state(data.link.iconName);
	let color = $state(data.link.color);
	let saving = $state(false);
	let deleting = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		saving = true;

		try {
			// Update the link in the full links array
			const updatedLinks = [...data.allLinks];
			updatedLinks[data.index] = {
				label,
				href,
				iconName,
				color
			};

			const response = await fetch('/api/socials', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ links: updatedLinks })
			});

			if (!response.ok) {
				throw new Error('Failed to update social link');
			}

			toast.success('Social link updated successfully!');
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto(`${base}/admin/socials`);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Failed to update social link';
			toast.error(message);
		} finally {
			saving = false;
		}
	}

	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this social link?')) {
			return;
		}

		deleting = true;

		try {
			// Remove the link from the array
			const updatedLinks = data.allLinks.filter((_: unknown, i: number) => i !== data.index);

			const response = await fetch('/api/socials', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ links: updatedLinks })
			});

			if (!response.ok) {
				throw new Error('Failed to delete social link');
			}

			toast.success('Social link deleted successfully!');
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto(`${base}/admin/socials`);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Failed to delete social link';
			toast.error(message);
		} finally {
			deleting = false;
		}
	}
</script>

<div class="container mx-auto max-w-2xl p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">Edit Social Link</h1>
		<p class="text-muted-foreground">Edit social media link</p>
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
					onclick={() => {
						// eslint-disable-next-line svelte/no-navigation-without-resolve
						goto(`${base}/admin/socials`);
					}}
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
