<script lang="ts">
	import WorkProjectTile from './work-project-tile.svelte';
	import type { Project } from '$lib/types';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { getLocalizedProject } from '$lib/utils/project-mapper';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { ArrowUpRight } from '@lucide/svelte';

	let { projects }: { projects: Project[] } = $props();
	let currentLocale = $derived(getLocale());
	let localizedProjects = $derived(
		projects.filter((p) => p.pinned).map((p) => getLocalizedProject(p, currentLocale))
	);

	let workSection = $state<HTMLElement>();

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		const sectionEl = workSection;
		if (!sectionEl) return;

		const ctx = gsap.context(() => {
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: sectionEl,
					start: 'top 80%',
					toggleActions: 'play none none none'
				}
			});

			tl.from('.work-header-stagger', {
				y: 30,
				opacity: 0,
				duration: 0.8,
				ease: 'power3.out'
			});

			gsap.from('.work-item', {
				y: 30,
				opacity: 0,
				duration: 0.6,
				stagger: 0.1,
				ease: 'power3.out',
				scrollTrigger: {
					trigger: '.work-list',
					start: 'top 85%',
					toggleActions: 'play none none none'
				}
			});
		}, sectionEl);

		return () => ctx.revert();
	});
</script>

<section
	bind:this={workSection}
	class="work-section relative overflow-hidden bg-background py-20 md:py-32"
>
	<!-- Grain Texture Overlay -->
	<div
		class="pointer-events-none absolute inset-0 z-50 opacity-[0.03] mix-blend-overlay contrast-150 grayscale"
		style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
	></div>

	<!-- Color echo from the hero's blob palette — ties this section back to the
	     hero without competing with the project imagery in the grid below. -->
	<div
		class="work-glow work-glow-1 pointer-events-none absolute -top-40 -left-40 size-144 rounded-full blur-[100px]"
	></div>
	<div
		class="work-glow work-glow-2 pointer-events-none absolute top-1/3 -right-40 size-120 rounded-full blur-[100px]"
	></div>

	<div class="max-w-screen-4xl relative mx-auto px-6">
		<div class="work-header-stagger mb-12 text-left md:mb-16">
			<h2 class="font-poppins text-4xl leading-none font-black tracking-tighter sm:text-5xl">
				{m.work_title()}<span class="text-primary italic">.</span>
			</h2>
			<p class="mt-4 max-w-lg font-mono text-sm text-muted-foreground">
				{m.work_subtitle()}
			</p>
		</div>

		<div
			class="work-list grid grid-flow-row-dense auto-rows-[16rem] grid-cols-1 gap-4 sm:auto-rows-[18rem] sm:grid-cols-2 lg:auto-rows-[20rem] lg:grid-cols-3 lg:gap-6"
		>
			{#each localizedProjects as project, i (project.id)}
				<WorkProjectTile {project} index={i} />
			{/each}
		</div>

		{#if localizedProjects.length > 0}
			<div class="mt-12 flex justify-center md:mt-16">
				<a
					href={localizeHref('/projects')}
					class="tape-cta inline-flex items-center gap-1.5 rounded-full px-6 py-2.5 font-mono text-sm font-bold tracking-wide"
				>
					{m.work_view_all_button()}
					<ArrowUpRight class="size-4" />
				</a>
			</div>
		{/if}
	</div>
</section>

<style lang="postcss">
	@reference "tailwindcss";

	/* Same glossy tape treatment as the hero's primary CTA — reuses the global
	   --tape-* tokens from app.css so the two sections' CTAs read as one brand. */
	.tape-cta {
		background: var(--tape-bg-grad);
		color: var(--tape-color);
		box-shadow: 0 6px 12px var(--tape-shadow);
		transition:
			box-shadow 0.3s ease,
			transform 0.3s ease;
	}

	.tape-cta:hover {
		box-shadow: 0 10px 16px var(--tape-shadow-hover);
		transform: translateY(-2px);
	}

	.work-glow {
		opacity: 0.08;
	}

	.work-glow-1 {
		background: #fcec62;
	}

	.work-glow-2 {
		background: #438468;
	}
</style>
