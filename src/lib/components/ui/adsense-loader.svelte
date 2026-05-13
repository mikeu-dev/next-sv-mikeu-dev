<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let { clientId }: { clientId: string } = $props();

	let loaded = $state(false);

	onMount(() => {
		if (!browser) return;

		// Strategy: Load AdSense after 2 seconds or on first interaction
		const loadAdSense = () => {
			if (loaded) return;
			loaded = true;

			const script = document.createElement('script');
			script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
			script.async = true;
			script.crossOrigin = 'anonymous';
			document.head.appendChild(script);

			// Cleanup listeners
			window.removeEventListener('scroll', loadAdSense);
			window.removeEventListener('mousemove', loadAdSense);
			window.removeEventListener('touchstart', loadAdSense);
		};

		const timeout = setTimeout(loadAdSense, 2000);

		window.addEventListener('scroll', loadAdSense, { passive: true });
		window.addEventListener('mousemove', loadAdSense, { passive: true });
		window.addEventListener('touchstart', loadAdSense, { passive: true });

		return () => {
			clearTimeout(timeout);
			window.removeEventListener('scroll', loadAdSense);
			window.removeEventListener('mousemove', loadAdSense);
			window.removeEventListener('touchstart', loadAdSense);
		};
	});
</script>

<!-- This component doesn't render anything, it just manages the script injection -->
