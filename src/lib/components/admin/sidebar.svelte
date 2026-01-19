<script lang="ts">
	import { page } from '$app/state';
	import {
		LayoutDashboard,
		FolderGit2,
		FileText,
		Zap,
		Map,
		Cpu,
		Share2,
		Users,
		Database,
		Menu,
		X
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { fade, slide } from 'svelte/transition';

	let isOpen = $state(false);

	const links = [
		{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
		{ href: '/admin/projects', label: 'Projects', icon: FolderGit2 },
		{ href: '/admin/blog', label: 'Blog', icon: FileText },
		{ href: '/admin/skills', label: 'Skills', icon: Zap },
		{ href: '/admin/journey', label: 'Journey', icon: Map },
		{ href: '/admin/techstack', label: 'Tech Stack', icon: Cpu },
		{ href: '/admin/socials', label: 'Socials', icon: Share2 },
		{ href: '/admin/contacts', label: 'Contacts', icon: Users },
		{ href: '/admin/migrate', label: 'Migrate', icon: Database }
	];

	function toggleSidebar() {
		isOpen = !isOpen;
	}
</script>

<!-- Mobile Toggle -->
<div class="fixed top-3 left-4 z-50 md:hidden">
	<Button variant="outline" size="icon" onclick={toggleSidebar}>
		{#if isOpen}
			<X class="h-5 w-5" />
		{:else}
			<Menu class="h-5 w-5" />
		{/if}
	</Button>
</div>

<!-- Sidebar Container -->
<aside
	class={cn(
		'fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-background transition-transform duration-200 ease-in-out md:translate-x-0',
		isOpen ? 'translate-x-0' : '-translate-x-full'
	)}
>
	<div class="flex h-16 items-center justify-center border-b px-6">
		<a href="/admin" class="flex items-center gap-2 text-xl font-bold">
			<span>Admin Panel</span>
		</a>
	</div>

	<nav class="flex flex-col gap-1 p-4">
		{#each links as link}
			<a
				href={link.href}
				onclick={() => (isOpen = false)}
				class={cn(
					'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
					page.url.pathname === link.href
						? 'bg-accent text-accent-foreground'
						: 'text-muted-foreground'
				)}
			>
				<link.icon class="h-4 w-4" />
				{link.label}
			</a>
		{/each}
	</nav>
</aside>

<!-- Overlay for mobile -->
{#if isOpen}
	<div
		class="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
		transition:fade
		onclick={toggleSidebar}
	></div>
{/if}
