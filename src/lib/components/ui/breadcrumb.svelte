<script lang="ts">
	import { page } from '$app/state';
	import { localizeHref } from '$lib/paraglide/runtime';
	import Icon from './icon.svelte';

	let { items = [] } = $props<{
		items?: { label: string; href: string }[];
	}>();

	// If no items are passed, try to generate from path
	let crumbs = $derived.by(() => {
		if (items.length > 0) return items;

		const path = page.url.pathname.replace(/\/$/, '');
		const segments = path.split('/').filter(Boolean);

		// Remove locale prefix if present
		if (segments.length > 0 && ['en', 'id'].includes(segments[0])) {
			segments.shift();
		}

		return segments.map((segment, i) => {
			const href = '/' + segments.slice(0, i + 1).join('/');
			return {
				label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
				href: localizeHref(href)
			};
		});
	});
</script>

<nav aria-label="Breadcrumb" class="mb-4 flex">
	<ol class="flex items-center space-x-2 text-sm text-muted-foreground">
		<li>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a
				href={localizeHref('/')}
				class="flex items-center transition-colors hover:text-foreground"
				aria-label="Home"
			>
				<Icon iconName="BsHouseFill" size={14} />
			</a>
		</li>

		{#each crumbs as crumb, i (crumb.href)}
			<li class="flex items-center space-x-2">
				<Icon iconName="BsChevronRight" size={12} class="text-muted-foreground/50" />
				{#if i === crumbs.length - 1}
					<span
						class="max-w-[150px] truncate font-medium text-foreground md:max-w-none"
						aria-current="page"
					>
						{crumb.label}
					</span>
				{:else}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a
						href={crumb.href}
						class="max-w-[150px] truncate transition-colors hover:text-foreground md:max-w-none"
					>
						{crumb.label}
					</a>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	/* Optional: ensure smooth transitions */
	a {
		transition: color 0.2s ease-in-out;
	}
</style>
