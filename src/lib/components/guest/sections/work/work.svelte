<script lang="ts">
	import ProjectCard from '@/lib/components/guest/card/project-card.svelte';
	import * as Tooltip from '@/lib/components/ui/tooltip';
	import type { Project } from '$lib/types';
	import { useWorkSection } from './work.svelte.js';
	import { getLocale } from '@/lib/paraglide/runtime.js';
	import { m } from '@/lib/paraglide/messages.js';
	import { getLocalizedProject } from '$lib/utils/project-mapper';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { Terminal, Command, Hash } from '@lucide/svelte';

	let { projects }: { projects: Project[] } = $props();
	let currentLocale = $derived(getLocale());
	let localizedProjects = $derived(
		projects.filter((p) => p.pinned).map((p) => getLocalizedProject(p, currentLocale))
	);

	// We still use the hook for tooltip logic, but we'll override/enhance animations here
	const { workSection, projectCardElements, tooltipOpen, virtualAnchor, tooltipText } =
		useWorkSection();

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		const sectionEl = $workSection;
		if (!sectionEl) return;

		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: sectionEl,
				start: 'top 80%',
				toggleActions: 'play none none none'
			}
		});

		// Origami Reveal
		tl.from('.origami-shard', {
			rotateX: -90,
			opacity: 0,
			duration: 1.2,
			stagger: 0.1,
			ease: 'power4.out'
		}).from(
			'.work-stagger',
			{
				y: 50,
				opacity: 0,
				duration: 1,
				stagger: 0.15,
				ease: 'expo.out'
			},
			'-=0.8'
		);

		// Mouse Parallax for section background elements
		const handleMouseMove = (e: MouseEvent) => {
			const { clientX, clientY } = e;
			const x = (clientX / window.innerWidth - 0.5) * 12;
			const y = (clientY / window.innerHeight - 0.5) * 12;

			gsap.to('.work-parallax-layer', {
				rotateY: x,
				rotateX: -y,
				duration: 1.5,
				ease: 'power2.out'
			});
		};

		window.addEventListener('mousemove', handleMouseMove);
		return () => window.removeEventListener('mousemove', handleMouseMove);
	});
</script>

<Tooltip.Provider>
	<Tooltip.Root bind:open={$tooltipOpen}>
		<section
			bind:this={$workSection}
			id="work"
			class="relative overflow-hidden bg-background py-24 md:py-32"
		>
			<!-- Grain Texture Overlay -->
			<div
				class="pointer-events-none absolute inset-0 z-50 opacity-[0.03] mix-blend-overlay contrast-150 grayscale"
				style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
			></div>

			<div class="relative container mx-auto px-6">
				<div class="work-parallax-layer relative">
					<!-- Decorative Shards -->
					<div
						class="origami-shard absolute -top-32 -left-32 size-96 bg-primary/5 dark:bg-primary/10"
						style="clip-path: polygon(10% 0%, 100% 10%, 90% 100%, 0% 90%);"
					></div>
					<div
						class="origami-shard absolute -right-32 -bottom-32 size-80 bg-foreground/5"
						style="clip-path: polygon(0% 15%, 85% 0%, 100% 85%, 15% 100%);"
					></div>

					<!-- Header -->
					<div class="work-stagger mb-16 border-b-2 border-foreground pb-12">
						<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
							<div
								class="flex items-center gap-2 font-mono text-[10px] font-black tracking-[0.2em] text-primary uppercase"
							>
								<Terminal class="size-3" /> ARCHIVE_SECTOR: PROJECTS_CATALOG
							</div>
							<div
								class="flex items-center gap-2 font-mono text-[10px] font-black tracking-[0.2em] text-foreground/40 uppercase"
							>
								<Command class="size-3 animate-pulse" /> [SCAN_STATUS: ACTIVE]
							</div>
						</div>

						<h2 class="font-poppins text-5xl font-black tracking-tighter sm:text-7xl lg:text-8xl">
							{m.work_title()}<span class="text-primary">.</span>
						</h2>
						<p
							class="mt-8 max-w-2xl font-mono text-xs leading-relaxed text-muted-foreground uppercase sm:text-sm"
						>
							{m.work_subtitle()}
						</p>
					</div>

					<!-- Grid -->
					<div class="projects-grid grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
						{#each localizedProjects as project, i (project.id)}
							<div
								bind:this={$projectCardElements[i]}
								class="work-stagger h-full will-change-transform"
							>
								<ProjectCard {project} />
							</div>
						{/each}
					</div>

					<!-- Footer Technicality -->
					<div
						class="mt-24 flex items-center justify-between border-t-2 border-foreground/10 pt-8 font-mono text-[8px] font-black tracking-[0.3em] text-foreground/30 uppercase"
					>
						<div class="flex items-center gap-4">
							<Hash class="size-3" />
							<span>MIKEU_DEV // PROJECT_VAULT_V2</span>
						</div>
						<div class="hidden sm:block">ENCRYPTION: AES_256_GCM</div>
						<span>LOAD_COUNT: {localizedProjects.length.toString().padStart(2, '0')}</span>
					</div>
				</div>
			</div>

			<Tooltip.Content customAnchor={$virtualAnchor}>
				<p class="font-mono text-[10px] font-bold tracking-widest uppercase">
					{m.work_tooltip?.() || $tooltipText}
				</p>
			</Tooltip.Content>
		</section>
	</Tooltip.Root>
</Tooltip.Provider>

<style lang="postcss">
	@reference "tailwindcss";

	#work {
		perspective: 1200px;
	}

	.work-parallax-layer {
		transform-style: preserve-3d;
	}

	.work-stagger {
		transform: translateZ(40px);
	}

	.origami-shard {
		pointer-events: none;
	}
</style>
