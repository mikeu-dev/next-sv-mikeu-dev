<script lang="ts">
	import Breadcrumb from '$lib/components/ui/breadcrumb.svelte';
	import type { PageData } from './$types';
	import { m } from '@/lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import { ArrowLeft, Clock } from '@lucide/svelte';
	import MarkdownRenderer from '$lib/components/ui/markdown-renderer.svelte';
	import ReadingProgress from '$lib/components/blog/reading-progress.svelte';
	import TableOfContents from '$lib/components/blog/table-of-contents.svelte';
	import RelatedPosts from '$lib/components/blog/related-posts.svelte';
	import BlogReactions from '$lib/components/blog/blog-reactions.svelte';
	import BlogShare from '$lib/components/blog/blog-share.svelte';
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
	image={data.meta.image}
	type="article"
	article={{
		publishedTime: data.meta.date,
		author: 'Mikeu',
		tags: data.meta.tags
	}}
/>

<ReadingProgress />

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<div class="mx-auto mt-20 max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="grid grid-cols-1 gap-12 xl:grid-cols-[1fr_280px]">
		<article class="min-w-0">
			<Breadcrumb items={breadcrumbItems} />

			<div class="mb-8">
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a
					href="{base}/blog"
					class="inline-flex items-center text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
				>
					<ArrowLeft class="mr-2 size-4" />
					{m.blog_button_back()}
				</a>
			</div>

			<header class="mb-16">
				<h1 class="font-poppins text-4xl leading-tight font-black tracking-tight md:text-6xl">
					{data.meta.title}<span class="text-primary">.</span>
				</h1>

				<div class="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
					{#if data.meta.date}
						<time datetime={data.meta.date} class="flex items-center">
							{new Date(data.meta.date).toLocaleDateString(getLocale(), {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</time>
					{/if}

					{#if data.meta.readingTime}
						<div class="flex items-center gap-2">
							<Clock class="size-4" />
							<span>{data.meta.readingTime} min read</span>
						</div>
					{/if}
				</div>
			</header>

			<MarkdownRenderer content={data.content} isRendered={true} />

			<div
				class="flex flex-col gap-8 border-t pt-10 pb-4 md:flex-row md:items-center md:justify-between"
			>
				<BlogReactions reactions={data.reactions} />
				<BlogShare title={data.meta.title} />
			</div>

			<RelatedPosts posts={data.relatedPosts} />
		</article>

		<TableOfContents headings={data.headings || []} />
	</div>
</div>
