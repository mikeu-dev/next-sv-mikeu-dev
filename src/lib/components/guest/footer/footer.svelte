<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as m from '@/lib/paraglide/messages';
	import { Github, Instagram, Linkedin, Mail } from '@lucide/svelte';

	let { socials, visitorStats = { total: 0, today: 0 } } = $props();

	const iconMap: Record<string, unknown> = {
		Github: Github,
		Instagram: Instagram,
		LinkedIn: Linkedin,
		Mail: Mail
	};

	function getIcon(name: string | undefined | null) {
		if (!name) return Mail;

		// Normalize input: remove 'Si' prefix if present and lowercase
		const normalized = name.replace(/^Si/, '').toLowerCase();

		// Find matching key case-insensitively
		const match = Object.keys(iconMap).find((key) => key.toLowerCase() === normalized);

		return (match ? iconMap[match] : Mail) as typeof Github;
	}
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<footer class="border-t bg-linear-to-b from-slate-100 to-background px-4 py-6 dark:from-slate-900">
	<div
		class="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-2 md:flex-row md:justify-between md:gap-4"
	>
		<div class="flex flex-col items-center gap-2 md:items-start">
			<p class="text-center text-sm text-muted-foreground md:text-left">
				&copy; {m.footer_copyright({
					year: new Date().getFullYear(),
					name: 'Mikeu Dev'
				})}
			</p>
			<!-- eslint-disable svelte/no-navigation-without-resolve -->
			<div
				class="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground/60 md:justify-start"
			>
				<a href="/privacy-policy" class="transition-colors hover:text-primary">Privacy Policy</a>
				<a href="/terms-of-service" class="transition-colors hover:text-primary">Terms of Service</a
				>
				<a href="/disclaimer" class="transition-colors hover:text-primary">Disclaimer</a>
			</div>
		</div>

		<div class="flex flex-wrap items-center justify-center gap-4">
			{#each socials as link (link.href)}
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger>
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={link.label}
								class="flex cursor-pointer items-center justify-center rounded-full transition-all hover:scale-110"
								style={`background-color: ${link.color}1A; color: ${link.color}; width: 2rem; height: 2rem;`}
							>
								{#if link.svg}
									<!-- eslint-disable-next-line svelte/no-at-html-tags -->
									<div class="size-4">{@html link.svg}</div>
								{:else}
									{@const Icon = getIcon(link.iconName)}
									<Icon class="size-4" />
								{/if}
							</a>
						</Tooltip.Trigger>

						<Tooltip.Content>
							<p>{link.label}</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
			{/each}
		</div>
	</div>
	{#if visitorStats.total > 0}
		<div class="mt-4 flex w-full justify-center border-t border-border/50 pt-2 md:justify-end">
			<div class="flex gap-4 text-xs text-muted-foreground/50">
				<span>Visitors: {visitorStats.total.toLocaleString()}</span>
				<span>Today: {visitorStats.today.toLocaleString()}</span>
			</div>
		</div>
	{/if}
</footer>
