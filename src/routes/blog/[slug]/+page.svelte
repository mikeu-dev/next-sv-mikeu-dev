<script lang="ts">
	import { onMount } from 'svelte';
	import type { SvelteComponent } from 'svelte';
	import type { BlogPageData } from './+page.server';
	import * as m from '@/lib/paraglide/messages';
	import { ArrowLeft } from '@lucide/svelte';

	interface SvelteModule {
		default: typeof SvelteComponent;
	}

	let { data }: { data: BlogPageData } = $props();

	const posts = import.meta.glob('/src/lib/posts/**/*.svx');

	let Content = $state<typeof SvelteComponent | null>(null);

	onMount(async () => {
		const match = Object.keys(posts).find(
			(p) => p.includes(`/${data.locale}/`) && p.endsWith(`${data.slug}.svx`)
		);

		if (!match) {
			console.error('File artikel tidak ditemukan:', data.slug);
			return;
		}

		const module = (await posts[match]()) as SvelteModule;
		Content = module.default;
	});
</script>

<article class="mx-auto prose prose-lg max-w-3xl py-8 prose-neutral dark:prose-invert">
	<div class="mb-8">
		<a
			href="/blog"
			class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground no-underline"
		>
			<ArrowLeft class="mr-2 size-4" />
			{m.blog_button_back()}
		</a>
	</div>
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
		<Content />
	{:else}
		<p>{m.blog_loading()}</p>
	{/if}
</article>
