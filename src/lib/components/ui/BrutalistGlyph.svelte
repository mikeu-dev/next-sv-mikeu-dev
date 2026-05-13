<script lang="ts">
	/**
	 * BrutalistGlyph.svelte
	 * Renders a custom geometric SVG representing a character.
	 * Designed with a "Brutalist Origami" aesthetic: faceted, sharp, and structural.
	 */

	interface Props {
		char: string;
		class?: string;
	}

	let { char, class: className = '' }: Props = $props();

	// Normalize character for mapping
	const key = $derived(char.toUpperCase());
</script>

<div class="brutalist-glyph {className}" aria-hidden="true">
	{#if key === 'M'}
		<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
			<polygon points="10,90 10,10 50,50 30,30" fill="currentColor" class="facet-1" />
			<polygon points="50,50 90,10 90,90 70,70" fill="currentColor" class="facet-2" />
			<polygon points="30,30 50,50 70,30 50,10" fill="var(--primary)" class="facet-accent" />
		</svg>
	{:else if key === 'I'}
		<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect x="35" y="35" width="30" height="55" fill="currentColor" />
			<polygon points="50,5 70,20 50,35 30,20" fill="var(--primary)" />
		</svg>
	{:else if key === 'K'}
		<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect x="15" y="10" width="20" height="80" fill="currentColor" />
			<polygon points="35,50 85,10 65,10 35,40" fill="currentColor" opacity="0.8" />
			<polygon points="35,50 85,90 65,90 35,60" fill="var(--primary)" />
		</svg>
	{:else if key === 'E'}
		<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
			<polygon points="20,10 80,10 80,25 20,25" fill="currentColor" />
			<polygon points="20,10 20,90 35,90 35,10" fill="currentColor" opacity="0.9" />
			<polygon points="20,42 70,42 70,58 20,58" fill="var(--primary)" />
			<polygon points="20,75 80,75 80,90 20,90" fill="currentColor" />
		</svg>
	{:else if key === 'U'}
		<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
			<polygon points="15,10 30,10 30,70 15,70" fill="currentColor" />
			<polygon points="70,10 85,10 85,70 70,70" fill="currentColor" />
			<polygon points="15,70 85,70 85,90 15,90" fill="var(--primary)" />
		</svg>
	{:else if key === 'D'}
		<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect x="15" y="10" width="20" height="80" fill="currentColor" />
			<polygon points="35,10 75,10 90,30 90,70 75,90 35,90" fill="var(--primary)" opacity="0.8" />
			<polygon points="35,25 65,25 75,35 75,65 65,75 35,75" fill="var(--background)" />
		</svg>
	{:else if key === 'V'}
		<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
			<polygon points="10,10 30,10 50,70 40,70" fill="currentColor" />
			<polygon points="90,10 70,10 50,70 60,70" fill="currentColor" opacity="0.8" />
			<polygon points="40,70 60,70 50,95" fill="var(--primary)" />
		</svg>
	{:else if key === ' '}
		<div class="w-12"></div>
	{:else}
		<span class="text-4xl font-black">{char}</span>
	{/if}
</div>

<style lang="postcss">
	.brutalist-glyph {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		line-height: 1;
		vertical-align: middle;
	}

	svg {
		width: 100%;
		height: 100%;
		filter: drop-shadow(4px 4px 0px rgba(0, 0, 0, 0.1));
	}

	.facet-1 {
		opacity: 1;
	}
	.facet-2 {
		opacity: 0.8;
	}
	.facet-accent {
		opacity: 0.9;
	}

	:global(.dark) svg {
		filter: drop-shadow(4px 4px 0px rgba(255, 255, 255, 0.05));
	}
</style>
