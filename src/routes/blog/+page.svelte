<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="space-y-12">
	<section class="text-center">
		<h1 class="font-poppins text-4xl font-bold tracking-tight md:text-5xl">Blog</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
			Welcome to my blog. Here I share my thoughts on web development, GIS, and more.
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
						{new Date(post.date).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}
					</p>
					<p class="mt-2 text-muted-foreground">{post.description}</p>
					<a href={`/blog/${post.slug}`} class="mt-4 inline-block text-sm font-medium text-primary hover:underline">Read more</a>
				</article>
			{/each}
		</div>
	</section>
</div>
