<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	let title_id = $state('');
	let title_en = $state('');
	let description_id = $state('');
	let description_en = $state('');
	let repoUrl = $state('');
	let demoUrl = $state('');
	let published = $state(false);
	let thumbnailFile: File | null = $state(null);
	let thumbnailPreview = $state('');
	let uploading = $state(false);
	let saving = $state(false);
	let activeTab = $state<'id' | 'en'>('id');

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

			// Create slug from English title
			const slug = title_en
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/(^-|-$)/g, '');

			// Save project to Firebase
			const response = await fetch('/api/projects', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title_id,
					title_en,
					description_id,
					description_en,
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
		<!-- Language Tabs -->
		<div class="mb-6">
			<div class="flex gap-2 border-b border-gray-300 dark:border-gray-700">
				<button
					type="button"
					onclick={() => (activeTab = 'id')}
					class="px-4 py-2 font-medium transition-colors {activeTab === 'id'
						? 'border-b-2 border-blue-600 text-blue-600'
						: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}"
				>
					🇮🇩 Indonesia
				</button>
				<button
					type="button"
					onclick={() => (activeTab = 'en')}
					class="px-4 py-2 font-medium transition-colors {activeTab === 'en'
						? 'border-b-2 border-blue-600 text-blue-600'
						: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}"
				>
					🇬🇧 English
				</button>
			</div>
		</div>

		<!-- Indonesian Fields -->
		{#if activeTab === 'id'}
			<div class="space-y-4">
				<!-- Title ID -->
				<div>
					<label for="title_id" class="mb-2 block text-sm font-medium">
						Judul (Indonesia) <span class="text-red-500">*</span>
					</label>
					<input
						id="title_id"
						type="text"
						bind:value={title_id}
						required
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
						placeholder="Proyek Keren Saya"
					/>
				</div>

				<!-- Description ID -->
				<div>
					<label for="description_id" class="mb-2 block text-sm font-medium">
						Deskripsi (Indonesia) <span class="text-red-500">*</span>
					</label>
					<textarea
						id="description_id"
						bind:value={description_id}
						required
						rows="4"
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
						placeholder="Jelaskan proyek Anda..."
					></textarea>
				</div>
			</div>
		{/if}

		<!-- English Fields -->
		{#if activeTab === 'en'}
			<div class="space-y-4">
				<!-- Title EN -->
				<div>
					<label for="title_en" class="mb-2 block text-sm font-medium">
						Title (English) <span class="text-red-500">*</span>
					</label>
					<input
						id="title_en"
						type="text"
						bind:value={title_en}
						required
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
						placeholder="My Awesome Project"
					/>
				</div>

				<!-- Description EN -->
				<div>
					<label for="description_en" class="mb-2 block text-sm font-medium">
						Description (English) <span class="text-red-500">*</span>
					</label>
					<textarea
						id="description_en"
						bind:value={description_en}
						required
						rows="4"
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
						placeholder="Describe your project..."
					></textarea>
				</div>
			</div>
		{/if}

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
