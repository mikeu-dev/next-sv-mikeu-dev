<script lang="ts">
	import Breadcrumb from '$lib/components/ui/breadcrumb.svelte';
	import type { PageData } from './$types';
	import * as m from '@/lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import { ArrowLeft } from '@lucide/svelte';
	import MarkdownRenderer from '$lib/components/ui/markdown-renderer.svelte';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import SEO from '$lib/components/seo/seo.svelte';

	let { data }: { data: PageData } = $props();

	let breadcrumbItems = $derived([
		{ label: 'Blog', href: '/blog' },
		{ label: data.meta.title, href: page.url.pathname }
	]);
</script>

<SEO
	title={data.meta.title}
	description={data.meta.description}
	type="article"
	article={{
		publishedTime: data.meta.date,
		author: 'Mikeu'
	}}
/>

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<article class="mx-auto mt-20 max-w-3xl py-8">
	<Breadcrumb items={breadcrumbItems} />

	<div class="mb-8">
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a
			href="{base}/blog"
			class="inline-flex items-center text-sm text-muted-foreground no-underline hover:text-foreground"
		>
			<ArrowLeft class="mr-2 size-4" />
			{m.blog_button_back()}
		</a>
	</div>
	<header class="mb-12 text-center">
		<h1 class="font-poppins text-4xl font-black tracking-tight md:text-5xl">
			{data.meta.title}<span class="text-primary space-x-0">.</span>
		</h1>
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
