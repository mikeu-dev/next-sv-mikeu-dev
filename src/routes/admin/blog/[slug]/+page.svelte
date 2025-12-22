<script lang="ts">
	import { page } from '$app/stores';
	import BlogPostForm from '$lib/components/admin/blog-post-form.svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let id = $derived($page.params.slug); // Note: We created directory named [slug] but usually refer to it as ID
	let post = $state<any>(null);
	let loading = $state(true);

	onMount(async () => {
		try {
			const response = await fetch(`/api/admin/blog?id=${id}`);
			if (!response.ok) throw new Error('Failed to load post');
			post = await response.json();
		} catch (error: any) {
			toast.error(error.message);
		} finally {
			loading = false;
		}
	});
</script>

<div class="container mx-auto max-w-4xl p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">Edit Post</h1>
		<p class="text-muted-foreground">Edit existing blog post</p>
	</div>

	<div class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
		{#if loading}
			<div class="flex justify-center py-12">Loading...</div>
		{:else if post}
			<BlogPostForm initialData={post} isEditing={true} />
		{:else}
			<div class="py-12 text-center text-red-500">Post not found</div>
		{/if}
	</div>
</div>
