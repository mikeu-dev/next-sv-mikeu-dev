<script lang="ts">
	import HeroSection from '../lib/components/guest/sections/hero/hero.svelte';
	import Skeleton from '$lib/components/ui/skeleton.svelte';
	import SectionLoader from '$lib/components/ui/section-loader.svelte';
	import SEO from '$lib/components/seo/seo.svelte';

	let { data } = $props();
</script>

<SEO />

<HeroSection />

<div id="work">
	<SectionLoader rootMargin="400px">
		{#snippet fallback()}
			<div class="container mx-auto grid grid-cols-1 gap-6 py-20 md:grid-cols-2 lg:grid-cols-3">
				<Skeleton class="h-64 w-full" />
				<Skeleton class="h-64 w-full" />
				<Skeleton class="h-64 w-full" />
			</div>
		{/snippet}
		{#await Promise.all( [data.projects, import('$lib/components/guest/sections/work/work.svelte')] ) then [projects, mod]}
			<mod.default {projects} />
		{/await}
	</SectionLoader>
</div>

<SectionLoader rootMargin="400px">
	{#snippet fallback()}
		<div class="container mx-auto space-y-4 py-20">
			<Skeleton class="h-10 w-48" />
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<Skeleton class="h-40 w-full" />
				<Skeleton class="h-40 w-full" />
				<Skeleton class="h-40 w-full" />
			</div>
		</div>
	{/snippet}
	{#await Promise.all( [data.latestPosts, import('$lib/components/guest/sections/blog/latest-blogs.svelte')] ) then [posts, mod]}
		<mod.default {posts} />
	{/await}
</SectionLoader>

<!-- World Teaser Section -->
<SectionLoader rootMargin="300px">
	{#snippet fallback()}
		<div
			class="flex h-[65vh] min-h-125 w-full animate-pulse items-center justify-center bg-muted/5"
		>
			<div class="h-1.5 w-1.5 animate-pulse bg-primary"></div>
		</div>
	{/snippet}
	{#await import('$lib/components/guest/sections/world/world-teaser.svelte') then mod}
		<mod.default />
	{/await}
</SectionLoader>

<div id="contact">
	<SectionLoader rootMargin="200px">
		{#snippet fallback()}
			<div class="h-64 w-full animate-pulse bg-muted/5"></div>
		{/snippet}
		{#await import('$lib/components/guest/sections/contact/contact.svelte') then mod}
			<mod.default />
		{/await}
	</SectionLoader>
</div>
