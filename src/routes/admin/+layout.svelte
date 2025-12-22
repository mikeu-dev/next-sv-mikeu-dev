<script lang="ts">
	import { authState } from '@/lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let { children } = $props();

	$effect(() => {
		if (browser && authState.initialized && !authState.user) {
			goto('/');
		}
	});
</script>

{#if authState.user}
	<div class="min-h-screen bg-background">
		<header class="border-b">
			<div class="container flex h-16 items-center justify-between px-4">
				<h1 class="text-xl font-bold">Admin Dashboard</h1>
				<div class="flex items-center gap-4">
					<span class="text-sm text-muted-foreground">{authState.user.email}</span>
				</div>
			</div>
		</header>
		<main class="container px-4 py-8">
			{@render children()}
		</main>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center">
		<p>Loading...</p>
	</div>
{/if}
