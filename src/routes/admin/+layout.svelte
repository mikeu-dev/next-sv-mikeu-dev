<script lang="ts">
	import { authState } from '@/lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	import Sidebar from '$lib/components/admin/sidebar.svelte';
	import Footer from '$lib/components/guest/footer/footer.svelte';

	let { data, children } = $props();

	$effect(() => {
		if (browser && authState.initialized && !authState.user) {
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto('/auth/login');
		}
	});
</script>

{#if authState.user}
	<div class="flex min-h-screen bg-background">
		<!-- Sidebar -->
		<Sidebar />

		<!-- Main Content -->
		<div class="flex min-h-screen flex-1 flex-col md:ml-64">
			<header
				class="sticky top-0 z-30 flex h-16 items-center border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60"
			>
				<div class="ml-auto flex items-center gap-4">
					<span class="text-sm text-muted-foreground">{authState.user.email}</span>
				</div>
			</header>

			<main class="container flex-1 p-6 md:p-8">
				{@render children()}
			</main>

			<Footer socials={data.socials} visitorStats={data.visitorStats} />
		</div>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center">
		<p class="text-muted-foreground">Loading admin panel...</p>
	</div>
{/if}
