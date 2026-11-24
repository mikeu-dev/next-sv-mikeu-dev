<script lang="ts">
	import { onMount } from 'svelte';

	let { clientId }: { clientId: string } = $props();

	/**
	 * AdSense is loaded only after the visitor first interacts with the page
	 * (scroll, pointer, key or touch). The ads script is the largest share of
	 * unused JavaScript and main-thread work on first load, so keeping it out
	 * of the initial load protects LCP and TBT; people who read the page still
	 * see ads a moment later.
	 */
	onMount(() => {
		const events = ['scroll', 'pointerdown', 'pointermove', 'keydown', 'touchstart'] as const;
		let loaded = false;

		const load = () => {
			if (loaded) return;
			loaded = true;
			events.forEach((e) => window.removeEventListener(e, onFirstInteraction));
			const script = document.createElement('script');
			script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
			script.async = true;
			script.crossOrigin = 'anonymous';
			document.head.appendChild(script);
		};
		// Defer the injection itself so it never competes with the interaction.
		const onFirstInteraction = () => {
			if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 2000 });
			else setTimeout(load, 200);
		};

		events.forEach((e) => window.addEventListener(e, onFirstInteraction, { passive: true }));
		return () => events.forEach((e) => window.removeEventListener(e, onFirstInteraction));
	});
</script>

<!-- Renders nothing; it only injects the AdSense script. -->
