<script lang="ts">
	let { data } = $props();
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

	<div class="prose dark:prose-invert lg:prose-lg max-w-none">
		{@html data.content}
	</div>
</article>
