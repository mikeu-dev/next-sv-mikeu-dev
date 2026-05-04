<script lang="ts">
	import type { BlogPost } from '$lib/server/services/blog.service';
	import BlogCard from '$lib/components/guest/blog/blog-card.svelte';
	import { m } from '@/lib/paraglide/messages';

	let { posts = [] } = $props<{ posts: BlogPost[] }>();
</script>

{#if posts.length > 0}
	<section class="mt-24 border-t border-border/50 pt-16">
		<div class="mb-12 flex items-center justify-between">
			<h2 class="font-poppins text-3xl font-black tracking-tight md:text-4xl">
				{m.blog_related_posts()}<span class="text-primary">.</span>
			</h2>
		</div>
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each posts as post (post.slug)}
				<BlogCard {post} />
			{/each}
		</div>
	</section>
{/if}
