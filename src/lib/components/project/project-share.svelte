<script lang="ts">
	import { Share2, Linkedin, Link, MessageCircle, Twitter } from '@lucide/svelte';
	import { page } from '$app/state';
	import { m } from '$lib/paraglide/messages';
	import { toast } from 'svelte-sonner';

	let { title = '' } = $props<{ title: string }>();

	const url = $derived(page.url.href);

	const shareLinks = $derived([
		{
			name: 'WhatsApp',
			icon: MessageCircle,
			href: `https://api.whatsapp.com/send?text=${encodeURIComponent(title)}%20${encodeURIComponent(url + '?v=' + Date.now())}`,
			color: 'hover:bg-green-500 hover:text-white',
			bg: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
		},
		{
			name: 'Twitter',
			icon: Twitter,
			href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
			color: 'hover:bg-sky-500 hover:text-white',
			bg: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400'
		},
		{
			name: 'LinkedIn',
			icon: Linkedin,
			href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
			color: 'hover:bg-blue-600 hover:text-white',
			bg: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
		}
	]);

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(url);
			toast.success(m.blog_link_copied());
		} catch {
			toast.error('Failed to copy link');
		}
	}

	async function handleWebShare() {
		if (navigator.share) {
			try {
				await navigator.share({
					title,
					url
				});
			} catch {
				// User cancelled or share failed
			}
		}
	}
</script>

<div class="flex items-center gap-3">
	<span
		class="text-xs font-bold tracking-wider text-card-foreground/60 uppercase dark:text-muted-foreground"
		>{m.blog_share()}</span
	>

	<div class="flex items-center gap-2">
		{#each shareLinks as link (link.name)}
			<a
				href={link.href}
				target="_blank"
				rel="noopener noreferrer"
				class={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${link.bg} ${link.color}`}
				title={`Share on ${link.name}`}
			>
				<link.icon class="size-4" />
			</a>
		{/each}

		<button
			onclick={copyLink}
			class="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 hover:bg-foreground hover:text-background"
			title={m.blog_copy_link()}
		>
			<Link class="size-4" />
		</button>

		<button
			onclick={handleWebShare}
			class="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 hover:bg-primary hover:text-primary-foreground sm:hidden"
			title="Share"
		>
			<Share2 class="size-4" />
		</button>
	</div>
</div>
