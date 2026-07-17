<script lang="ts">
	import HeroSection from '$lib/components/guest/sections/hero/hero.svelte';
	import SEO from '$lib/components/seo/seo.svelte';
	import WorkSection from '$lib/components/guest/sections/work/work.svelte';
	import LatestBlogsSection from '$lib/components/guest/sections/blog/latest-blogs.svelte';
	import WorldTeaserSection from '$lib/components/guest/sections/world/world-teaser.svelte';
	import ContactSection from '$lib/components/guest/sections/contact/contact.svelte';

	let { data } = $props();
</script>

<SEO />

<HeroSection />

<div id="work">
	<WorkSection projects={data.projects} />
</div>

<LatestBlogsSection posts={data.latestPosts} />

<WorldTeaserSection />

<div id="contact">
	<ContactSection />
</div>
