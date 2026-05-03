<script lang="ts">
	import type { BlogPost } from '$lib/server/services/blog.service';
	import BlogCard from '$lib/components/guest/blog/blog-card.svelte';
	import * as m from '@/lib/paraglide/messages';

	let { posts = [] } = $props<{ posts: BlogPost[] }>();
</script>

{#if posts.length > 0}
	<section class="mt-20 border-t pt-16">
		<h2 class="font-poppins mb-10 text-3xl font-black tracking-tight">
			{m.blog_stay_tuned()}<span class="text-primary">.</span>
		</h2>
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each posts as post (post.slug)}
				<BlogCard {post} />
			{/each}
		</div>
	</section>
{/if}
