<script lang="ts">
	import { Icon as SvelteIconPack } from 'svelte-icons-pack';
	import { iconRegistry } from '$lib/icons/registry';
	import type { IconType } from 'svelte-icons-pack';
	import { onMount, type Component } from 'svelte';
	import { customIconStore } from '$lib/stores/icons.svelte';

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

	onMount(() => {
		customIconStore.init();
	});

	$effect(() => {
		if (iconName && iconType === 'fallback' && !customIconStore.loading) {
			customIconStore.reportMissing(iconName);
		}
	});

	// Utility to get Icon from Registry (Fuzzy Matching)
	function getRegistryIcon(name: string): IconType | null {
		if (!name) return null;

		// 1. Normalize name (kebab-case to PascalCase if needed)
		const normalized = name
			.split(/[-_]/)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join('');

		// 2. Try direct match
		if (iconRegistry[normalized]) return iconRegistry[normalized];

		// 3. Try case-insensitive exact match
		const lowerName = normalized.toLowerCase();
		const registryKeys = Object.keys(iconRegistry);

		let match = registryKeys.find((k) => k.toLowerCase() === lowerName);
		if (match) return iconRegistry[match];

		// 4. Try library-specific prefixes
		const prefixes: Record<string, string[]> = {
			Fa: ['FaSolid', 'FaRegular', 'FaBrands'],
			Io: ['IoLogo', 'IoIos', 'IoMd'],
			Ai: ['AiFill', 'AiOutline'],
			Si: ['Si'],
			Fi: ['Fi'],
			Lu: ['Lu'],
			Bs: ['Bs']
		};

		for (const [lib, variants] of Object.entries(prefixes)) {
			if (normalized.startsWith(lib)) {
				const base = normalized.slice(lib.length);
				for (const variant of variants) {
					const prefixedMatch = registryKeys.find(
						(k) => k.toLowerCase() === (variant + base).toLowerCase()
					);
					if (prefixedMatch) return iconRegistry[prefixedMatch];
				}
			}
		}

		// 5. Try suffix match (e.g., "Rocket" matching "FaSolidRocket")
		// Only for non-trivial names to avoid false positives
		if (normalized.length > 2) {
			const suffixMatch = registryKeys.find((k) => k.toLowerCase().endsWith(lowerName));
			if (suffixMatch) return iconRegistry[suffixMatch];
		}

		return null;
	}

	// Dynamic derived state for the icon
	let iconType = $derived.by(() => {
		if (src) return 'src';
		if (!iconName) return 'fallback';

		// Prioritize Static Registry (includes BS, FI, SI, LU mappings)
		if (getRegistryIcon(iconName)) return 'registry';

		// Secondary: Dynamic Registry (Firestore) - Only if it has SVG content
		if (customIconStore.registry[iconName]?.svg) return 'dynamic';

		return 'fallback';
	});

	let RegistryComp = $derived(iconType === 'registry' ? getRegistryIcon(iconName) : null);
	let DirectComp = $derived(iconType === 'src' ? src : null);
	let dynamicIcon = $derived(iconType === 'dynamic' ? customIconStore.registry[iconName] : null);
</script>

<div
	class="icon-container inline-flex items-center justify-center {className}"
	style="width: {typeof size === 'number' ? size + 'px' : size}; height: {typeof size === 'number'
		? size + 'px'
		: size}; {style}"
>
	{#if iconType === 'src' && DirectComp}
		{#if typeof DirectComp === 'object' && DirectComp !== null && 'a' in DirectComp}
			<SvelteIconPack src={DirectComp as IconType} {color} {size} />
		{:else}
			{@const Comp = DirectComp as GenericIconComponent}
			<Comp {color} {size} />
		{/if}
	{:else if iconType === 'registry' && RegistryComp}
		<SvelteIconPack src={RegistryComp} {color} {size} />
	{:else if iconType === 'dynamic' && dynamicIcon}
		<svg
			viewBox={dynamicIcon.viewBox || '0 0 24 24'}
			class="h-full w-full"
			style="fill: {color}; stroke: {color};"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html dynamicIcon.svg}
		</svg>
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
