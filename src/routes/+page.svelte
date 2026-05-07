<script lang="ts">
	import ContactSection from '../lib/components/guest/sections/contact/contact.svelte';
	import HeroSection from '../lib/components/guest/sections/hero/hero.svelte';
	import WorkSection from '../lib/components/guest/sections/work/work.svelte';
	import LatestBlogsSection from '../lib/components/guest/sections/blog/latest-blogs.svelte';
	import FoldedWorld from '../lib/components/guest/sections/world/folded-world.svelte';
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

<!-- World Teaser Section -->
<section class="relative h-[60vh] min-h-[400px] w-full overflow-hidden border-y border-foreground/10">
	{#await data.worldData}
		<div class="flex h-full w-full items-center justify-center bg-background/50">
			<Skeleton class="h-64 w-64 rounded-full" />
		</div>
	{:then nodes}
		<div class="absolute inset-0 z-0">
			<FoldedWorld {nodes} totalVisitors={0} minimal={true} />
		</div>
		
		<!-- Teaser Content Overlay -->
		<div class="container relative z-10 flex h-full flex-col items-center justify-center text-center">
			<div class="max-w-2xl bg-background/80 p-8 backdrop-blur-sm border border-foreground/10">
				<h2 class="mb-4 text-4xl font-black tracking-tighter md:text-5xl">
					GLOBAL_PRESENCE
				</h2>
				<p class="mb-8 text-muted-foreground font-mono text-sm">
					[ SYSTEM.METRICS // VISITOR_DISTRIBUTION ]<br/>
					Eksplorasi jangkauan teknologi kami melalui representasi data visual interaktif.
				</p>
				<a 
					href="/world" 
					class="inline-block bg-primary px-8 py-4 text-primary-foreground font-bold tracking-widest hover:bg-primary/90 transition-all hover:skew-x-[-10deg]"
				>
					EXPLORE DATA ARCHIVE →
				</a>
			</div>
		</div>
	{/await}
</section>

<ContactSection />
