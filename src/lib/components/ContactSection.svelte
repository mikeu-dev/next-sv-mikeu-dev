<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { ArrowRight } from '@lucide/svelte';

	let contactSection: HTMLElement;

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);
		gsap.from(contactSection, {
			y: 50,
			opacity: 0,
			duration: 0.6,
			ease: 'power2.out',
			scrollTrigger: {
				trigger: contactSection,
				start: 'top 85%',
				toggleActions: 'play none none none'
			}
		});
	});
</script>

<section
	bind:this={contactSection}
	id="contact"
	class="relative z-10 rounded-t bg-gradient-to-b from-slate-100 to-background py-16 pt-24 text-center md:py-24 md:pt-32 dark:from-slate-900"
>
	<h2 class="font-poppins mb-4 text-3xl font-bold tracking-tight">Get in Touch</h2>
	<p class="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
		I'm always open to discussing new projects or collaboration opportunities. <br
			class="hidden sm:inline"
		/> Feel free to check out my work and reach out.
	</p>
	<a
		href="https://github.com/mikeu-dev"
		target="_blank"
		class="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
	>
		Visit my GitHub <ArrowRight class="ml-2 size-4" />
	</a>
</section>
