<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { PageData } from './$types';
	import type { BlogPost } from '#lib/types.js';
	import SEO from '#lib/components/seo/seo.svelte';
	import PageHeader from '#lib/components/guest/map/page-header.svelte';
	import MapThumb from '#lib/components/guest/map/map-thumb.svelte';
	import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
	import { optimizeImage } from '#lib/utils/image.util.js';
	import contoursScene from '#lib/assets/scenes/blog-contours.svg?raw';

	let { data }: { data: PageData } = $props();
	const locale = getLocale();

	let loadedPosts = $state<BlogPost[]>([]);
	let nextCursorState = $state<string | null | undefined>(undefined);
	let isLoadingMore = $state(false);

	const allPosts = $derived([...(data.posts as BlogPost[]), ...loadedPosts]);
	const nextCursor = $derived(nextCursorState !== undefined ? nextCursorState : data.nextCursor);

	// Reset pagination whenever the server data changes (new search / tag).
	$effect(() => {
		void data.posts;
		loadedPosts = [];
		nextCursorState = undefined;
	});

	const featured = $derived(!data.search && !data.tag ? allPosts[0] : null);
	const gridPosts = $derived(featured ? allPosts.slice(1) : allPosts);

	async function loadMore() {
		if (isLoadingMore || !nextCursor) return;
		isLoadingMore = true;
		try {
			const params = new URLSearchParams({
				lastDate: String(nextCursor),
				q: data.search || '',
				tag: data.tag || ''
			});
			const result = await (await fetch(`/api/blog?${params}`)).json();
			if (result.posts?.length) {
				loadedPosts = [...loadedPosts, ...result.posts];
				nextCursorState = result.nextCursor;
			} else nextCursorState = null;
		} catch (err) {
			console.error('Error loading more posts:', err);
		} finally {
			isLoadingMore = false;
		}
	}

	const dateFmt = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
	function fmt(date: string) {
		const d = new Date(date);
		return Number.isNaN(d.getTime()) ? date : dateFmt.format(d);
	}
	/** Stable pseudo-location per post for its map thumbnail. */
	function spot(slug: string) {
		let h = 0;
		for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
		return { x: 25 + (h % 50), y: 25 + ((h >>> 8) % 50), seed: h % 97 };
	}

	const chip = (on: boolean, i: number) =>
		`flex min-h-11 items-center px-4 text-[15px] font-extrabold no-underline transition-colors ${i % 2 ? 'rounded-leaf-r' : 'rounded-leaf'} ${on ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-white dark:hover:bg-white/10'}`;
	const tagHref = (t: string) => localizeHref(t ? `/blog?tag=${encodeURIComponent(t)}` : '/blog');
</script>

<SEO title={m.blog_title()} description={m.blog_subtitle()} />

<PageHeader
	eyebrow={m.gis_blog_page_eyebrow()}
	title={m.gis_blog_page_title()}
	lead={m.blog_subtitle()}
	scene={contoursScene}
/>

<div
	class="mx-auto box-border flex max-w-[1440px] flex-col gap-6 px-[clamp(16px,4vw,56px)] pt-10 pb-24"
>
	<form
		action={localizeHref('/blog')}
		method="GET"
		role="search"
		class="shard flex flex-wrap items-center gap-3 rounded-[30px] bg-card p-2.5"
	>
		<label
			class="flex min-h-[52px] flex-[1_1_320px] items-center gap-2.5 rounded-leaf bg-well px-[18px]"
		>
			<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
				<circle cx="9" cy="9" r="6" fill="none" stroke="var(--muted-foreground)" stroke-width="2" />
				<path
					d="M14 14l4 4"
					stroke="var(--muted-foreground)"
					stroke-width="2"
					stroke-linecap="round"
				/>
			</svg>
			<span class="sr-only">{m.gis_search_posts()}</span>
			<input
				type="search"
				name="q"
				value={data.search}
				placeholder={m.gis_search_posts()}
				class="min-w-0 flex-1 border-0 bg-transparent text-base font-semibold text-foreground outline-none placeholder:text-muted-foreground"
			/>
		</label>
		{#if data.tag}<input type="hidden" name="tag" value={data.tag} />{/if}
	</form>

	{#if data.tags?.length}
		<nav aria-label={m.gis_categories()} class="flex flex-wrap gap-2">
			<a href={tagHref('')} aria-current={!data.tag ? 'page' : undefined} class={chip(!data.tag, 0)}
				>{m.gis_all()}</a
			>
			{#each data.tags as t, i (t)}
				<a
					href={tagHref(t)}
					aria-current={data.tag === t ? 'page' : undefined}
					class={chip(data.tag === t, i + 1)}>{t}</a
				>
			{/each}
		</nav>
	{/if}

	{#if featured}
		{@const s = spot(featured.slug)}
		<div class="shard flex flex-col">
			<p
				class="tab tab-r tab-accent m-0 flex h-[46px] items-center self-start px-5 font-mono text-xs font-semibold text-primary-foreground"
			>
				{m.gis_blog_featured()} · {fmt(featured.date)}{featured.readingTime
					? ` · ${m.gis_min_read({ count: featured.readingTime })}`
					: ''}
			</p>
			<a
				href={localizeHref(`/blog/${featured.slug}`)}
				class="group flex flex-wrap gap-2.5 rounded-[0_34px_34px_34px] bg-primary p-2.5 text-primary-foreground no-underline"
			>
				<span
					class="relative min-h-[300px] flex-[1_1_420px] overflow-hidden rounded-[24px_12px_24px_24px]"
				>
					{#if featured.thumbnailUrl}
						<img
							src={optimizeImage(featured.thumbnailUrl, { width: 900, quality: 80 })}
							alt=""
							class="absolute inset-0 size-full object-cover"
						/>
					{:else}
						<span class="absolute inset-0">
							<MapThumb x={s.x} y={s.y} zoom={2.2} variant="route" seed={s.seed} />
						</span>
					{/if}
				</span>
				<span class="flex flex-[1_1_420px] flex-col justify-center gap-4 p-[clamp(20px,3vw,40px)]">
					<span class="text-[clamp(26px,2.6vw,38px)] leading-[1.12] font-black tracking-[-0.02em]"
						>{featured.title}</span
					>
					{#if featured.description}
						<span class="text-[17px] leading-relaxed opacity-90">{featured.description}</span>
					{/if}
					<span
						class="self-start rounded-leaf bg-white px-5 py-3 font-extrabold text-[#25272b] transition-colors group-hover:bg-[#25272b] group-hover:text-white"
						>{m.gis_read_article()}</span
					>
				</span>
			</a>
		</div>
	{/if}

	{#if gridPosts.length}
		<div
			class="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] items-start gap-x-2.5 gap-y-5"
		>
			{#each gridPosts as post, i (post.slug)}
				{@const s = spot(post.slug)}
				{@const right = i % 3 === 1}
				<a
					href={localizeHref(`/blog/${post.slug}`)}
					class="shard lift flex min-w-0 flex-col text-foreground no-underline"
				>
					<span
						class="tab flex h-11 max-w-[calc(100%-30px)] items-center px-5 font-mono text-xs font-semibold text-ink-soft {right
							? 'tab-l self-end'
							: 'tab-r self-start'}"
					>
						<span class="truncate"
							>{fmt(post.date)}{post.tags?.[0] ? ` · ${post.tags[0]}` : ''}</span
						>
					</span>
					<span
						class="flex flex-1 flex-col gap-3.5 bg-card p-3 pb-[22px] {right
							? 'rounded-[30px_0_30px_30px]'
							: 'rounded-[0_30px_30px_30px]'}"
					>
						<span
							class="block aspect-video overflow-hidden bg-secondary {right
								? 'rounded-[12px_22px_12px_22px]'
								: 'rounded-[22px_12px_22px_12px]'}"
						>
							{#if post.thumbnailUrl}
								<img
									src={optimizeImage(post.thumbnailUrl, { width: 640, quality: 75 })}
									alt=""
									loading="lazy"
									class="size-full object-cover"
								/>
							{:else}
								<MapThumb x={s.x} y={s.y} zoom={2.2} variant="route" seed={s.seed} />
							{/if}
						</span>
						<span class="px-2.5 text-xl leading-[1.3] font-black">{post.title}</span>
					</span>
				</a>
			{/each}
		</div>
	{:else if !featured}
		<p
			class="m-0 rounded-[30px] border-[1.5px] border-dashed border-line-strong bg-card p-10 text-center text-lg font-extrabold text-muted-foreground"
		>
			{data.search || data.tag ? m.gis_no_posts() : m.blog_empty()}
		</p>
	{/if}

	{#if nextCursor}
		<div class="mt-4 flex justify-center">
			<button
				type="button"
				onclick={loadMore}
				disabled={isLoadingMore}
				class="shard btn-pill-line bg-card text-base disabled:opacity-60"
			>
				{isLoadingMore ? m.blog_loading() : m.gis_load_more()}
			</button>
		</div>
	{/if}
</div>
