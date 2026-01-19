<script lang="ts">
	import { page } from '$app/stores';
	import BlogPostForm from '$lib/components/admin/blog-post-form.svelte';

	let initialData = $derived({
		slug: $page.url.searchParams.get('slug') || '',
		locale: $page.url.searchParams.get('locale') || 'en',
		title: $page.url.searchParams.get('title') || ''
	});
</script>

<div class="container mx-auto max-w-4xl p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">Create New Post</h1>
		<p class="text-muted-foreground">Write a new blog post</p>
	</div>

	<div class="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
		<BlogPostForm {initialData} />
	</div>
</div>
