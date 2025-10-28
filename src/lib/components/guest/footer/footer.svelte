<script lang="ts">
	import { socialLinks } from '@/lib/data/socials';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as m from '@/lib/paraglide/messages';
</script>

<footer
	class="border-t bg-gradient-to-b from-slate-100 to-background px-4 py-8 dark:from-slate-900"
>
	<div class="container flex flex-col items-center gap-2 md:flex-row md:justify-between md:gap-4">
		<p class="text-sm text-muted-foreground">
			&copy; {m.footer_copyright({
				year:new Date().getFullYear(),
				name:"Mikeu Dev"
			})}
		</p>
		<div class="flex items-center gap-4">
			{#each socialLinks as link}
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger>
							<a
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={link.label}
								class="flex cursor-pointer items-center justify-center rounded-full"
								style={`background-color: ${link.color}1A; color: ${link.color}; width: 2rem; height: 2rem;`}
							>
								<svelte:component this={link.icon} class="size-4" />
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
</footer>
