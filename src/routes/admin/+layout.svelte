<script lang="ts">
	import { authState } from '@/lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	import Sidebar from '$lib/components/admin/sidebar.svelte';
	import Footer from '$lib/components/guest/footer/footer.svelte';
	import SEO from '$lib/components/seo/seo.svelte';
	import { base } from '$app/paths';
	import { localizeHref } from '$lib/paraglide/runtime';

	let { data, children } = $props();

	$effect(() => {
		if (browser && authState.initialized && !authState.user) {
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto('/auth/login');
		}
	});
</script>

<SEO noindex={true} />

<!-- eslint-disable svelte/no-navigation-without-resolve -->

{#if authState.user}
	<div class="flex min-h-screen bg-background">
		<!-- Sidebar -->
		<Sidebar />

		<!-- Main Content -->
		<div class="flex min-h-screen flex-1 flex-col md:ml-64">
			<header
				class="sticky top-0 z-30 flex h-16 items-center border-b bg-background/95 px-6 backdrop-blur supports-backdrop-filter:bg-background/60"
			>
				<div class="ml-auto flex items-center gap-4">
					<a
						href={localizeHref(`${base}/`)}
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						title="Open portfolio in new tab"
					>
						<span>View Portfolio</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="lucide lucide-external-link"
						>
							<path d="M15 3h6v6" />
							<path d="M10 14 21 3" />
							<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
						</svg>
					</a>
					<div class="h-4 w-px bg-border"></div>
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
