<script lang="ts">
	import { PUBLIC_LOTTIE_URL } from '$app/env/public';

	/**
	 * Lottie animation for error pages, loaded on demand. SvelteKit loads the
	 * root +error.svelte on every page at startup, so a static import of the
	 * dotLottie player (~650 KB of script) used to ship with every visit.
	 */
	const player = PUBLIC_LOTTIE_URL ? import('@lottiefiles/dotlottie-svelte') : null;
</script>

{#if player}
	{#await player then { DotLottieSvelte }}
		<DotLottieSvelte src={PUBLIC_LOTTIE_URL} loop autoplay />
	{/await}
{/if}
