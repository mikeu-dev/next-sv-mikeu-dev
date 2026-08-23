<script lang="ts">
	import { onMount } from 'svelte';
	import SEO from '$lib/components/seo/seo.svelte';
	import { AtlasEngine } from '$lib/atlas/core/AtlasEngine';
	import { initializeAtlasScrollTrigger } from '$lib/atlas/narrative/ScrollAdapter';
	import AtlasCanvas from '$lib/atlas/components/AtlasCanvas.svelte';
	import AtlasHud from '$lib/atlas/components/AtlasHud.svelte';
	import AtlasStoryOverlay from '$lib/atlas/components/AtlasStoryOverlay.svelte';
	import EvidenceDrawer from '$lib/atlas/components/EvidenceDrawer.svelte';

	const engine = new AtlasEngine();
	let scrollContainer: HTMLElement;

	onMount(() => {
		if (!scrollContainer) return;
		const cleanupScroll = initializeAtlasScrollTrigger(scrollContainer, engine);

		return () => {
			cleanupScroll();
		};
	});
</script>

<SEO
	title="ATLAS — Interactive Spatial Portfolio | Riki Ruswandi"
	description="Explore the engineering journey, geospatial systems, enterprise architecture, and verified production evidence of Riki Ruswandi."
/>

<!-- Root Viewport Wrapper -->
<div class="atlas-root relative min-h-screen bg-[#0a0d12] text-[#f8fafc]">
	<!-- Scroll Track (Creates 4000px virtual scroll distance for smooth scrubbing) -->
	<div
		bind:this={scrollContainer}
		class="atlas-scroll-viewport relative h-screen w-full overflow-hidden"
	>
		<!-- 1. Background Spatial SVG Canvas Layer -->
		<div class="absolute inset-0 z-0 h-full w-full">
			<AtlasCanvas {engine} />
		</div>

		<!-- 2. Interactive Story Narrative Layer -->
		<AtlasStoryOverlay />

		<!-- 3. Heads-Up Display (HUD) Telemetry Overlay -->
		<AtlasHud {engine} />

		<!-- 4. Deep Inspection Evidence Drawer Panel -->
		<EvidenceDrawer />
	</div>
</div>

<style>
	:global(body) {
		overflow-x: hidden;
		background-color: #0a0d12;
	}
</style>
