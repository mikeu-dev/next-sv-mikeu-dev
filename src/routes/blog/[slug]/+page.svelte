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
	<div class="flex flex-col gap-5">
		<ol
			aria-label={m.gis_breadcrumb()}
			class="m-0 flex list-none flex-wrap gap-2 p-0 font-mono text-sm text-ink-soft"
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
		<div class="shard flex max-w-[1040px] flex-col">
			<div
				class="tab tab-r flex min-h-[50px] max-w-[calc(100%-30px)] flex-wrap items-center gap-1.5 self-start px-3.5 py-2"
			>
				{#each data.meta.tags?.length ? data.meta.tags.slice(0, 4) : ['Blog'] as tag, i (tag)}
					<a
						href={localizeHref(`/blog?tag=${encodeURIComponent(tag)}`)}
						class="px-3 py-1 text-sm font-extrabold no-underline {i % 2
							? 'rounded-leaf-sm-r'
							: 'rounded-leaf-sm'} {i === 0
							? 'bg-primary/12 text-primary'
							: 'bg-well text-foreground'}">{tag}</a
					>
				{/each}
			</div>
			<div class="flex flex-col gap-6 rounded-[0_34px_34px_34px] bg-card p-[clamp(24px,3vw,40px)]">
				<h1
					id="post-title"
					class="m-0 scroll-mt-28 text-[clamp(36px,4.6vw,64px)] leading-[1.05] font-black tracking-[-0.03em]"
				>
					{data.meta.title}
				</h1>
				<div class="flex flex-wrap items-center gap-3.5">
					<span
						class="flex size-11 items-center justify-center rounded-leaf-sm bg-primary font-black text-primary-foreground"
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
		</div>
	</div>

	<div
		class="shard aspect-[21/8] min-h-[240px] overflow-hidden rounded-[30px] border-[10px] border-card bg-card"
	>
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

	<div class="flex flex-wrap items-start gap-2.5">
		<article
			class="shard max-w-[880px] min-w-0 flex-[999_1_560px] rounded-[30px] bg-card p-[clamp(22px,3.4vw,48px)]"
		>
			<MarkdownRenderer content={data.content} isRendered={true} />
			<div
				class="mt-12 flex flex-col gap-6 rounded-leaf bg-well px-5 py-4 md:flex-row md:items-center md:justify-between"
			>
				<BlogReactions reactions={data.reactions} />
				<BlogShare title={data.meta.title} />
			</div>
		</article>

		<aside aria-label={m.gis_toc()} class="shard sticky top-6 flex flex-[1_1_280px] flex-col">
			<span
				class="tab tab-r flex h-11 items-center self-start px-5 font-mono text-xs font-semibold text-ink-soft"
				>{m.gis_toc()}</span
			>
			<div class="flex flex-col gap-1.5 rounded-[0_30px_30px_30px] bg-card p-3.5">
				{#if data.headings?.length}
					<TableOfContents headings={data.headings || []} title={data.meta.title} />
				{/if}
				<div class="mt-2 flex flex-col gap-2.5 rounded-leaf bg-well p-4">
					<span class="font-black">Riki Ruswandi</span>
					<span class="text-sm leading-normal text-ink-soft">{m.gis_author_bio()}</span>
					<a
						href={localizeHref('/about')}
						class="text-[15px] font-extrabold text-primary hover:text-foreground"
						>{m.gis_about_me_link()}</a
					>
				</div>
				{#if PUBLIC_TRAKTEER_URL}
					<div class="flex flex-col gap-3 rounded-leaf-r bg-well p-4">
						<span class="text-sm leading-normal text-ink-soft">{m.blog_support_desc()}</span>
						<a
							href={PUBLIC_TRAKTEER_URL}
							target="_blank"
							rel="noopener noreferrer"
							class="btn-pill-solid min-h-11 text-[15px]">{m.blog_support_cta()}</a
						>
					</div>
				{/if}
			</div>
		</aside>
	</div>

	<RelatedPosts posts={data.relatedPosts} />
</div>
