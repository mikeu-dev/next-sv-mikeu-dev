<script lang="ts">
	import { onMount } from 'svelte';

	let progress = $state(0);

	onMount(() => {
		const updateProgress = () => {
			const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
			progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
		};
		window.addEventListener('scroll', updateProgress, { passive: true });
		updateProgress();
		return () => window.removeEventListener('scroll', updateProgress);
	});
</script>

<div aria-hidden="true" class="fixed inset-x-0 top-0 z-50 h-1.5 bg-border">
	<div class="h-full origin-left bg-primary" style="transform: scaleX({progress})"></div>
</div>
