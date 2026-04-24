<script lang="ts">
	import ContactSection from '../lib/components/guest/sections/contact/contact.svelte';
	import HeroSection from '../lib/components/guest/sections/hero/hero.svelte';
	import WorkSection from '../lib/components/guest/sections/work/work.svelte';
	import LatestBlogsSection from '../lib/components/guest/sections/blog/latest-blogs.svelte';
	import Skeleton from '$lib/components/ui/skeleton.svelte';

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

{#await data.projects}
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		<Skeleton class="h-64 w-full" />
		<Skeleton class="h-64 w-full" />
		<Skeleton class="h-64 w-full" />
	</div>
{:then projects}
	<WorkSection {projects} />
{/await}

{#await data.latestPosts}
	<div class="space-y-4 py-10">
		<Skeleton class="h-10 w-48" />
		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<Skeleton class="h-40 w-full" />
			<Skeleton class="h-40 w-full" />
			<Skeleton class="h-40 w-full" />
		</div>
	</div>
{:then posts}
	<LatestBlogsSection {posts} />
{/await}

<ContactSection />
