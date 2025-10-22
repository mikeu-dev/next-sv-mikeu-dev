<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Button from '@/lib/components/ui/button/button.svelte';

	let heroTitle: HTMLElement;
	let heroSubtitle: HTMLElement;
	let heroButton: HTMLElement;

	onMount(() => {
		gsap.from(heroTitle, { y: 20, opacity: 0, duration: 0.5, delay: 0.1 });
		gsap.from(heroSubtitle, { y: 20, opacity: 0, duration: 0.5, delay: 0.2 });
		gsap.from(heroButton, { y: 20, opacity: 0, duration: 0.5, delay: 0.3 });
	});
</script>

<section class="py-16 text-center md:py-24">
	<h1 bind:this={heroTitle} class="font-poppins mb-4 text-4xl font-bold md:text-6xl">
		Riki Ruswandi (Mikeu)
	</h1>
	<p
		bind:this={heroSubtitle}
		class="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
	>
		A Passionate Web & GIS Developer from Indonesia. I enjoy learning new things — especially in
		programming, web development, and geospatial technology.
	</p>
	<div bind:this={heroButton} class="mt-8 flex justify-center gap-4">
		<Button href="#contact" size="lg">Contact Me</Button>
		<Button href="#work" variant="outline" size="lg">View My Work</Button>
	</div>
</section>
