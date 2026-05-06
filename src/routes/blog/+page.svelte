<script lang="ts">
	import { m } from '@/lib/paraglide/messages';
	import type { PageData } from './$types';
	import BlogCard from '$lib/components/guest/blog/blog-card.svelte';
	import BlogFeatured from '$lib/components/guest/blog/blog-featured.svelte';
	import SEO from '$lib/components/seo/seo.svelte';
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	import { Search, X, Loader2, Database, Filter, Plus } from '@lucide/svelte';

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
		gsap.registerPlugin(ScrollTrigger);

		const ctx = gsap.context(() => {
			const tl = gsap.timeline();
			
			tl.from('.header-origami', {
				clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
				duration: 1,
				ease: 'power4.inOut'
			})
			.from('.stagger-item', {
				y: 50,
				rotateX: -15,
				skewY: 2,
				opacity: 0,
				duration: 0.8,
				stagger: 0.1,
				ease: 'expo.out'
			}, '-=0.6');
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

<div class="relative mt-28 min-h-screen space-y-24 pb-32" bind:this={container}>
	<!-- Industrial Background Element -->
	<div class="pointer-events-none fixed inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]" 
		style="background-image: radial-gradient(var(--foreground) 1px, transparent 1px); background-size: 32px 32px;">
	</div>

	<!-- Header Section -->
	<section class="container mx-auto px-4">
		<div class="header-origami relative border-y-4 border-foreground py-16 text-center md:py-24"
			style="clip-path: polygon(0 0, 100% 0, 98% 100%, 2% 100%);">
			<div class="absolute inset-0 -z-10 bg-primary/5"></div>
			
			<div class="inline-block border-2 border-foreground bg-primary px-4 py-1 font-mono text-[10px] font-black tracking-[0.2em] text-primary-foreground uppercase mb-6">
				[KNOWLEDGE_ARCHIVE_v1.0]
			</div>
			
			<h1 class="stagger-item font-poppins text-5xl font-black tracking-tighter md:text-8xl">
				{m.blog_title()}<span class="text-primary">_</span>
			</h1>
			
			<p class="stagger-item mx-auto mt-8 max-w-3xl font-mono text-xs leading-relaxed tracking-wider text-muted-foreground uppercase md:text-sm">
				// {m.blog_subtitle()}
			</p>
			
			<!-- Decorative Origami Shards -->
			<div class="absolute -top-10 -right-10 size-40 bg-primary/10 transition-transform duration-500 hover:rotate-45" style="clip-path: polygon(50% 0%, 0% 100%, 100% 100%);"></div>
			<div class="absolute -bottom-10 -left-10 size-32 bg-foreground/5 transition-transform duration-500 hover:-rotate-12" style="clip-path: polygon(0% 0%, 100% 0%, 50% 100%);"></div>
		</div>
	</section>

	<!-- Controls Section (Search & Filter) -->
	<section class="container mx-auto space-y-12 px-4">
		<div class="flex flex-col items-stretch justify-between gap-8 lg:flex-row lg:items-end">
			<!-- Search Bar -->
			<div class="stagger-item relative flex-1">
				<div class="mb-2 flex items-center gap-2 font-mono text-[10px] font-black tracking-widest uppercase">
					<Database class="size-3" /> [QUERY_DATABASE]
				</div>
				<form action="/blog" method="GET" class="group relative">
					<Search class="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
					<input
						type="text"
						name="q"
						value={data.search}
						placeholder="INITIATE_SEARCH..."
						class="h-14 w-full border-2 border-foreground bg-card px-4 pl-12 font-mono text-sm tracking-tight transition-all outline-none focus:bg-primary/5 focus:shadow-[4px_4px_0_var(--primary)]"
					/>
					{#if data.search}
						<a
							href="/blog"
							class="absolute top-1/2 right-4 -translate-y-1/2 border border-foreground/20 p-1 transition-colors hover:bg-primary hover:text-white"
						>
							<X class="size-4" />
						</a>
					{/if}
				</form>
				{#if data.search}
					<p class="mt-3 font-mono text-[9px] font-bold tracking-widest text-muted-foreground uppercase">
						// RESULTS_FOR: <span class="text-foreground">"{data.search}"</span>
					</p>
				{/if}
			</div>

			<!-- Category Filter Label -->
			<div class="stagger-item hidden lg:block">
				<div class="mb-2 flex items-center gap-2 font-mono text-[10px] font-black tracking-widest uppercase">
					<Filter class="size-3" /> [CATEGORY_SORT]
				</div>
				<div class="h-14 border-l-2 border-foreground/10 px-4 flex items-center">
					<span class="font-mono text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em]">
						FILTER_ACTIVE
					</span>
				</div>
			</div>
		</div>

		<!-- Category Filter Chips -->
		<div class="stagger-item space-y-4">
			<div class="lg:hidden flex items-center gap-2 font-mono text-[10px] font-black tracking-widest uppercase">
				<Filter class="size-3" /> [CATEGORY_SORT]
			</div>
			<div class="flex flex-wrap gap-3">
				{#each categories as category (category)}
					<button
						onclick={() => (selectedCategory = category)}
						class="group relative flex items-center gap-3 border-2 border-foreground px-5 py-2.5 transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_var(--foreground)] active:translate-x-0 active:translate-y-0 active:shadow-none {selectedCategory === category ? 'bg-foreground text-background' : 'bg-card'}"
					>
						<span class="relative z-10 font-mono text-[10px] font-black tracking-widest uppercase">
							{category}
						</span>
						
						{#if selectedCategory === category}
							<div class="absolute inset-0 -z-10 translate-x-1 translate-y-1 bg-primary"></div>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</section>

	<!-- Featured Post Section -->
	{#if featuredPost}
		<section class="container mx-auto stagger-item px-4">
			<BlogFeatured post={featuredPost} />
		</section>
	{/if}

	<!-- Blog Grid -->
	<section class="container mx-auto px-4">
		<div class="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
			{#each gridPosts as post (post.slug)}
				<div class="blog-grid-item">
					<BlogCard {post} />
				</div>
			{/each}
		</div>

		<!-- Load More / Empty State -->
		<div class="mt-24 flex justify-center">
			{#if nextCursor && selectedCategory === 'All'}
				<button
					onclick={loadMore}
					disabled={isLoadingMore}
					class="group relative flex h-16 items-center gap-4 border-4 border-foreground bg-primary px-10 font-mono text-sm font-black tracking-[0.2em] text-primary-foreground uppercase transition-all hover:-translate-x-2 hover:-translate-y-2 hover:shadow-[8px_8px_0_var(--foreground)] active:translate-x-0 active:translate-y-0 active:shadow-none disabled:opacity-50"
				>
					<div class="absolute inset-0 -z-10 translate-x-2 translate-y-2 bg-foreground/10 transition-transform group-hover:translate-x-4 group-hover:translate-y-4"></div>
					
					{#if isLoadingMore}
						<Loader2 class="size-5 animate-spin" />
						[FETCHING_MORE...]
					{:else}
						<Plus class="size-5 transition-transform group-hover:rotate-180" />
						[EXPAND_COLLECTION]
					{/if}
				</button>
			{:else if gridPosts.length === 0}
				<div class="mx-auto flex max-w-2xl flex-col items-center justify-center border-4 border-dashed border-foreground/20 py-32 text-center">
					<div class="mb-8 border-2 border-foreground bg-muted p-8 shadow-[8px_8px_0_var(--foreground)]">
						<Database class="size-20 text-foreground" />
					</div>
					<div class="space-y-4">
						<h3 class="font-poppins text-3xl font-black uppercase tracking-tighter">[ZERO_ENTRIES_FOUND]</h3>
						<p class="font-mono text-xs tracking-widest text-muted-foreground uppercase">// SEARCH_QUERY_RETURNED_NULL_RESULT</p>
					</div>
					<a
						href="/blog"
						class="mt-10 border-2 border-foreground bg-foreground px-8 py-3 font-mono text-[10px] font-black tracking-widest text-background uppercase transition-all hover:bg-primary hover:text-white"
					>
						[RESET_SEARCH]
					</a>
				</div>
			{/if}
		</div>
	</section>
</div>

<style lang="postcss">
	@reference "tailwindcss";

	:global(.header-origami) {
		transform-style: preserve-3d;
		perspective: 1000px;
	}

	.container {
		@apply max-w-7xl;
	}

	input::placeholder {
		color: oklch(from var(--muted-foreground) l c h / 30%);
	}
</style>
