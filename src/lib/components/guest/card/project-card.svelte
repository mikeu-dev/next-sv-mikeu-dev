<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { ArrowUpRight, ExternalLink, Github, Sparkles, Trophy, Hash } from '@lucide/svelte';
	import type { LocalizedProject } from '$lib/utils/project-mapper';
	import Icon from '$lib/components/ui/icon.svelte';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';

	let { project }: { project: LocalizedProject } = $props();

	let cardElement = $state<HTMLElement>();

	const isNew = $derived(
		project.createdAt &&
			new Date().getTime() - new Date(project.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
	);

	const isFeatured = $derived(project.pinned);

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		gsap.from(cardElement, {
			rotateX: -30,
			y: 100,
			opacity: 0,
			duration: 1.2,
			ease: 'power4.out',
			scrollTrigger: {
				trigger: cardElement,
				start: 'top 90%',
				toggleActions: 'play none none none'
			}
		});

		// Mouse interaction (Tilt)
		const handleMouseMove = (e: MouseEvent) => {
			if (!cardElement) return;
			const rect = cardElement.getBoundingClientRect();
			const x = (e.clientX - rect.left) / rect.width - 0.5;
			const y = (e.clientY - rect.top) / rect.height - 0.5;

			gsap.to(cardElement.querySelector('.project-card-inner'), {
				rotateY: x * 15,
				rotateX: -y * 15,
				duration: 0.5,
				ease: 'power2.out'
			});
		};

		const handleMouseLeave = () => {
			gsap.to(cardElement?.querySelector('.project-card-inner'), {
				rotateY: 0,
				rotateX: 0,
				duration: 0.8,
				ease: 'power4.out'
			});
		};

		cardElement?.addEventListener('mousemove', handleMouseMove);
		cardElement?.addEventListener('mouseleave', handleMouseLeave);

		return () => {
			cardElement?.removeEventListener('mousemove', handleMouseMove);
			cardElement?.removeEventListener('mouseleave', handleMouseLeave);
		};
	});
</script>

<article class="group relative h-full" bind:this={cardElement}>
	<div
		class="project-card-inner relative flex h-full flex-col bg-card transition-all duration-500 hover:bg-primary/5 dark:hover:bg-primary/10"
	>
		<!-- Image Wrapper with Clip-Path -->
		<div
			class="relative aspect-video overflow-hidden"
			style="clip-path: polygon(0 0, 100% 0, 100% 88%, 0 100%);"
		>
			{#if project.thumbnailUrl}
				<img
					src={project.thumbnailUrl}
					alt={project.title}
					class="h-full w-full object-cover grayscale transition-all duration-700 ease-out group-hover:scale-110 group-hover:grayscale-0"
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

			<!-- Technical Badges -->
			<div class="absolute top-4 left-4 flex flex-col gap-2">
				{#if isFeatured}
					<div
						class="flex items-center gap-1.5 bg-yellow-500 px-3 py-1 font-mono text-[9px] font-black tracking-widest text-black uppercase"
					>
						<Trophy class="size-3" /> [FEATURED_PROJECT]
					</div>
				{/if}
				{#if isNew}
					<div
						class="flex items-center gap-1.5 bg-primary px-3 py-1 font-mono text-[9px] font-black tracking-widest text-primary-foreground uppercase"
					>
						<Sparkles class="size-3" /> [NEW_DEPLOYMENT]
					</div>
				{/if}
			</div>

			<!-- Quick Actions -->
			<div
				class="absolute top-4 right-4 flex flex-col gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100"
			>
				{#if project.demoUrl}
					<a
						href={project.demoUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="flex size-10 items-center justify-center border-2 border-white bg-black/50 text-white backdrop-blur-md transition-all hover:border-primary hover:bg-primary"
						title={m.project_button_demo()}
					>
						<ExternalLink class="size-5" />
					</a>
				{/if}
				{#if project.repoUrl}
					<a
						href={project.repoUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="flex size-10 items-center justify-center border-2 border-white bg-black/50 text-white backdrop-blur-md transition-all hover:border-primary hover:bg-primary"
						title={m.project_button_view_code()}
					>
						<Github class="size-5" />
					</a>
				{/if}
			</div>
		</div>

		<!-- Content -->
		<div class="flex flex-1 flex-col p-6">
			<!-- Tech Stack -->
			{#if project.tags && project.tags.length > 0}
				<div class="mb-4 flex flex-wrap gap-2">
					{#each project.tags as tag (tag.name)}
						<span
							class="flex items-center gap-1.5 border border-foreground/10 px-2.5 py-1 font-mono text-[9px] font-black tracking-widest uppercase transition-all group-hover:border-primary/50 group-hover:text-primary"
						>
							{#if tag.icon}
								<Icon src={tag.icon as any} size={12} />
							{/if}
							{tag.name}
						</span>
					{/each}
				</div>
			{/if}

			<!-- Title & Description -->
			<div class="flex items-start justify-between gap-4">
				<h3
					class="font-poppins text-2xl leading-tight font-black tracking-tighter transition-colors group-hover:text-primary lg:text-3xl"
				>
					<a href={localizeHref(`/projects/${project.slug}`)}>
						<span class="absolute inset-0 z-10" aria-hidden="true"></span>
						{project.title}
					</a>
				</h3>
				<div class="shrink-0 transition-transform duration-300 group-hover:rotate-45">
					<ArrowUpRight class="size-7 text-primary" />
				</div>
			</div>

			<p
				class="mt-4 line-clamp-3 font-mono text-xs leading-relaxed text-muted-foreground/80 uppercase"
			>
				{project.description}
			</p>

			<!-- Footer Action -->
			<div class="mt-auto flex items-center justify-between border-t border-foreground/10 pt-6">
				<div
					class="flex items-center gap-2 font-mono text-[10px] font-black tracking-widest text-primary uppercase"
				>
					<span>[EXPLORE_DETAILS]</span>
					<div
						class="h-0.5 w-8 bg-primary/30 transition-all group-hover:w-16 group-hover:bg-primary"
					></div>
				</div>
				<div class="font-mono text-[8px] font-black tracking-widest text-foreground/30 uppercase">
					ID: {project.slug.toUpperCase().replace(/-/g, '_')}
				</div>
			</div>
		</div>
	</div>
</article>

<style lang="postcss">
	@reference "tailwindcss";

	article {
		perspective: 1200px;
	}

	.project-card-inner {
		transform-style: preserve-3d;
		border: 2px solid var(--foreground);
		clip-path: polygon(0 0, 97% 0, 100% 100%, 3% 100%);
		transition: border-color 0.3s ease;
	}

	.group:hover .project-card-inner {
		border-color: var(--primary);
	}

	@media (max-width: 1024px) {
		.project-card-inner {
			clip-path: none !important;
		}
	}
</style>
