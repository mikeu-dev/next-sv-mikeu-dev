<script lang="ts">
	import type { PageData } from './$types';
	import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
	import { m } from '#lib/paraglide/messages.js';
	import { PUBLIC_TRAKTEER_URL } from '$app/env/public';
	import MarkdownRenderer from '#lib/components/ui/markdown-renderer.svelte';
	import ReadingProgress from '#lib/components/blog/reading-progress.svelte';
	import TableOfContents from '#lib/components/blog/table-of-contents.svelte';
	import RelatedPosts from '#lib/components/blog/related-posts.svelte';
	import BlogReactions from '#lib/components/blog/blog-reactions.svelte';
	import BlogShare from '#lib/components/blog/blog-share.svelte';
	import MapThumb from '#lib/components/guest/map/map-thumb.svelte';
	import SEO from '#lib/components/seo/seo.svelte';
	import { optimizeImage } from '#lib/utils/image.util.js';

	let { data }: { data: PageData } = $props();

	let dateText = $derived(
		data.meta.date
			? new Date(data.meta.date).toLocaleDateString(getLocale() === 'en' ? 'en-GB' : 'id-ID', {
					day: 'numeric',
					month: 'long',
					year: 'numeric'
				})
			: ''
	);
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

<div
	class="mx-auto box-border flex max-w-[1440px] flex-col gap-10 px-[clamp(16px,4vw,56px)] pt-28 pb-24 sm:pt-32"
>
	<div class="flex max-w-[980px] flex-col gap-5">
		<ol
			aria-label={m.gis_breadcrumb()}
			class="m-0 flex list-none flex-wrap gap-2 p-0 font-mono text-sm text-muted-foreground"
		>
			<li>
				<a href={localizeHref('/')} class="underline hover:text-foreground">{m.gis_home()}</a>
			</li>
			<li aria-hidden="true">/</li>
			<li><a href={localizeHref('/blog')} class="underline hover:text-foreground">Blog</a></li>
			<li aria-hidden="true">/</li>
			<li aria-current="page" class="line-clamp-1 font-semibold text-foreground">
				{data.meta.title}
			</li>
		</ol>
		{#if data.meta.tags?.length}
			<div class="flex flex-wrap gap-2">
				{#each data.meta.tags as tag, i (tag)}
					<a
						href={localizeHref(`/blog?tag=${encodeURIComponent(tag)}`)}
						class="rounded-full px-3.5 py-1.5 text-sm font-extrabold {i === 0
							? 'bg-accent text-primary'
							: 'bg-secondary text-foreground'}">{tag}</a
					>
				{/each}
			</div>
		{/if}
		<h1
			id="post-title"
			class="m-0 scroll-mt-28 text-[clamp(36px,4.6vw,64px)] leading-[1.05] font-black tracking-[-0.03em]"
		>
			{data.meta.title}
		</h1>
		<div class="flex flex-wrap items-center gap-3.5">
			<span
				class="flex size-11 items-center justify-center rounded-full bg-primary font-black text-primary-foreground"
				>M</span
			>
			<span class="flex flex-col">
				<span class="font-black">Riki Ruswandi</span>
				<span class="font-mono text-[13px] text-muted-foreground">
					{#if data.meta.date}<time datetime={data.meta.date}>{dateText}</time
						>{/if}{#if data.meta.readingTime}
						· {m.gis_min_read({ count: data.meta.readingTime })}{/if}
				</span>
			</span>
		</div>
	</div>

	<div class="aspect-[21/8] min-h-[240px] overflow-hidden rounded-[32px] border border-border">
		{#if data.meta.image}
			<img
				src={optimizeImage(data.meta.image, { width: 1600, quality: 80 })}
				alt=""
				class="size-full object-cover"
			/>
		{:else}
			<MapThumb x={35} y={45} zoom={2.2} variant="route" seed={data.meta.title.length} />
		{/if}
	</div>

	<div class="flex flex-wrap items-start gap-x-16 gap-y-10">
		<article class="max-w-[760px] min-w-0 flex-[999_1_560px]">
			<MarkdownRenderer content={data.content} isRendered={true} />
			<div
				class="mt-12 flex flex-col gap-6 border-t border-border pt-6 md:flex-row md:items-center md:justify-between"
			>
				<BlogReactions reactions={data.reactions} />
				<BlogShare title={data.meta.title} />
			</div>
		</article>

		<aside
			aria-label={m.gis_toc()}
			class="sticky top-6 flex flex-[1_1_280px] flex-col gap-1.5 rounded-[28px] border border-border bg-card p-3.5"
		>
			{#if data.headings?.length}
				<span class="px-2.5 py-1.5 font-mono text-xs font-semibold text-muted-foreground"
					>{m.gis_toc()}</span
				>
				<TableOfContents headings={data.headings || []} title={data.meta.title} />
			{/if}
			<div class="mt-2 flex flex-col gap-2.5 rounded-[20px] bg-secondary p-4">
				<span class="font-black">Riki Ruswandi</span>
				<span class="text-sm leading-normal text-ink-soft">{m.gis_author_bio()}</span>
				<a
					href={localizeHref('/about')}
					class="text-[15px] font-extrabold text-primary hover:text-foreground"
					>{m.gis_about_me_link()}</a
				>
			</div>
			{#if PUBLIC_TRAKTEER_URL}
				<div class="flex flex-col gap-3 rounded-[20px] border border-border p-4">
					<span class="text-sm leading-normal text-ink-soft">{m.blog_support_desc()}</span>
					<a
						href={PUBLIC_TRAKTEER_URL}
						target="_blank"
						rel="noopener noreferrer"
						class="btn-pill-solid min-h-11 text-[15px]">{m.blog_support_cta()}</a
					>
				</div>
			{/if}
		</aside>
	</div>

	<RelatedPosts posts={data.relatedPosts} />
</div>
