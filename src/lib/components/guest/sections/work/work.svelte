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

			tl.from('.work-shard', {
				scale: 0.3,
				opacity: 0,
				duration: 1.2,
				ease: 'power3.out'
			}).from(
				'.work-header-stagger',
				{
					y: 30,
					opacity: 0,
					duration: 0.8,
					ease: 'power3.out'
				},
				'-=0.8'
			);

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

	<!-- Decorative Background Shard -->
	<div
		class="work-shard pointer-events-none absolute -top-32 -right-32 size-96 bg-primary/5"
		style="clip-path: polygon(10% 0%, 100% 10%, 90% 100%, 0% 90%);"
	></div>

	<div class="relative container mx-auto max-w-6xl px-6">
		<div class="work-header-stagger mb-12 text-left md:mb-16">
			<h2 class="font-poppins text-4xl leading-none font-black tracking-tighter sm:text-5xl">
				{m.work_title()}<span class="text-primary">.</span>
			</h2>
			<p class="mt-4 max-w-lg font-mono text-sm text-muted-foreground">
				{m.work_subtitle()}
			</p>
		</div>

		<div class="work-list grid grid-cols-2 gap-4 md:gap-6">
			{#each localizedProjects as project, i (project.id)}
				<WorkProjectTile {project} index={i} />
			{/each}
		</div>

		{#if localizedProjects.length > 0}
			<div class="mt-12 flex justify-center md:mt-16">
				<a
					href={localizeHref('/projects')}
					class="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-card px-6 py-2.5 font-mono text-sm tracking-wide text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
				>
					{m.work_view_all_button()}
					<ArrowUpRight class="size-4" />
				</a>
			</div>
		{/if}
	</div>
</section>
