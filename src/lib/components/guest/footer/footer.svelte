<script lang="ts">
	import { onMount } from 'svelte';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { m } from '#lib/paraglide/messages.js';
	import type { SocialLink } from '#lib/types.js';

	let {
		socials = [],
		visitorStats = { total: 0, today: 0 }
	}: {
		socials?: unknown[];
		visitorStats?: { total: number; today: number };
	} = $props();

	// Purwakarta is UTC+7 (WIB). Rendered client-side only so SSR and
	// hydration never disagree about the second.
	let clock = $state('');
	onMount(() => {
		const tick = () => {
			clock = new Date(Date.now() + 7 * 3600_000).toISOString().slice(11, 19);
		};
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	});

	let links = $derived(
		(socials as Partial<SocialLink>[]).filter(
			(l): l is SocialLink => typeof l?.href === 'string' && typeof l?.label === 'string'
		)
	);

	const legal = [
		{ href: '/privacy-policy', label: 'Privacy' },
		{ href: '/terms-of-service', label: 'Terms' },
		{ href: '/disclaimer', label: 'Disclaimer' }
	];
</script>

<footer class="shard m-3 sm:m-4">
	<div
		class="flex flex-wrap items-start justify-between gap-x-8 gap-y-5 rounded-[30px] bg-card px-6 py-6 sm:px-7"
	>
		<div class="flex max-w-xl flex-col gap-1.5">
			<span class="text-lg font-black">mikeu<span class="text-primary">.gis</span></span>
			<span class="text-sm text-ink-soft">{m.gis_footer_blurb()}</span>
			<span class="mt-3 font-mono text-[13px] text-muted-foreground">
				© {new Date().getFullYear()} Riki Ruswandi · {m.gis_footer_clock()}
				<b class="text-foreground tabular-nums">{clock || '--:--:--'}</b> WIB
			</span>
			{#if visitorStats.total > 0}
				<span class="font-mono text-xs text-muted-foreground">
					{m.gis_footer_visitors({
						total: visitorStats.total.toLocaleString(),
						today: visitorStats.today.toLocaleString()
					})}
				</span>
			{/if}
		</div>
		<nav aria-label="Footer" class="flex flex-wrap gap-x-[18px] gap-y-2 font-mono text-[13px]">
			{#each links as link (link.href)}
				<a
					href={link.href}
					target="_blank"
					rel="noopener noreferrer"
					class="text-ink-soft underline hover:text-foreground">{link.label}</a
				>
			{/each}
			{#each legal as link (link.href)}
				<a href={localizeHref(link.href)} class="text-ink-soft underline hover:text-foreground"
					>{link.label}</a
				>
			{/each}
		</nav>
	</div>
</footer>
