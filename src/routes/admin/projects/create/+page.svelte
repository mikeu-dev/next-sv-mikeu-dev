<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	let title = $state('');
	let description = $state('');
	let repoUrl = $state('');
	let demoUrl = $state('');
	let published = $state(false);
	let thumbnailFile: File | null = $state(null);
	let thumbnailPreview = $state('');
	let uploading = $state(false);
	let saving = $state(false);

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			thumbnailFile = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				thumbnailPreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	async function uploadThumbnail(): Promise<string | null> {
		if (!thumbnailFile) return null;

		const formData = new FormData();
		formData.append('file', thumbnailFile);

		const response = await fetch('/api/projects/upload', {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Upload failed');
		}

		const data = await response.json();
		return data.url;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		saving = true;

		try {
			// Upload thumbnail first if exists
			let thumbnailUrl = '';
			if (thumbnailFile) {
				uploading = true;
				thumbnailUrl = (await uploadThumbnail()) || '';
				uploading = false;
			}

			// Create slug from title
			const slug = title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/(^-|-$)/g, '');

			// Save project to Firebase
			const response = await fetch('/api/projects', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title,
					description,
					slug,
					thumbnailUrl,
					repoUrl,
					demoUrl,
					published
				})
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to create project');
			}

			toast.success('Project created successfully!');
			goto('/admin/projects');
		} catch (error: any) {
			toast.error(error.message || 'Failed to create project');
		} finally {
			saving = false;
			uploading = false;
		}
	}
</script>

<div class="container mx-auto max-w-4xl p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">Create New Project</h1>
		<p class="text-muted-foreground">Add a new project to your portfolio</p>
	</div>

	<form onsubmit={handleSubmit} class="space-y-6">
		<!-- Title -->
		<div>
			<label for="title" class="mb-2 block text-sm font-medium">Title</label>
			<input
				id="title"
				type="text"
				bind:value={title}
				required
				class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
				placeholder="My Awesome Project"
			/>
		</div>

		<!-- Description -->
		<div>
			<label for="description" class="mb-2 block text-sm font-medium">Description</label>
			<textarea
				id="description"
				bind:value={description}
				required
				rows="4"
				class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
				placeholder="Describe your project..."
			></textarea>
		</div>

		<!-- Thumbnail Upload -->
		<div>
			<label for="thumbnail" class="mb-2 block text-sm font-medium">Thumbnail Image</label>
			<input
				id="thumbnail"
				type="file"
				accept="image/jpeg,image/png,image/gif,image/webp"
				onchange={handleFileChange}
				class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
			/>
			{#if thumbnailPreview}
				<div class="mt-4">
					<img
						src={thumbnailPreview}
						alt="Thumbnail preview"
						class="h-48 w-auto rounded-lg object-cover"
					/>
				</div>
			{/if}
		</div>

		<!-- Repository URL -->
		<div>
			<label for="repoUrl" class="mb-2 block text-sm font-medium">Repository URL</label>
			<input
				id="repoUrl"
				type="url"
				bind:value={repoUrl}
				class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
				placeholder="https://github.com/username/repo"
			/>
		</div>

		<!-- Demo URL -->
		<div>
			<label for="demoUrl" class="mb-2 block text-sm font-medium">Demo URL</label>
			<input
				id="demoUrl"
				type="url"
				bind:value={demoUrl}
				class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
				placeholder="https://demo.example.com"
			/>
		</div>

		<!-- Published -->
		<div class="flex items-center gap-2">
			<input id="published" type="checkbox" bind:checked={published} class="h-4 w-4" />
			<label for="published" class="text-sm font-medium">Publish immediately</label>
		</div>

		<!-- Submit Button -->
		<div class="flex gap-4">
			<button
				type="submit"
				disabled={saving || uploading}
				class="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
			>
				{#if uploading}
					Uploading image...
				{:else if saving}
					Creating project...
				{:else}
					Create Project
				{/if}
			</button>
			<button
				type="button"
				onclick={() => goto('/admin/projects')}
				class="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
			>
				Cancel
			</button>
		</div>
	</form>
</div>
