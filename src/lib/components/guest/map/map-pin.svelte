<script lang="ts">
	let {
		width = 26,
		fill = 'var(--primary)',
		class: className = '',
		style = ''
	}: { width?: number; fill?: string; class?: string; style?: string } = $props();
</script>

<svg
	{width}
	height={Math.round((width * 4) / 3)}
	viewBox="0 0 30 40"
	aria-hidden="true"
	class={className}
	{style}
>
	<path
		d="M15 1C7.3 1 1 7 1 14.6 1 24.8 15 39 15 39s14-14.2 14-24.4C29 7 22.7 1 15 1z"
		{fill}
		stroke="#FFFFFF"
		stroke-width="2"
	/>
	<circle cx="15" cy="14.5" r="5.5" fill="#FFFFFF" />
</svg>
