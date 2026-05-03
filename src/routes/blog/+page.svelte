<script lang="ts">
	import { m } from '@/lib/paraglide/messages';
	import type { PageData } from './$types';
	import BlogCard from '$lib/components/guest/blog/blog-card.svelte';
	import BlogFeatured from '$lib/components/guest/blog/blog-featured.svelte';
	import SEO from '$lib/components/seo/seo.svelte';
	import { onMount } from 'svelte';
	import gsap from 'gsap';

	import { Search, X, Loader2 } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();

	// Reactive state for posts and pagination
	let allPosts = $state(data.posts);
	let nextCursor = $state(data.nextCursor);
	let isLoadingMore = $state(false);

	// Sync with server data on initial load or when data changes (e.g. search)
	$effect(() => {
		allPosts = data.posts;
		nextCursor = data.nextCursor;
	});

	// State for category filtering
	let selectedCategory = $state('All');

	// Get unique categories from currently loaded posts
	const categories = $derived(['All', ...new Set(allPosts.flatMap((post) => post.tags || []))]);

	// Filtered posts
	const filteredPosts = $derived(
		selectedCategory === 'All'
			? allPosts
			: allPosts.filter((post) => post.tags?.includes(selectedCategory))
	);

	// Featured post (only if not searching)
	const featuredPost = $derived(!data.search && selectedCategory === 'All' ? allPosts[0] : null);
	const gridPosts = $derived(
		featuredPost ? filteredPosts.filter((p) => p.slug !== featuredPost.slug) : filteredPosts
	);

	async function loadMore() {
		if (isLoadingMore || !nextCursor) return;

		isLoadingMore = true;
		try {
			const res = await fetch(`/api/blog?lastDate=${nextCursor}&q=${data.search || ''}`);
			const result = await res.json();

			if (result.posts && result.posts.length > 0) {
				allPosts = [...allPosts, ...result.posts];
				nextCursor = result.nextCursor;
			} else {
				nextCursor = null;
			}
		} catch (err) {
			console.error('Error loading more posts:', err);
		} finally {
			isLoadingMore = false;
		}
	}

	// Animations
	let container: HTMLElement;

	onMount(() => {
		const ctx = gsap.context(() => {
			gsap.from('.stagger-item', {
				y: 30,
				opacity: 0,
				duration: 0.8,
				stagger: 0.1,
				ease: 'power3.out'
			});
		}, container);

		return () => ctx.revert();
	});

	// Re-run animation when category changes
	$effect(() => {
		if (selectedCategory) {
			gsap.from('.blog-grid-item', {
				y: 20,
				opacity: 0,
				duration: 0.5,
				stagger: 0.05,
				ease: 'power2.out',
				clearProps: 'all'
			});
		}
	});
</script>

<SEO title={m.blog_title()} description={m.blog_subtitle()} />

<div class="mx-auto mt-28 max-w-7xl px-4 pb-20 sm:px-6 lg:px-8" bind:this={container}>
	<!-- Header Section -->
	<header class="stagger-item mb-12 text-center">
		<h1 class="font-poppins text-5xl font-black tracking-tight md:text-7xl">
			{m.blog_title()}<span class="text-primary">.</span>
		</h1>
		<p class="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground">
			{m.blog_subtitle()}
		</p>
	</header>

	<!-- Search Bar -->
	<section class="stagger-item mx-auto mb-16 max-w-2xl">
		<form action="/blog" method="GET" class="group relative">
			<Search
				class="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
			/>
			<input
				type="text"
				name="q"
				placeholder="Search articles..."
				value={data.search}
				class="h-14 w-full rounded-2xl border border-border bg-card/50 pr-12 pl-12 text-lg backdrop-blur-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
			/>
			{#if data.search}
				<a
					href="/blog"
					class="absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-muted"
				>
					<X class="size-5 text-muted-foreground" />
				</a>
			{/if}
		</form>
		{#if data.search}
			<p class="mt-4 text-center text-sm text-muted-foreground">
				Showing results for <span class="font-bold text-foreground">"{data.search}"</span>
			</p>
		{/if}
	</section>

	<!-- Featured Post Section -->
	{#if featuredPost}
		<section class="stagger-item mb-20">
			<BlogFeatured post={featuredPost} />
		</section>
	{/if}

	<!-- Category Filter -->
	{#if allPosts.length > 0}
		<section class="stagger-item mb-12 flex flex-wrap items-center justify-center gap-3">
			{#each categories as category (category)}
				<button
					onclick={() => (selectedCategory = category)}
					class={`rounded-full px-6 py-2 text-sm font-bold transition-all duration-300 ${
						selectedCategory === category
							? 'scale-105 bg-primary text-primary-foreground shadow-lg shadow-primary/20'
							: 'bg-muted text-muted-foreground hover:bg-muted/80'
					}`}
				>
					{category}
				</button>
			{/each}
		</section>
	{/if}

	<!-- Blog Grid -->
	<section class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
		{#each gridPosts as post (post.slug)}
			<div class="blog-grid-item">
				<BlogCard {post} />
			</div>
		{/each}
	</section>

	<!-- Load More / Empty State -->
	<div class="mt-20 flex justify-center">
		{#if nextCursor && selectedCategory === 'All'}
			<button
				onclick={loadMore}
				disabled={isLoadingMore}
				class="group flex items-center gap-3 rounded-full bg-primary px-10 py-4 text-sm font-bold tracking-widest text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/30 disabled:opacity-50"
			>
				{#if isLoadingMore}
					<Loader2 class="size-5 animate-spin" />
					LOADING...
				{:else}
					LOAD MORE
				{/if}
			</button>
		{:else if gridPosts.length === 0}
			<div class="py-20 text-center">
				<h3 class="text-2xl font-bold">No articles found</h3>
				<p class="mt-4 text-muted-foreground">
					Try searching with different keywords or clearing your search.
				</p>
				<a href="/blog" class="mt-8 inline-block font-bold text-primary hover:underline"
					>Clear Search</a
				>
			</div>
		{/if}
	</div>
</div>

<style>
	:global(.font-poppins) {
		font-family: 'Poppins', sans-serif;
	}
</style>
