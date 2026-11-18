<script lang="ts">
	let { size = 30, text = true }: { size?: number; text?: boolean } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 30 30" aria-hidden="true">
	<path
		d="M15 2c-5.5 0-10 4.3-10 9.8C5 19 15 28 15 28s10-9 10-16.2C25 6.3 20.5 2 15 2z"
		fill="var(--primary)"
	/>
	<circle cx="15" cy="11.5" r="4" fill="var(--card)" />
</svg>
{#if text}
	<span class="text-xl font-black tracking-[-0.01em]"
		>mikeu<span class="text-primary">.gis</span></span
	>
{/if}
