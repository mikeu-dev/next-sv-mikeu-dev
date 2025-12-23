<script lang="ts">
	import * as m from '@/lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import type { Post } from './+page.server';
	let { data }: { data: { posts: Post[] } } = $props();
</script>

<div class="mt-20 space-y-12">
	<section class="text-center">
		<h1 class="font-poppins text-4xl font-bold tracking-tight md:text-5xl">{m.blog_title()}</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
			{m.blog_subtitle()}
		</p>
	</section>

	<section class="mx-auto max-w-3xl">
		<div class="space-y-8">
			{#each data.posts as post}
				<article>
					<a href={`/blog/${post.slug}`}>
						<h2 class="font-poppins text-2xl font-bold tracking-tight hover:text-primary">
							{post.title}
						</h2>
					</a>
					<p class="text-sm text-muted-foreground">
						{new Date(post.date).toLocaleDateString(getLocale(), {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}
					</p>
					<p class="mt-2 text-muted-foreground">{post.description}</p>
					<a
						href={`/blog/${post.slug}`}
						class="mt-4 inline-block text-sm font-medium text-primary hover:underline"
						>{m.blog_card_button()}</a
					>
				</article>
			{/each}
		</div>
	</section>
</div>
