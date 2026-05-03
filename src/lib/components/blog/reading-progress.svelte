<script lang="ts">
	import { onMount } from 'svelte';

	let progress = $state(0);

	onMount(() => {
		const updateProgress = () => {
			const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
			if (scrollHeight > 0) {
				progress = (window.scrollY / scrollHeight) * 100;
			}
		};

		window.addEventListener('scroll', updateProgress);
		updateProgress();

		return () => {
			window.removeEventListener('scroll', updateProgress);
		};
	});
</script>

<div class="fixed top-0 left-0 z-50 h-1 w-full bg-transparent">
	<div
		class="h-full bg-primary transition-all duration-150 ease-out"
		style="width: {progress}%"
	></div>
</div>
