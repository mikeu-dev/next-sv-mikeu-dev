<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	interface Props {
		children: Snippet;
		fallback: Snippet;
		once?: boolean;
		threshold?: number;
		rootMargin?: string;
		class?: string;
	}

	let {
		children,
		fallback,
		once = true,
		threshold = 0,
		rootMargin = '200px',
		class: className = ''
	}: Props = $props();

	let visible = $state(false);
	let container: HTMLElement | null = $state(null);

	onMount(() => {
		if (!container) return;

		gsap.registerPlugin(ScrollTrigger);

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry?.isIntersecting) {
					visible = true;
					setTimeout(() => {
						ScrollTrigger.sort();
						ScrollTrigger.refresh();
					}, 100);
					if (once) {
						observer.disconnect();
					}
				} else if (!once) {
					visible = false;
				}
			},
			{ threshold, rootMargin }
		);

		observer.observe(container);

		return () => {
			observer.disconnect();
		};
	});
</script>

<div bind:this={container} class="section-loader-container {className}">
	{#if visible}
		{@render children()}
	{:else}
		{@render fallback()}
	{/if}
</div>

<style>
	.section-loader-container {
		width: 100%;
		min-height: 1px;
	}
</style>
