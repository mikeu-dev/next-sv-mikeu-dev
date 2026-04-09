<script lang="ts">
	import * as SimpleIcons from 'simple-icons';
	import * as LucideIcons from '@lucide/svelte';
	import { Icon as SvelteIconPack } from 'svelte-icons-pack';
	import { iconRegistry } from '$lib/icons/registry';
	import type { Component } from 'svelte';

	interface Props {
		iconName?: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		src?: any; // For direct component passing (like svelte-icons-pack)
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

	// Utility to get Simple Icons SVG
	function getSimpleIconSvg(name: string): string | null {
		try {
			// Normalize: Remove 'Si' prefix and lowercase first char for simple-icons key
			const key = name.startsWith('Si') && name.length > 2 
				? 'si' + name.slice(2)
				: name.charAt(0).toLowerCase() + name.slice(1);
			
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const icon = (SimpleIcons as any)[key];
			if (icon && icon.svg) {
				return icon.svg.replace('<svg', `<svg class="w-full h-full" fill="${color}"`);
			}
		} catch {
			return null;
		}
		return null;
	}

	// Utility to get Lucide Icon Component
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function getLucideIcon(name: string): Component<any> | null {
		// Normalize: Remove 'Lu' prefix
		const bareName = name.startsWith('Lu') && name.length > 2 ? name.slice(2) : name;
		
		// Common renames if needed (e.g. Linkedin -> Linkedin)
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const icon = (LucideIcons as any)[bareName];
		return icon || null;
	}

	// Utility to get Icon from Registry
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function getRegistryIcon(name: string): Component<any> | null {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (iconRegistry as any)[name] || null;
	}

	// Dynamic derived state for the icon
	let iconType = $derived(() => {
		if (src) return 'src';
		if (!iconName) return 'fallback';
		
		if (iconName.startsWith('Si')) return 'simple';
		if (iconName.startsWith('Lu')) return 'lucide';
		if (getRegistryIcon(iconName)) return 'registry';
		
		// Fallback detection
		if (getLucideIcon(iconName)) return 'lucide';
		if (getSimpleIconSvg(iconName)) return 'simple';
		return 'fallback';
	});

	let simpleSvg = $derived(iconType() === 'simple' ? getSimpleIconSvg(iconName) : null);
	let LucideComp = $derived(iconType() === 'lucide' ? getLucideIcon(iconName) : null);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let RegistryComp = $derived(iconType() === 'registry' ? getRegistryIcon(iconName) : (null as any));
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let DirectComp = $derived(iconType() === 'src' ? src : (null as any));
</script>

<div 
	class="icon-container inline-flex items-center justify-center {className}"
	style="width: {typeof size === 'number' ? size + 'px' : size}; height: {typeof size === 'number' ? size + 'px' : size}; {style}"
>
	{#if iconType() === 'src' && DirectComp}
		<SvelteIconPack src={DirectComp} {color} size={size} />
	{:else if iconType() === 'registry' && RegistryComp}
		<SvelteIconPack src={RegistryComp} {color} size={size} />
	{:else if iconType() === 'lucide' && LucideComp}
		<LucideComp {color} size={size} strokeWidth={strokeWidth} />
	{:else}
		{#if simpleSvg}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html simpleSvg}
		{:else}
			<!-- Default Fallback Icon -->
			<svg 
				viewBox="0 0 24 24" 
				fill="none" 
				stroke={color} 
				stroke-width={strokeWidth} 
				stroke-linecap="round" 
				stroke-linejoin="round"
				class="w-full h-full"
			>
				<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
				<line x1="9" y1="9" x2="15" y2="15" />
				<line x1="15" y1="9" x2="9" y2="15" />
			</svg>
		{/if}
	{/if}
</div>

<style>
	.icon-container :global(svg) {
		width: 100%;
		height: 100%;
	}
</style>
