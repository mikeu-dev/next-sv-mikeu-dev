<script lang="ts">
	import ContactSection from '../lib/components/guest/sections/contact/contact.svelte';
	import HeroSection from '../lib/components/guest/sections/hero/hero.svelte';
	import WorkSection from '../lib/components/guest/sections/work/work.svelte';

	let { data } = $props();
	const { projects, skills } = data;
</script>

<HeroSection {skills} />

<WorkSection {projects} />

<ContactSection />
