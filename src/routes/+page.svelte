<script lang="ts">
	import ContactSection from '../lib/components/guest/sections/contact/contact.svelte';
	import HeroSection from '../lib/components/guest/sections/hero/hero.svelte';
	import WorkSection from '../lib/components/guest/sections/work/work.svelte';
	import LatestBlogsSection from '../lib/components/guest/sections/blog/latest-blogs.svelte';
	import { getLocale } from '$lib/paraglide/runtime';

	import type { BlogPost } from '$lib/server/services/blog.service';
	import type { Project } from '$lib/types';

	let { data } = $props();
	const { projects, skills, latestPosts } = data;

	const currentLocale = $derived(getLocale());
	const localizedPosts = $derived(latestPosts[currentLocale] as BlogPost[]);
</script>

<HeroSection {skills} />

<WorkSection projects={projects as unknown as Record<string, Project[]>} />

<LatestBlogsSection posts={localizedPosts} />

<ContactSection />
