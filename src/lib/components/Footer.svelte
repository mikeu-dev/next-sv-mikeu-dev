<script lang="ts">
	import { Github, Linkedin, Mail } from '@lucide/svelte';

	const socialLinks = [
		{
			href: 'https://github.com/mikeu-dev',
			icon: Github,
			label: 'GitHub'
		},
		{
			href: 'mailto:rikiruswandi28@gmail.com',
			icon: Mail,
			label: 'Email'
		}
		// Add other links like LinkedIn here
	];
</script>

<footer class="border-t py-8 px-4 bg-gradient-to-b from-slate-100 to-background dark:from-slate-900">
	<div class="container flex flex-col items-center justify-between gap-4 md:flex-row">
		<p class="text-sm text-muted-foreground">
			&copy; {new Date().getFullYear()} Riki Ruswandi. All rights reserved.
		</p>
		<div class="flex items-center gap-4">
			{#each socialLinks as link}
				<a
					href={link.href}
					target="_blank"
					rel="noopener noreferrer"
					class="text-muted-foreground transition-colors hover:text-foreground"
					aria-label={link.label}
				>
					<svelte:component this={link.icon} class="size-5" />
				</a>
			{/each}
		</div>
	</div>
</footer>
