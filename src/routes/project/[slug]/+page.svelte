<script lang="ts">
	import { ArrowLeft, ExternalLink, Github } from '@lucide/svelte';
	import { Button } from '@/lib/components/ui/button';

	let { data } = $props();
	const { project } = data;
</script>

<div class="mx-auto max-w-4xl py-12 md:py-16">
	<div class="mb-8">
		<a
			href="/"
			class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
		>
			<ArrowLeft class="mr-2 size-4" />
			Back to Projects
		</a>
	</div>

	<article>
		<header class="mb-8">
			<h1 class="mb-2 text-4xl font-bold tracking-tight md:text-5xl">{project.title}</h1>
			<p class="mt-2 text-lg text-muted-foreground">{project.description}</p>

			<div class="mt-4 flex flex-wrap gap-2">
				{#if project.tags && project.tags.length > 0}
					{#each project.tags as tag}
						<span
							class="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
						>
							{tag}
						</span>
					{/each}
				{/if}
			</div>
		</header>

		{#if project.thumbnailUrl}
			<img
				src={project.thumbnailUrl}
				alt="Project thumbnail for {project.title}"
				class="mb-8 w-full rounded-lg border object-cover shadow-md"
			/>
		{/if}

	<div class="prose prose-lg dark:prose-invert max-w-none">
			{#if project.content}
				{@html project.content}
			{:else}
				<p>Detailed project description is not yet available. Please check back later!</p>
			{/if}
		</div>

		<footer class="mt-12 flex items-center gap-4 border-t pt-8">
			{#if project.repoUrl}
				<Button href={project.repoUrl} target="_blank" variant="outline">
					<Github class="mr-2 size-4" />
					View on GitHub
				</Button>
			{/if}
			{#if project.demoUrl}
				<Button href={project.demoUrl} target="_blank">
					<ExternalLink class="mr-2 size-4" />
					Live Demo
				</Button>
			{/if}
		</footer>
	</article>
</div>
