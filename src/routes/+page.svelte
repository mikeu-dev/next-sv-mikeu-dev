<script lang="ts">
	import ContactSection from '../lib/components/ContactSection.svelte';
	import HeroSection from '../lib/components/HeroSection.svelte';
	import WorkSection from '../lib/components/guest/sections/work/work.svelte';

	let { data } = $props();
	const { projects } = data;
</script>

<HeroSection />

<WorkSection {projects} />

<ContactSection />
