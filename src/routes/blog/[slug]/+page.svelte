<script lang="ts">
	import type { BlogPageData } from './+page.server';
	import * as m from '@/lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import { ArrowLeft } from '@lucide/svelte';
	import MarkdownRenderer from '$lib/components/ui/markdown-renderer.svelte';
	import { base } from '$app/paths';

	let { data }: { data: BlogPageData } = $props();
</script>

<article class="mx-auto prose prose-lg mt-20 max-w-3xl py-8 prose-neutral dark:prose-invert">
	<div class="mb-8">
		<a
			href="{base}/blog"
			class="inline-flex items-center text-sm text-muted-foreground no-underline hover:text-foreground"
		>
			<ArrowLeft class="mr-2 size-4" />
			{m.blog_button_back()}
		</a>
	</div>
	<header class="mb-12 text-center">
		<h1 class="text-4xl font-bold tracking-tight">{data.meta.title}</h1>
		{#if data.meta.date}
			<p class="mt-4 text-muted-foreground">
				{new Date(data.meta.date).toLocaleDateString(getLocale(), {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}
			</p>
		{/if}
	</header>

	<MarkdownRenderer content={data.content} />
</article>
