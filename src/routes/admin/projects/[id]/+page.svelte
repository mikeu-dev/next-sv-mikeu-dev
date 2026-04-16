<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import MarkdownEditor from '$lib/components/admin/markdown-editor.svelte';
	import TagEditor from '$lib/components/admin/tag-editor.svelte';
	import AIAssist from '$lib/components/admin/ai-assist.svelte';
	import type { SerializedTag } from '$lib/types';

	let { data }: { data: PageData } = $props();

	// Handle legacy data structure
	const project = data.project as Record<string, unknown>;

	let title_id = $state(data.project.title_id || project.title || '');
	let title_en = $state(data.project.title_en || project.title || '');
	let description_id = $state(data.project.description_id || project.description || '');
	let description_en = $state(data.project.description_en || project.description || '');
	let content = $state(data.project.content || '');
	let repoUrl = $state(data.project.repoUrl || '');
	let demoUrl = $state(data.project.demoUrl || '');
	let published = $state(data.project.published || false);
	let pinned = $state(data.project.pinned || false);
	let tags = $state<SerializedTag[]>((data.project.tags as SerializedTag[]) || []);
	let thumbnailFile: File | null = $state(null);
	let thumbnailPreview = $state(data.project.thumbnailUrl || project.thumbnail || '');
	let imageFiles: File[] = $state([]);
	let imagePreviews: string[] = $state(data.project.imagesUrl || project.images || []);
	let uploading = $state(false);
	let saving = $state(false);
	let analyzingRepo = $state(false);
	let activeTab = $state<'id' | 'en'>('id');

	function handleThumbnailChange(e: Event) {
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

	function handleImagesChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = Array.from(target.files || []);
		if (files.length > 0) {
			imageFiles = [...imageFiles, ...files];
			files.forEach((file) => {
				const reader = new FileReader();
				reader.onload = (e) => {
					imagePreviews = [...imagePreviews, e.target?.result as string];
				};
				reader.readAsDataURL(file);
			});
		}
	}

	async function handleAnalyzeRepo() {
		if (!repoUrl) {
			toast.error('Please enter a repository URL first');
			return;
		}

		analyzingRepo = true;
		try {
			const response = await fetch('/api/admin/ai/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'analyzeRepo',
					payload: { repoUrl }
				})
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to analyze repository');
			}

			const data = await response.json();
			const result = data.result;

			// Populate form fields
			title_id = result.title_id;
			title_en = result.title_en;
			description_id = result.description_id;
			description_en = result.description_en;
			content = result.content;

			if (result.tags && Array.isArray(result.tags)) {
				const newTags = result.tags.map((tag: string) => ({
					name: tag,
					color: 'blue',
					url: '#'
				}));
				tags = newTags;
			}

			toast.success('Project data updated from repository!');
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Analysis failed';
			toast.error(message);
		} finally {
			analyzingRepo = false;
		}
	}

	function removeImage(index: number) {
		// Check if it's an existing image (URL) or new file (blob URL)
		const isExistingImage = imagePreviews[index].startsWith('http');

		if (isExistingImage) {
			// Remove from previews only
			imagePreviews = imagePreviews.filter((_, i) => i !== index);
		} else {
			// Remove from both files and previews
			const fileIndex = imagePreviews.slice(0, index).filter((p) => !p.startsWith('http')).length;
			imageFiles = imageFiles.filter((_, i) => i !== fileIndex);
			imagePreviews = imagePreviews.filter((_, i) => i !== index);
		}
	}

	async function uploadFile(file: File): Promise<string | null> {
		const formData = new FormData();
		formData.append('file', file);

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
			// Upload new thumbnail if changed
			uploading = true;
			let thumbnailUrl = data.project.thumbnailUrl || '';
			if (thumbnailFile) {
				thumbnailUrl = (await uploadFile(thumbnailFile)) || '';
			}

			// Upload new images if any
			let newImageUrls: string[] = [];
			if (imageFiles.length > 0) {
				const uploadPromises = imageFiles.map((file) => uploadFile(file));
				const results = await Promise.all(uploadPromises);
				newImageUrls = results.filter((url): url is string => url !== null);
			}

			// Combine existing images (URLs) with new uploaded images
			const existingImages = imagePreviews.filter((p) => p.startsWith('http'));
			const allImages = [...existingImages, ...newImageUrls];

			uploading = false;

			// Update project
			const response = await fetch(`/api/projects/${data.project.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title_id,
					title_en,
					description_id,
					description_en,
					content: content || undefined,
					slug: data.project.slug, // Keep existing slug
					thumbnailUrl: thumbnailUrl || undefined,
					imagesUrl: allImages.length > 0 ? allImages : undefined,
					repoUrl: repoUrl || undefined,
					demoUrl: demoUrl || undefined,
					published,
					pinned,
					tags
				})
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to update project');
			}

			toast.success('Project updated successfully!');
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto(`${base}/admin/projects`);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Failed to update project';
			toast.error(message);
		} finally {
			saving = false;
			uploading = false;
		}
	}

	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
			return;
		}

		try {
			const response = await fetch(`/api/projects/${data.project.id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error('Failed to delete project');
			}

			toast.success('Project deleted successfully!');
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto(`${base}/admin/projects`);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Failed to delete project';
			toast.error(message);
		}
	}
</script>

<div class="container mx-auto max-w-4xl p-6">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Edit Project</h1>
			<p class="text-muted-foreground">Update project information</p>
		</div>
		<button
			type="button"
			onclick={handleDelete}
			class="rounded-lg border border-red-600 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
		>
			Delete Project
		</button>
	</div>

	<form
		onsubmit={handleSubmit}
		class="space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
	>
		<!-- Language Tabs -->
		<div class="flex gap-2 border-b border-gray-200 dark:border-gray-700">
			<button
				type="button"
				onclick={() => (activeTab = 'id')}
				class="px-4 py-2 text-sm font-medium transition-colors {activeTab === 'id'
					? 'border-b-2 border-blue-600 text-blue-600'
					: 'text-muted-foreground hover:text-foreground'}"
			>
				🇮🇩 Indonesia
			</button>
			<button
				type="button"
				onclick={() => (activeTab = 'en')}
				class="px-4 py-2 text-sm font-medium transition-colors {activeTab === 'en'
					? 'border-b-2 border-blue-600 text-blue-600'
					: 'text-muted-foreground hover:text-foreground'}"
			>
				🇬🇧 English
			</button>
		</div>

		<!-- Indonesian Fields -->
		{#if activeTab === 'id'}
			<div class="space-y-4">
				<!-- Title ID -->
				<div>
					<div class="flex items-center justify-between gap-2">
						<label for="title_id" class="mb-2 block text-sm font-medium">
							Judul (Indonesia) <span class="text-red-500">*</span>
						</label>
						<AIAssist
							locale="id"
							type="title"
							bind:targetValue={title_id}
							onApply={(val) => (title_id = val)}
						/>
					</div>
					<input
						id="title_id"
						type="text"
						bind:value={title_id}
						required
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
						placeholder="Proyek Saya"
					/>
				</div>

				<!-- Description ID -->
				<div>
					<div class="flex items-center justify-between gap-2">
						<label for="description_id" class="mb-2 block text-sm font-medium">
							Deskripsi (Indonesia) <span class="text-red-500">*</span>
						</label>
						<AIAssist
							context={title_id}
							locale="id"
							type="description"
							bind:targetValue={description_id}
							onApply={(val) => (description_id = val)}
						/>
					</div>
					<textarea
						id="description_id"
						bind:value={description_id}
						required
						rows="4"
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
						placeholder="Deskripsi proyek Anda..."
					></textarea>
				</div>
			</div>
		{/if}

		<!-- English Fields -->
		{#if activeTab === 'en'}
			<div class="space-y-4">
				<!-- Title EN -->
				<div>
					<div class="flex items-center justify-between gap-2">
						<label for="title_en" class="mb-2 block text-sm font-medium">
							Title (English) <span class="text-red-500">*</span>
						</label>
						<AIAssist
							locale="en"
							type="title"
							bind:targetValue={title_en}
							onApply={(val) => (title_en = val)}
						/>
					</div>
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
					<div class="flex items-center justify-between gap-2">
						<label for="description_en" class="mb-2 block text-sm font-medium">
							Description (English) <span class="text-red-500">*</span>
						</label>
						<AIAssist
							context={title_en}
							locale="en"
							type="description"
							bind:targetValue={description_en}
							onApply={(val) => (description_en = val)}
						/>
					</div>
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

		<!-- Content (Optional) -->
		<div>
			<div class="flex items-center justify-between gap-2">
				<label for="content" class="mb-2 block text-sm font-medium">
					Content (Optional Markdown)
				</label>
				<AIAssist
					context={activeTab === 'en' ? title_en : title_id}
					locale={activeTab}
					type="content"
					bind:targetValue={content}
					onApply={(val) => (content = val)}
				/>
			</div>
			<MarkdownEditor
				id="content"
				bind:value={content}
				placeholder="# Project Details

Write detailed content in Markdown format..."
			/>
		</div>

		<!-- Tags -->
		<div>
			<div class="flex items-center justify-between gap-2">
				<label for="tags" class="mb-2 block text-sm font-medium"> Tags / Tech Stack </label>
				<AIAssist
					context={title_en || title_id}
					targetValue={description_en || description_id}
					type="tags"
					onApplyTags={(newTags) => {
						const formattedTags = newTags.map((tag) => ({ name: tag, color: 'blue', url: '#' }));
						tags = [...tags, ...formattedTags];
					}}
				/>
			</div>
			<TagEditor bind:tags />
		</div>

		<!-- Thumbnail Upload -->
		<div>
			<label for="thumbnail" class="mb-2 block text-sm font-medium">Thumbnail Image</label>
			<input
				id="thumbnail"
				type="file"
				accept="image/jpeg,image/png,image/gif,image/webp"
				onchange={handleThumbnailChange}
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

		<!-- Multiple Images Upload -->
		<div>
			<label for="images" class="mb-2 block text-sm font-medium">
				Additional Images (Optional)
			</label>
			<input
				id="images"
				type="file"
				accept="image/jpeg,image/png,image/gif,image/webp"
				multiple
				onchange={handleImagesChange}
				class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
			/>
			{#if imagePreviews.length > 0}
				<div class="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
					{#each imagePreviews as preview, index (index)}
						<div class="relative">
							<img
								src={preview}
								alt="Image preview {index + 1}"
								class="h-32 w-full rounded-lg object-cover"
							/>
							<button
								type="button"
								onclick={() => removeImage(index)}
								aria-label="Remove image {index + 1}"
								class="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fill-rule="evenodd"
										d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
										clip-rule="evenodd"
									/>
								</svg>
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Repository URL -->
		<div>
			<div class="flex items-center justify-between gap-2">
				<label for="repoUrl" class="mb-2 block text-sm font-medium">Repository URL</label>
				<button
					type="button"
					onclick={handleAnalyzeRepo}
					disabled={analyzingRepo || !repoUrl}
					class="flex items-center gap-1.5 rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 transition-all hover:bg-purple-200 disabled:opacity-50 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
				>
					{#if analyzingRepo}
						<svg class="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
								fill="none"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Analyzing...
					{:else}
						<svg
							class="h-3.5 w-3.5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path
								d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"
							></path>
							<path d="M5 3v4"></path>
							<path d="M19 17v4"></path>
							<path d="M3 5h4"></path>
							<path d="M17 19h4"></path>
						</svg>
						AI Reference
					{/if}
				</button>
			</div>
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

		<!-- Published & Pinned -->
		<div class="flex flex-col gap-3">
			<div class="flex items-center gap-2">
				<input id="published" type="checkbox" bind:checked={published} class="h-4 w-4" />
				<label for="published" class="text-sm font-medium">Published</label>
			</div>
			<div class="flex items-center gap-2">
				<input id="pinned" type="checkbox" bind:checked={pinned} class="h-4 w-4" />
				<label for="pinned" class="text-sm font-medium"> Pin to top (featured project) </label>
			</div>
		</div>

		<!-- Submit Buttons -->
		<div class="flex gap-4">
			<button
				type="submit"
				disabled={saving || uploading}
				class="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
			>
				{#if uploading}
					Uploading images...
				{:else if saving}
					Updating project...
				{:else}
					Update Project
				{/if}
			</button>
			<button
				type="button"
				onclick={() => {
					// eslint-disable-next-line svelte/no-navigation-without-resolve
					goto(`${base}/admin/projects`);
				}}
				class="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
			>
				Cancel
			</button>
		</div>
	</form>
</div>
