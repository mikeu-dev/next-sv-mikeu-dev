<script lang="ts">
	import { Icon as SvelteIconPack } from 'svelte-icons-pack';
	import { iconRegistry } from '$lib/icons/registry';
	import type { IconType } from 'svelte-icons-pack';
	import type { Component } from 'svelte';

	interface GenericIconProps {
		color?: string;
		size?: number | string;
		strokeWidth?: number;
		class?: string;
		style?: string;
		[key: string]: unknown;
	}

	type GenericIconComponent = Component<GenericIconProps, Record<string, unknown>, string>;

	interface Props {
		iconName?: string;
		src?: IconType | GenericIconComponent | null;
		color?: string;
		size?: number | string;
		strokeWidth?: number;
		class?: string;
		style?: string;
	}

	let {
		iconName = '',
		src = null,
		color = 'currentColor',
		size = 24,
		strokeWidth = 2,
		class: className = '',
		style = ''
	}: Props = $props();

	// Utility to get Icon from Registry
	function getRegistryIcon(name: string): IconType | null {
		return iconRegistry[name] || null;
	}

	// Dynamic derived state for the icon
	let iconType = $derived(() => {
		if (src) return 'src';
		if (!iconName) return 'fallback';

		// Prioritize Registry (includes BS, FI, SI, LU mappings)
		if (getRegistryIcon(iconName)) return 'registry';

		return 'fallback';
	});

	let RegistryComp = $derived(iconType() === 'registry' ? getRegistryIcon(iconName) : null);
	let DirectComp = $derived(iconType() === 'src' ? src : null);
</script>

<div
	class="icon-container inline-flex items-center justify-center {className}"
	style="width: {typeof size === 'number' ? size + 'px' : size}; height: {typeof size === 'number'
		? size + 'px'
		: size}; {style}"
>
	{#if iconType() === 'src' && DirectComp}
		{#if typeof DirectComp === 'object' && DirectComp !== null && 'a' in DirectComp}
			<SvelteIconPack src={DirectComp as IconType} {color} {size} />
		{:else}
			{@const Comp = DirectComp as GenericIconComponent}
			<Comp {color} {size} />
		{/if}
	{:else if iconType() === 'registry' && RegistryComp}
		<SvelteIconPack src={RegistryComp} {color} {size} />
	{:else}
		<!-- Default Fallback Icon -->
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke={color}
			stroke-width={strokeWidth}
			stroke-linecap="round"
			stroke-linejoin="round"
			class="h-full w-full"
		>
			<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
			<line x1="9" y1="9" x2="15" y2="15" />
			<line x1="15" y1="9" x2="9" y2="15" />
		</svg>
	{/if}
</div>

<style>
	.icon-container :global(svg) {
		width: 100%;
		height: 100%;
	}
</style>
