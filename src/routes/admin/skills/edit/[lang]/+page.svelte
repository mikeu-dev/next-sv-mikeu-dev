<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let items = $state([...data.items]);
	let saving = $state(false);

	function addSkill() {
		items = [...items, ''];
	}

	function removeSkill(index: number) {
		items = items.filter((_, i) => i !== index);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		// Filter out empty skills
		const filteredItems = items.filter((skill) => skill.trim() !== '');

		if (filteredItems.length === 0) {
			toast.error('Please add at least one skill');
			return;
		}

		saving = true;

		try {
			const response = await fetch(`/api/skills/${data.lang}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ items: filteredItems })
			});

			if (!response.ok) {
				throw new Error('Failed to update skills');
			}

			toast.success('Skills updated successfully!');
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto(`${base}/admin/skills`);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Failed to update skills';
			toast.error(message);
		} finally {
			saving = false;
		}
	}
</script>

<div class="container mx-auto max-w-2xl p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">Edit Skills</h1>
		<p class="text-muted-foreground">
			Editing {data.lang === 'en' ? 'English' : 'Indonesian'} version
		</p>
	</div>

	<form onsubmit={handleSubmit} class="space-y-6">
		<div
			class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
		>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold">Skills List</h2>
				<button
					type="button"
					onclick={addSkill}
					class="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
				>
					+ Add Skill
				</button>
			</div>

			<div class="space-y-3">
				<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
				{#each items as _, index (index)}
					<div class="flex gap-2">
						<input
							type="text"
							bind:value={items[index]}
							placeholder="e.g., JavaScript, Python, etc."
							class="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
						/>
						<button
							type="button"
							onclick={() => removeSkill(index)}
							class="rounded-lg border border-red-600 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
						>
							Remove
						</button>
					</div>
				{/each}

				{#if items.length === 0}
					<div
						class="rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-700"
					>
						<p class="text-muted-foreground">No skills added yet.</p>
						<button
							type="button"
							onclick={addSkill}
							class="mt-3 text-sm text-blue-600 hover:text-blue-700"
						>
							Add your first skill
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
				onclick={() => {
					// eslint-disable-next-line svelte/no-navigation-without-resolve
					goto(`${base}/admin/skills`);
				}}
				class="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
			>
				Cancel
			</button>
		</div>
	</form>
</div>
