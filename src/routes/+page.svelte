<script lang="ts">
	import type { PageData } from './$types';
	import ContactSection from '../lib/components/ContactSection.svelte';
	import HeroSection from '../lib/components/HeroSection.svelte';
	import WorkSection from '../lib/components/WorkSection.svelte';

	export let data: PageData;
	const { projects } = data;
</script>

<HeroSection />

<WorkSection {projects} />

<ContactSection />
