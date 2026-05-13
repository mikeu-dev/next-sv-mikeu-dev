<script lang="ts">
	import ContactSection from '../lib/components/guest/sections/contact/contact.svelte';
	import HeroSection from '../lib/components/guest/sections/hero/hero.svelte';
	import Skeleton from '$lib/components/ui/skeleton.svelte';
	import SectionLoader from '$lib/components/ui/section-loader.svelte';
	import { ArrowRight } from '@lucide/svelte';

	import * as m from '$lib/paraglide/messages';

	let { data } = $props();
</script>

{#await data.skills}
	<div class="space-y-4 py-20 text-center">
		<Skeleton class="mx-auto h-12 w-3/4" />
		<Skeleton class="mx-auto h-6 w-1/2" />
		<div class="flex justify-center gap-2">
			<Skeleton class="h-8 w-20 rounded-full" />
			<Skeleton class="h-8 w-20 rounded-full" />
			<Skeleton class="h-8 w-20 rounded-full" />
		</div>
	</div>
{:then skills}
	<HeroSection {skills} />
{/await}

<SectionLoader rootMargin="400px">
	{#snippet fallback()}
		<div class="container grid grid-cols-1 gap-6 py-20 md:grid-cols-2 lg:grid-cols-3">
			<Skeleton class="h-64 w-full" />
			<Skeleton class="h-64 w-full" />
			<Skeleton class="h-64 w-full" />
		</div>
	{/snippet}
	{#await Promise.all([data.projects, import('../lib/components/guest/sections/work/work.svelte')]) then [projects, mod]}
		<mod.default {projects} />
	{/await}
</SectionLoader>

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
	{#await Promise.all([data.latestPosts, import('../lib/components/guest/sections/blog/latest-blogs.svelte')]) then [posts, mod]}
		<mod.default {posts} />
	{/await}
</SectionLoader>

<!-- World Teaser Section -->
<section
	class="relative h-[60vh] min-h-[400px] w-full overflow-hidden border-y border-foreground/10"
>
	<div class="absolute inset-0 z-0">
		<SectionLoader class="h-full w-full">
			{#snippet fallback()}
				<div class="flex h-full w-full items-center justify-center bg-muted/5">
					<div class="h-1.5 w-1.5 animate-pulse bg-primary"></div>
				</div>
			{/snippet}
			{#await import('../lib/components/guest/sections/world/folded-world.svelte') then mod}
				<mod.default nodes={[]} totalVisitors={0} minimal={true} />
			{/await}
		</SectionLoader>
	</div>

	<!-- Teaser Content Overlay -->
	<div class="relative z-10 container flex h-full flex-col items-center justify-center text-center">
		<div class="max-w-2xl border border-foreground/10 bg-background/80 p-8 backdrop-blur-sm">
			<h2 class="mb-4 text-4xl font-black tracking-tighter md:text-5xl">
				{m.world_teaser_title()}
			</h2>
			<p class="mb-8 font-mono text-sm text-muted-foreground">
				{m.world_teaser_subtitle()}<br />
				{m.world_teaser_desc()}
			</p>
			<a
				href="/world"
				class="group inline-flex items-center gap-2 bg-primary px-8 py-4 font-bold tracking-widest text-primary-foreground transition-all hover:skew-x-[-10deg] hover:bg-primary/90"
			>
				{m.world_teaser_button()}
				<ArrowRight class="size-8 transition-transform duration-300 group-hover:translate-x-2" />
			</a>
		</div>
	</div>
</section>

<ContactSection />
