<script lang="ts">
	import { onMount } from 'svelte';
	import type { SvelteComponent } from 'svelte';
	import type { BlogPageData } from './+page.server';

	export let data: BlogPageData;

	let Content: typeof SvelteComponent | null = null;

	onMount(async () => {
		const module = await import(data.path);
		Content = module.default;
	});
</script>

<article
	class="mx-auto prose prose-lg max-w-3xl py-8 prose-neutral dark:prose-invert"
>
	<header class="mb-12 text-center">
		<h1 class="text-4xl font-bold tracking-tight">{data.meta.title}</h1>
		{#if data.meta.date}
			<p class="mt-4 text-muted-foreground">
				{new Date(data.meta.date).toLocaleDateString('id-ID', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}
			</p>
		{/if}
	</header>

	{#if Content}
		<svelte:component this={Content} />
	{:else}
		<p>Memuat artikel...</p>
	{/if}
</article>
