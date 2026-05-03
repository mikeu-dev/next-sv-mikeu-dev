<script lang="ts">
	import { m } from '@/lib/paraglide/messages';
	import type { PageData } from './$types';
	import BlogCard from '$lib/components/guest/blog/blog-card.svelte';
	import BlogFeatured from '$lib/components/guest/blog/blog-featured.svelte';
	import SEO from '$lib/components/seo/seo.svelte';
	import { onMount } from 'svelte';
	import gsap from 'gsap';

	let { data }: { data: PageData } = $props();

	// State for category filtering
	let selectedCategory = $state('All');

	// Get unique categories from all posts
	const categories = $derived(['All', ...new Set(data.posts.flatMap((post) => post.tags || []))]);

	// Filtered posts
	const filteredPosts = $derived(
		selectedCategory === 'All'
			? data.posts
			: data.posts.filter((post) => post.tags?.includes(selectedCategory))
	) as typeof data.posts;

	// Featured post (latest one from the filtered list, or just latest overall)
	const featuredPost = $derived(data.posts[0]);
	const remainingPosts = $derived(filteredPosts.filter((p) => p.slug !== featuredPost.slug));

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
	<header class="stagger-item mb-16 text-center">
		<h1 class="font-poppins text-5xl font-black tracking-tight md:text-7xl">
			{m.blog_title()}<span class="text-primary">.</span>
		</h1>
		<p class="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground">
			{m.blog_subtitle()}
		</p>
	</header>

	<!-- Featured Post Section (Only show if on 'All' or if featured post matches category) -->
	{#if selectedCategory === 'All' || (featuredPost.tags && featuredPost.tags.includes(selectedCategory))}
		<section class="stagger-item mb-20">
			<BlogFeatured post={featuredPost} />
		</section>
	{/if}

	<!-- Category Filter -->
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

	<!-- Blog Grid -->
	<section class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
		{#each remainingPosts as post (post.slug)}
			<div class="blog-grid-item">
				<BlogCard {post} />
			</div>
		{/each}
	</section>

	{#if filteredPosts.length === 0}
		<div class="py-20 text-center">
			<h3 class="text-2xl font-bold">No articles found</h3>
			<p class="mt-4 text-muted-foreground">{m.blog_stay_tuned()}</p>
		</div>
	{/if}
</div>

<style>
	:global(.font-poppins) {
		font-family: 'Poppins', sans-serif;
	}
</style>
