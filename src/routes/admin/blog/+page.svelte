<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
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
	let activeTab = $state<'en' | 'id'>('en');
	let filterStatus = $state<'all' | 'published' | 'draft'>('all');
	let currentPage = $state(1);
	const pageSize = 9;

	// Computed filtered posts
	let filteredPosts = $derived(() => {
		let result = [...posts]; // Create a copy first to avoid mutation of state

		result = result.filter((p) => p.locale === activeTab);

		// Filter by published status
		if (filterStatus === 'published') {
			result = result.filter((p) => p.published === true);
		} else if (filterStatus === 'draft') {
			result = result.filter((p) => p.published !== true);
		}

		// Use toSorted() if available or sort copy
		return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	});

	let totalPages = $derived(Math.max(1, Math.ceil(filteredPosts().length / pageSize)));

	let paginatedPosts = $derived(() => {
		const start = (currentPage - 1) * pageSize;
		return filteredPosts().slice(start, start + pageSize);
	});

	// Reset to first page whenever the visible set changes
	$effect(() => {
		activeTab;
		filterStatus;
		currentPage = 1;
	});

	onMount(async () => {
		await loadPosts();
	});

	async function loadPosts() {
		try {
			const response = await fetch('/api/admin/blog');
			if (!response.ok) throw new Error('Failed to load posts');
			posts = await response.json();
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Failed to load posts';
			toast.error(message);
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
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Failed to delete post';
			toast.error(message);
		}
	}
</script>

<div class="container mx-auto p-6">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-white">Blog Posts</h1>
			<p class="text-gray-200 dark:text-gray-400">Manage your blog content</p>
		</div>
		<div class="flex gap-2">
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<button
				onclick={() => {
					// eslint-disable-next-line svelte/no-navigation-without-resolve
					goto(`${base}/admin/blog/create`);
				}}
				class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
			>
				+ New Post
			</button>
		</div>
	</div>

	<!-- Language Tabs -->
	<div class="mb-6">
		<div class="flex gap-2 border-b border-gray-300 dark:border-gray-700">
			<button
				onclick={() => (activeTab = 'en')}
				class="px-4 py-2 font-medium transition-colors {activeTab === 'en'
					? 'border-b-2 border-primary text-primary'
					: 'text-gray-200 hover:text-white dark:text-gray-400 dark:hover:text-gray-200'}"
			>
				ðŸ‡¬ðŸ‡§ English
			</button>
			<button
				onclick={() => (activeTab = 'id')}
				class="px-4 py-2 font-medium transition-colors {activeTab === 'id'
					? 'border-b-2 border-primary text-primary'
					: 'text-gray-200 hover:text-white dark:text-gray-400 dark:hover:text-gray-200'}"
			>
				ðŸ‡®ðŸ‡© Indonesia
			</button>
		</div>
	</div>

	<!-- Filters Section -->
	<div class="mb-6 flex flex-wrap gap-4">
		<!-- Language Tabs (Moved to top level) -->
		<!-- Just Status Filter here -->

		<!-- Status Filter -->
		<div class="flex items-center gap-2">
			<span class="text-sm font-medium text-gray-200 dark:text-gray-400">Status:</span>
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
		<div class="mb-4 text-sm text-gray-200 dark:text-gray-400">
			{#if filteredPosts().length > 0}
				Showing {(currentPage - 1) * pageSize + 1}-{Math.min(
					currentPage * pageSize,
					filteredPosts().length
				)} of {filteredPosts().length} posts
			{:else}
				Showing 0 of {posts.length} posts
			{/if}
		</div>
	{/if}

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="text-gray-200 dark:text-gray-400">Loading posts...</div>
		</div>
	{:else if posts.length === 0}
		<div class="flex flex-col items-center justify-center py-12">
			<p class="mb-4 text-gray-200 dark:text-gray-400">No posts yet</p>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<button
				onclick={() => {
					// eslint-disable-next-line svelte/no-navigation-without-resolve
					goto(`${base}/admin/blog/create`);
				}}
				class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
			>
				Create your first post
			</button>
		</div>
	{:else if filteredPosts().length === 0}
		<div class="flex flex-col items-center justify-center py-12">
			<p class="mb-4 text-gray-200 dark:text-gray-400">No posts match the selected filters</p>
			<button
				onclick={() => {
					filterStatus = 'all';
				}}
				class="rounded-lg border border-gray-300 px-4 py-2 text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
			>
				Clear Filters
			</button>
		</div>
	{:else}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each paginatedPosts() as post (post.id)}
				<div
					class="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
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

						<p class="mb-4 line-clamp-3 text-sm text-gray-500 dark:text-gray-400">
							{post.description}
						</p>

						<div class="mb-4 text-xs text-gray-500 dark:text-gray-400">
							{post.date} &bull; {post.slug}
						</div>
					</div>

					<div class="flex gap-2 border-t border-gray-100 p-4 dark:border-gray-800">
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
						<button
							onclick={() => {
								// eslint-disable-next-line svelte/no-navigation-without-resolve
								goto(`${base}/admin/blog/${post.id}`);
							}}
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

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="mt-8 flex items-center justify-center gap-2">
				<button
					onclick={() => (currentPage = Math.max(1, currentPage - 1))}
					disabled={currentPage === 1}
					class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
				>
					Previous
				</button>

				{#each Array(totalPages) as _, i (i)}
					<button
						onclick={() => (currentPage = i + 1)}
						class="h-9 w-9 rounded-lg text-sm {currentPage === i + 1
							? 'bg-blue-600 text-white'
							: 'border border-gray-300 text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800'}"
					>
						{i + 1}
					</button>
				{/each}

				<button
					onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
					disabled={currentPage === totalPages}
					class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
				>
					Next
				</button>
			</div>
		{/if}
	{/if}
</div>
