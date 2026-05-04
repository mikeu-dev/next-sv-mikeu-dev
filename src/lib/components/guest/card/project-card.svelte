<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { ArrowUpRight, ExternalLink, Github, Sparkles, Trophy } from '@lucide/svelte';
	import type { LocalizedProject } from '$lib/utils/project-mapper';
	import Icon from '$lib/components/ui/icon.svelte';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';

	let { project }: { project: LocalizedProject } = $props();

	let cardElement: HTMLElement;

	// Check if project is new (less than 30 days old)
	const isNew = $derived(
		project.createdAt &&
			new Date().getTime() - new Date(project.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
	);

	// Project is featured if pinned
	const isFeatured = $derived(project.pinned);

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);
		ScrollTrigger.refresh();
		gsap.from(cardElement, {
			y: 50,
			opacity: 0,
			duration: 0.8,
			ease: 'power3.out',
			scrollTrigger: {
				trigger: cardElement,
				start: 'top 90%',
				toggleActions: 'play none none none'
			}
		});
	});
</script>

<article class="group relative h-full" bind:this={cardElement}>
	<div
		class="relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/50 bg-card transition-all duration-500 hover:border-primary/50 hover:shadow-[0_20px_50px_-12px_rgba(var(--primary-rgb),0.15)]"
	>
		<!-- Image Wrapper -->
		<div class="relative aspect-video overflow-hidden">
			{#if project.thumbnailUrl}
				<img
					src={project.thumbnailUrl}
					alt={project.title}
					class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
					loading="lazy"
				/>
			{:else}
				<div class="flex h-full w-full items-center justify-center bg-muted">
					<Icon iconName="Image" size={48} class="text-muted-foreground/20" />
				</div>
			{/if}

			<!-- Overlay Gradient -->
			<div
				class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			></div>

			<!-- Floating Badges -->
			<div class="absolute top-4 left-4 flex flex-wrap gap-2">
				{#if isFeatured}
					<div
						class="flex items-center gap-1.5 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[10px] font-black text-yellow-400 shadow-xl backdrop-blur-md"
					>
						<Trophy class="size-3" />
						FEATURED
					</div>
				{/if}
				{#if isNew}
					<div
						class="flex animate-pulse items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-black text-white shadow-lg"
					>
						<Sparkles class="size-3" />
						NEW
					</div>
				{/if}
			</div>

			<!-- Quick Actions Overlay -->
			<div
				class="absolute top-4 right-4 flex flex-col gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100"
			>
				{#if project.demoUrl}
					<a
						href={project.demoUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="flex size-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-primary hover:scale-110"
						title={m.project_button_demo()}
						onclick={(e) => e.stopPropagation()}
					>
						<ExternalLink class="size-4" />
					</a>
				{/if}
				{#if project.repoUrl}
					<a
						href={project.repoUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="flex size-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-primary hover:scale-110"
						title={m.project_button_view_code()}
						onclick={(e) => e.stopPropagation()}
					>
						<Github class="size-4" />
					</a>
				{/if}
			</div>
		</div>

		<div class="flex flex-1 flex-col p-6">
			<!-- Tech Stack -->
			{#if project.tags && project.tags.length > 0}
				<div class="mb-4 flex flex-wrap gap-2">
					{#each project.tags as tag (tag.name)}
						<span
							class="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all group-hover:shadow-sm"
							style="background-color: {tag.color}15; color: {tag.color}; border: 1px solid {tag.color}30;"
						>
							{#if tag.icon}
								<!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
								<Icon src={tag.icon as any} size={14} />
							{/if}
							{tag.name}
						</span>
					{/each}
				</div>
			{/if}

			<!-- Title & Description -->
			<div class="flex items-start justify-between gap-4">
				<h3 class="font-poppins text-xl leading-tight font-black transition-colors group-hover:text-primary">
					<a href={localizeHref(`/projects/${project.slug}`)}>
						<span class="absolute inset-0 z-10" aria-hidden="true"></span>
						{project.title}
					</a>
				</h3>
				<div
					class="mt-1 shrink-0 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
				>
					<ArrowUpRight class="size-6 text-primary" />
				</div>
			</div>

			<p class="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground/80">
				{project.description}
			</p>

			<!-- Footer Action -->
			<div class="mt-auto pt-6">
				<div
					class="flex items-center gap-2 text-sm font-bold text-primary opacity-80 transition-all group-hover:opacity-100"
				>
					<span>{m.work_card_button()}</span>
					<div class="h-px w-8 bg-primary/30 transition-all group-hover:w-12 group-hover:bg-primary"></div>
				</div>
			</div>
		</div>
	</div>
</article>

<style>
	article {
		perspective: 1000px;
	}

	:global(.group:hover) {
		transform: translateY(-6px);
		transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
</style>

