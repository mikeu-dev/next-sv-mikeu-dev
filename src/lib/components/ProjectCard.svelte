<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ArrowRight, ExternalLink, Github } from '@lucide/svelte';
	import type { Project } from '$lib/types';

	let { project }: { project: Project } = $props();

	let cardElement: HTMLDivElement;

	onMount(() => {
		gsap.from(cardElement, {
			y: 50,
			opacity: 0,
			duration: 0.5,
			ease: 'power2.out',
			scrollTrigger: {
				trigger: cardElement,
				start: 'top 85%',
				toggleActions: 'play none none none'
			}
		});
	});
</script>

<div
	bind:this={cardElement}
	class="group relative flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
>
	<div class="flex grow flex-col p-6">
		<h3 class="font-poppins mb-2 text-xl font-bold">
			<a href={`/projects/${project.slug}`} class="text-foreground group-hover:text-primary">
				<span class="absolute inset-0 z-10" aria-hidden="true"></span>
				{project.title}
			</a>
		</h3>
		<p class="mb-4 grow text-muted-foreground">{project.description}</p>

		{#if project.tags && project.tags.length > 0}
			<div class="mb-4 flex flex-wrap gap-2">
				{#each project.tags as tag: Tag}
					<span
						class="group-hover:bg-opacity-20 flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold transition-colors"
						style="background-color: {tag.color}1A; color: {tag.color};"
					>
						{#if tag.icon}
							<tag.icon class="size-3" />
						{/if}
						{tag.name}
					</span>
				{/each}
			</div>
		{/if}

		<div class="mt-auto flex items-center justify-between border-t pt-4">
			<span class="flex items-center text-sm font-medium text-primary">
				View Details
				<ArrowRight class="inline size-4 transition-transform group-hover:translate-x-1" />
			</span>
			<div class="flex items-center gap-4">
				{#if project.demoUrl}
					<a
						href={project.demoUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="relative z-20 text-muted-foreground transition-colors hover:text-foreground"
						aria-label="Visit project website for {project.title}"
						onclick={(e) => e.stopPropagation()}
					>
						<ExternalLink class="size-5" />
					</a>
				{/if}
				{#if project.repoUrl}
					<a
						href={project.repoUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="relative z-20 text-muted-foreground transition-colors hover:text-foreground"
						aria-label="View source code on GitHub for {project.title}"
						onclick={(e) => e.stopPropagation()}
					>
						<Github class="size-5" />
					</a>
				{/if}
			</div>
		</div>
	</div>
</div>
