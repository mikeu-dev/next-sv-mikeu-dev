<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<article class="mx-auto max-w-3xl py-8">
	<header class="mb-8 text-center">
		<h1 class="font-poppins text-4xl font-bold tracking-tight md:text-5xl">{data.title}</h1>
		<p class="mt-4 text-muted-foreground">
			Posted on {new Date(data.date).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			})}
		</p>
	</header>

	<div class="prose max-w-none dark:prose-invert lg:prose-lg">
		<svelte:component this={data.content} />
	</div>
</article>
