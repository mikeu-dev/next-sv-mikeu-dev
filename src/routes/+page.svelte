<script lang="ts">
	import HeroSection from '../lib/components/guest/sections/hero/hero.svelte';
	import Skeleton from '$lib/components/ui/skeleton.svelte';
	import SectionLoader from '$lib/components/ui/section-loader.svelte';

	let { data } = $props();
</script>

{#await data.skills}
	<div class="flex min-h-screen flex-col items-center justify-center space-y-4">
		<Skeleton class="h-12 w-3/4 max-w-xl" />
		<Skeleton class="h-6 w-1/2 max-w-sm" />
		<div class="flex justify-center gap-2">
			<Skeleton class="h-8 w-20 rounded-full" />
			<Skeleton class="h-8 w-20 rounded-full" />
			<Skeleton class="h-8 w-20 rounded-full" />
		</div>
	</div>
{:then skills}
	<HeroSection {skills} />
{/await}

<div id="work">
	<SectionLoader rootMargin="400px">
		{#snippet fallback()}
			<div class="container grid grid-cols-1 gap-6 py-20 md:grid-cols-2 lg:grid-cols-3">
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
		<div class="container space-y-4 py-20">
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
