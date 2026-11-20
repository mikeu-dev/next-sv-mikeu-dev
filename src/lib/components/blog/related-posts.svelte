<script lang="ts">
	import type { BlogPost } from '#lib/types.js';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';

	let { posts = [] }: { posts?: BlogPost[] } = $props();

	const dateFmt = new Intl.DateTimeFormat(getLocale() === 'en' ? 'en-GB' : 'id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
	function fmt(date: string) {
		const d = new Date(date);
		return Number.isNaN(d.getTime()) ? date : dateFmt.format(d);
	}
</script>

{#if posts.length > 0}
	<nav aria-labelledby="related-h" class="flex flex-col gap-5">
		<h2 id="related-h" class="m-0 text-[clamp(26px,3vw,36px)] font-black tracking-[-0.02em]">
			{m.blog_related_posts()}
		</h2>
		<div class="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-4">
			{#each posts as post (post.slug)}
				<a
					href={localizeHref(`/blog/${post.slug}`)}
					class="shard lift flex flex-col gap-2 rounded-[30px_12px_30px_12px] bg-card px-6 py-[22px] text-foreground no-underline"
				>
					<span class="font-mono text-xs text-muted-foreground">{fmt(post.date)}</span>
					<span class="text-lg leading-[1.3] font-black">{post.title}</span>
				</a>
			{/each}
		</div>
	</nav>
{/if}
