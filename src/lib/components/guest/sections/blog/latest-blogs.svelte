<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { BlogPost } from '#lib/types.js';
	import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
	import SectionHead from '../../map/section-head.svelte';

	let { posts = [] }: { posts?: BlogPost[] } = $props();

	const locale = getLocale();
	const dateFmt = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
	function fmt(date: string) {
		const d = new Date(date);
		return Number.isNaN(d.getTime()) ? date : dateFmt.format(d);
	}

	let featured = $derived(posts[0]);
	let rest = $derived(posts.slice(1, 3));
</script>

{#if featured}
	<section
		aria-labelledby="blog-h"
		class="mx-auto box-border max-w-[1440px] px-[clamp(16px,4vw,56px)] pb-[clamp(64px,7vw,100px)]"
	>
		<SectionHead id="blog-h" eyebrow={m.gis_blog_eyebrow()} title={m.gis_blog_title()}>
			<a
				href={localizeHref('/blog')}
				class="shard flex min-h-12 items-center rounded-leaf-r bg-card px-[22px] text-base font-extrabold text-foreground no-underline hover:bg-white dark:hover:bg-white/10"
			>
				{m.gis_blog_all()}
			</a>
		</SectionHead>
		<div class="grid grid-cols-1 items-stretch gap-2.5 lg:grid-cols-3">
			<div class="map-reveal shard flex min-w-0 flex-col lg:col-span-2">
				<div
					class="tab tab-r tab-accent flex h-[46px] items-center self-start px-5 font-mono text-xs font-semibold text-primary-foreground"
				>
					{m.gis_blog_featured()} · {fmt(featured.date)}{featured.readingTime
						? ` · ${m.gis_min_read({ count: featured.readingTime })}`
						: ''}
				</div>
				<a
					href={localizeHref(`/blog/${featured.slug}`)}
					class="flex flex-1 flex-col justify-end gap-4 rounded-[0_30px_30px_30px] bg-primary p-7 text-primary-foreground no-underline"
				>
					<span class="text-[clamp(24px,2.4vw,34px)] leading-[1.15] font-black tracking-[-0.02em]">
						{featured.title}
					</span>
					{#if featured.description}
						<span class="line-clamp-3 text-base leading-relaxed">{featured.description}</span>
					{/if}
				</a>
			</div>
			{#if rest.length}
				<div class="flex flex-col gap-2.5">
					{#each rest as post, i (post.slug)}
						<a
							href={localizeHref(`/blog/${post.slug}`)}
							class="map-reveal shard lift flex flex-1 flex-col gap-2.5 bg-card px-6 py-[22px] text-foreground no-underline {i %
							2
								? 'rounded-[12px_30px_12px_30px]'
								: 'rounded-[30px_12px_30px_12px]'}"
						>
							<span class="font-mono text-xs font-semibold text-muted-foreground"
								>{fmt(post.date)}</span
							>
							<span class="text-[19px] leading-[1.3] font-black">{post.title}</span>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</section>
{/if}
