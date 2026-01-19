<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	interface BlogPost {
		id: string;
		slug: string;
		locale: string;
		title: string;
		description: string;
		date: string;
		published: boolean;
		content: string;
	}

	let posts = $state<BlogPost[]>([]);
	let loading = $state(true);
	let filterLocale = $state<'all' | 'en' | 'id'>('all');
	let filterStatus = $state<'all' | 'published' | 'draft'>('all');

	// Computed filtered posts
	// Computed filtered posts
	let filteredPosts = $derived(() => {
		let result = [...posts]; // Create a copy first to avoid mutation of state

		// Filter by locale
		if (filterLocale !== 'all') {
			result = result.filter((p) => p.locale === filterLocale);
		}

		// Filter by published status
		if (filterStatus === 'published') {
			result = result.filter((p) => p.published === true);
		} else if (filterStatus === 'draft') {
			result = result.filter((p) => p.published !== true);
		}

		// Use toSorted() if available or sort copy
		return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	});

	onMount(async () => {
		await loadPosts();
	});

	async function loadPosts() {
		try {
			const response = await fetch('/api/admin/blog');
			if (!response.ok) throw new Error('Failed to load posts');
			posts = await response.json();
		} catch (error: any) {
			toast.error(error.message || 'Failed to load posts');
		} finally {
			loading = false;
		}
	}

	async function deletePost(id: string) {
		if (!confirm('Are you sure you want to delete this post?')) return;

		try {
			const response = await fetch(`/api/admin/blog?id=${id}`, {
				method: 'DELETE'
			});

			if (!response.ok) throw new Error('Failed to delete post');

			toast.success('Post deleted successfully');
			await loadPosts();
		} catch (error: any) {
			toast.error(error.message || 'Failed to delete post');
		}
	}
</script>

<div class="container mx-auto p-6">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Blog Posts</h1>
			<p class="text-muted-foreground">Manage your blog content</p>
		</div>
		<div class="flex gap-2">
			<button
				onclick={() => goto('/admin/blog/create')}
				class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
			>
				+ New Post
			</button>
		</div>
	</div>

	<!-- Filters Section -->
	<div class="mb-6 flex flex-wrap gap-4">
		<!-- Locale Filter -->
		<div class="flex items-center gap-2">
			<span class="text-sm font-medium text-muted-foreground">Locale:</span>
			<div class="flex gap-1">
				<button
					onclick={() => (filterLocale = 'all')}
					class="rounded-lg px-3 py-1.5 text-sm {filterLocale === 'all'
						? 'bg-blue-600 text-white'
						: 'border border-gray-300 dark:border-gray-700'}"
				>
					All
				</button>
				<button
					onclick={() => (filterLocale = 'en')}
					class="rounded-lg px-3 py-1.5 text-sm {filterLocale === 'en'
						? 'bg-blue-600 text-white'
						: 'border border-gray-300 dark:border-gray-700'}"
				>
					🇬🇧 EN
				</button>
				<button
					onclick={() => (filterLocale = 'id')}
					class="rounded-lg px-3 py-1.5 text-sm {filterLocale === 'id'
						? 'bg-blue-600 text-white'
						: 'border border-gray-300 dark:border-gray-700'}"
				>
					🇮🇩 ID
				</button>
			</div>
		</div>

		<!-- Status Filter -->
		<div class="flex items-center gap-2">
			<span class="text-sm font-medium text-muted-foreground">Status:</span>
			<div class="flex gap-1">
				<button
					onclick={() => (filterStatus = 'all')}
					class="rounded-lg px-3 py-1.5 text-sm {filterStatus === 'all'
						? 'bg-blue-600 text-white'
						: 'border border-gray-300 dark:border-gray-700'}"
				>
					All
				</button>
				<button
					onclick={() => (filterStatus = 'published')}
					class="rounded-lg px-3 py-1.5 text-sm {filterStatus === 'published'
						? 'bg-green-600 text-white'
						: 'border border-gray-300 dark:border-gray-700'}"
				>
					Published
				</button>
				<button
					onclick={() => (filterStatus = 'draft')}
					class="rounded-lg px-3 py-1.5 text-sm {filterStatus === 'draft'
						? 'bg-gray-600 text-white'
						: 'border border-gray-300 dark:border-gray-700'}"
				>
					Draft
				</button>
			</div>
		</div>
	</div>

	<!-- Results Count -->
	{#if !loading && posts.length > 0}
		<div class="mb-4 text-sm text-muted-foreground">
			Showing {filteredPosts().length} of {posts.length} posts
		</div>
	{/if}

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-muted-foreground">Loading posts...</div>
		</div>
	{:else if posts.length === 0}
		<div class="flex flex-col items-center justify-center py-12">
			<p class="mb-4 text-muted-foreground">No posts yet</p>
			<button
				onclick={() => goto('/admin/blog/create')}
				class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
			>
				Create your first post
			</button>
		</div>
	{:else if filteredPosts().length === 0}
		<div class="flex flex-col items-center justify-center py-12">
			<p class="mb-4 text-muted-foreground">No posts match the selected filters</p>
			<button
				onclick={() => {
					filterStatus = 'all';
					filterLocale = 'all';
				}}
				class="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
			>
				Clear Filters
			</button>
		</div>
	{:else}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredPosts() as post (post.id)}
				<div
					class="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
				>
					<div class="flex-1 p-4">
						<div class="mb-2 flex items-start justify-between gap-2">
							<span class="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">
								{post.locale.toUpperCase()}
							</span>
							<div class="flex flex-col gap-1">
								{#if post.published}
									<span
										class="rounded bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200"
									>
										Published
									</span>
								{:else}
									<span
										class="rounded bg-gray-100 px-2 py-1 text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200"
									>
										Draft
									</span>
								{/if}
							</div>
						</div>

						<h3 class="mb-2 line-clamp-2 text-lg font-semibold">
							{post.title}
						</h3>

						<p class="mb-4 line-clamp-3 text-sm text-muted-foreground">
							{post.description}
						</p>

						<div class="mb-4 text-xs text-muted-foreground">
							{post.date} &bull; {post.slug}
						</div>
					</div>

					<div class="flex gap-2 border-t border-gray-100 p-4 dark:border-gray-800">
						<button
							onclick={() => goto(`/admin/blog/${post.id}`)}
							class="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
						>
							Edit
						</button>
						<button
							onclick={() => deletePost(post.id)}
							class="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
						>
							Delete
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
