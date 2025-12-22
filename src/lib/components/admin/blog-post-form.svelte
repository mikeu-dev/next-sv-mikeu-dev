<script lang="ts">
	import { toast } from 'svelte-sonner';
	import MarkdownEditor from '$lib/components/admin/markdown-editor.svelte';
	import { goto } from '$app/navigation';

	interface BlogPost {
		id?: string;
		slug: string;
		locale: string;
		title: string;
		description: string;
		date: string;
		published: boolean;
		content: string;
	}

	let { initialData = null, isEditing = false } = $props<{
		initialData?: BlogPost | null;
		isEditing?: boolean;
	}>();

	let formData = $state<BlogPost>({
		slug: '',
		locale: 'en',
		title: '',
		description: '',
		date: new Date().toISOString().split('T')[0],
		published: false,
		content: '',
		...initialData
	});

	let loading = $state(false);

	function generateSlug() {
		if (!formData.title) return;

		formData.slug = formData.title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}

	async function handleSubmit() {
		if (!formData.title || !formData.slug || !formData.content) {
			toast.error('Please fill in all required fields');
			return;
		}

		loading = true;

		try {
			const url = '/api/admin/blog';
			const method = isEditing ? 'PUT' : 'POST';

			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to save post');
			}

			toast.success(isEditing ? 'Post updated successfully' : 'Post created successfully');
			goto('/admin/blog');
		} catch (error: any) {
			toast.error(error.message);
		} finally {
			loading = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="grid gap-6 md:grid-cols-2">
		<!-- Main Info -->
		<div class="space-y-4">
			<div>
				<label for="title" class="mb-1 block text-sm font-medium">Title</label>
				<input
					type="text"
					id="title"
					bind:value={formData.title}
					oninput={() => !isEditing && generateSlug()}
					class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
					placeholder="Enter post title"
				/>
			</div>

			<div>
				<label for="slug" class="mb-1 block text-sm font-medium">Slug</label>
				<div class="flex">
					<input
						type="text"
						id="slug"
						bind:value={formData.slug}
						class="w-full flex-1 rounded-l-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
						placeholder="url-slug"
					/>
					<button
						type="button"
						onclick={generateSlug}
						class="rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
						title="Regenerate slug from title"
					>
						🔄
					</button>
				</div>
			</div>

			<div>
				<label for="description" class="mb-1 block text-sm font-medium">Description</label>
				<textarea
					id="description"
					bind:value={formData.description}
					rows="3"
					class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
					placeholder="Short description for SEO and lists"
				></textarea>
			</div>
		</div>

		<!-- Meta Info -->
		<div class="space-y-4">
			<div>
				<label for="locale" class="mb-1 block text-sm font-medium">Language</label>
				<select
					id="locale"
					bind:value={formData.locale}
					class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
				>
					<option value="en">🇬🇧 English</option>
					<option value="id">🇮🇩 Indonesia</option>
				</select>
			</div>

			<div>
				<label for="date" class="mb-1 block text-sm font-medium">Date</label>
				<input
					type="date"
					id="date"
					bind:value={formData.date}
					class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
				/>
			</div>

			<div class="flex items-center gap-2 pt-6">
				<input
					type="checkbox"
					id="published"
					bind:checked={formData.published}
					class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
				/>
				<label for="published" class="text-sm font-medium"> Published </label>
			</div>
		</div>
	</div>

	<!-- Content Editor -->
	<div>
		<label for="content" class="mb-1 block text-sm font-medium">Content</label>
		<MarkdownEditor
			bind:value={formData.content}
			placeholder="Write your blog post content here..."
		/>
	</div>

	<!-- Actions -->
	<div
		class="flex items-center justify-end gap-4 border-t border-gray-200 pt-6 dark:border-gray-800"
	>
		<button
			type="button"
			onclick={() => goto('/admin/blog')}
			class="rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
		>
			Cancel
		</button>
		<button
			type="button"
			onclick={handleSubmit}
			disabled={loading}
			class="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
		>
			{loading ? 'Saving...' : 'Save Post'}
		</button>
	</div>
</div>
