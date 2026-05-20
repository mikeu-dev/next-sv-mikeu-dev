<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { ArrowUpRight, ExternalLink, Github, Sparkles, Trophy } from '@lucide/svelte';
	import type { LocalizedProject } from '$lib/utils/project-mapper';
	import Icon from '$lib/components/ui/icon.svelte';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';

	import { optimizeImage } from '$lib/utils/image.util';

	let {
		project,
		animateOnScroll = true
	}: {
		project: LocalizedProject;
		animateOnScroll?: boolean;
	} = $props();

	let cardElement = $state<HTMLElement>();

	const isNew = $derived(
		project.createdAt &&
			new Date().getTime() - new Date(project.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
	);

	const isFeatured = $derived(project.pinned);

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		// Entrance animation (Only if requested and not controlled by a parent grid timeline)
		if (cardElement && animateOnScroll) {
			gsap.from(cardElement, {
				rotateX: -100,
				transformOrigin: 'top center',
				y: 50,
				opacity: 0,
				duration: 1.5,
				ease: 'elastic.out(1, 0.75)',
				scrollTrigger: {
					trigger: cardElement,
					start: 'top 90%',
					toggleActions: 'play none none none'
				}
			});
		}

		// Mouse & Touch interaction (Tilt & Origami Timeline)
		const isHoverable = window.matchMedia('(pointer: fine)').matches;
		let hoverTl: gsap.core.Timeline | null = null;

		const handleMouseEnter = () => {
			if (!isHoverable || !cardElement) return;

			if (hoverTl) hoverTl.kill();

			const inner = cardElement.querySelector('.project-card-inner');
			const shadow = cardElement.querySelector('.project-card-shadow');
			const crease = cardElement.querySelector('.origami-crease');
			const flap = cardElement.querySelector('.origami-flap');
			const tags = cardElement.querySelectorAll('.tech-tag');
			const actions = cardElement.querySelectorAll('.action-btn');
			const image = cardElement.querySelector('.project-card-image');
			const arrow = cardElement.querySelector('.project-card-arrow');
			const line = cardElement.querySelector('.footer-line');

			hoverTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

			// 1. Elevate card inner, shear/skew background shadow
			hoverTl.to(
				inner,
				{
					z: 40,
					scale: 1.03,
					borderColor: 'var(--primary)',
					duration: 0.5
				},
				0
			);

			hoverTl.to(
				shadow,
				{
					x: 18,
					y: 18,
					rotate: -3,
					backgroundColor: 'var(--primary)',
					duration: 0.5
				},
				0
			);

			// 2. Crease shadow deepens
			hoverTl.to(
				crease,
				{
					opacity: 0.7,
					duration: 0.4
				},
				0
			);

			// 3. Fold corner flap 180 degrees back along diagonal!
			hoverTl.to(
				flap,
				{
					rotate3d: '1, -1, 0, 180',
					duration: 0.6,
					ease: 'power2.inOut'
				},
				0
			);

			// 4. Stagger flip-up tech tags (from flat to unfolded 3D)
			if (tags.length > 0) {
				hoverTl.fromTo(
					tags,
					{
						rotateX: -90,
						opacity: 0,
						transformOrigin: 'top center'
					},
					{
						rotateX: 0,
						opacity: 1,
						stagger: 0.04,
						duration: 0.4,
						ease: 'back.out(2.5)'
					},
					0.1
				);
			}

			// 5. Stagger scale-in action buttons (pop-up book effect)
			if (actions.length > 0) {
				hoverTl.fromTo(
					actions,
					{
						scale: 0,
						rotateY: 90,
						transformOrigin: 'center center'
					},
					{
						scale: 1,
						rotateY: 0,
						stagger: 0.08,
						duration: 0.5,
						ease: 'elastic.out(1, 0.5)'
					},
					0.15
				);
			}

			// 6. Image scale and pop
			if (image) {
				hoverTl.to(
					image,
					{
						scale: 1.08,
						filter: 'grayscale(0%)',
						duration: 0.8
					},
					0
				);
			}

			// 7. Arrow rotate
			if (arrow) {
				hoverTl.to(
					arrow,
					{
						rotate: 45,
						scale: 1.15,
						duration: 0.4
					},
					0
				);
			}

			// 8. Footer decoration line expands
			if (line) {
				hoverTl.to(
					line,
					{
						width: '4rem',
						duration: 0.4
					},
					0
				);
			}
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (!isHoverable || !cardElement) return;

			const rect = cardElement.getBoundingClientRect();
			const x = (e.clientX - rect.left) / rect.width - 0.5;
			const y = (e.clientY - rect.top) / rect.height - 0.5;

			// Interactive 3D tilt
			gsap.to(cardElement.querySelector('.project-card-inner'), {
				rotateY: x * 14,
				rotateX: -y * 14,
				duration: 0.4,
				ease: 'power2.out'
			});

			// Counter parallax displacement for backing shadow to enhance depth
			gsap.to(cardElement.querySelector('.project-card-shadow'), {
				x: 18 - x * 8,
				y: 18 - y * 8,
				duration: 0.4,
				ease: 'power2.out'
			});
		};

		const handleMouseLeave = () => {
			if (!isHoverable || !cardElement) return;

			if (hoverTl) hoverTl.kill();

			const inner = cardElement.querySelector('.project-card-inner');
			const shadow = cardElement.querySelector('.project-card-shadow');
			const crease = cardElement.querySelector('.origami-crease');
			const flap = cardElement.querySelector('.origami-flap');
			const image = cardElement.querySelector('.project-card-image');
			const arrow = cardElement.querySelector('.project-card-arrow');
			const line = cardElement.querySelector('.footer-line');

			hoverTl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 0.6 } });

			hoverTl.to(
				inner,
				{
					z: 0,
					scale: 1,
					rotateX: 0,
					rotateY: 0,
					borderColor: 'var(--foreground)'
				},
				0
			);

			hoverTl.to(
				shadow,
				{
					x: 6,
					y: 6,
					rotate: 0,
					backgroundColor: 'transparent'
				},
				0
			);

			hoverTl.to(
				crease,
				{
					opacity: 0.35
				},
				0
			);

			hoverTl.to(
				flap,
				{
					rotate3d: '1, -1, 0, 0'
				},
				0
			);

			if (image) {
				hoverTl.to(
					image,
					{
						scale: 1,
						filter: 'grayscale(100%)'
					},
					0
				);
			}

			if (arrow) {
				hoverTl.to(
					arrow,
					{
						rotate: 0,
						scale: 1
					},
					0
				);
			}

			if (line) {
				hoverTl.to(
					line,
					{
						width: '2rem'
					},
					0
				);
			}
		};

		if (isHoverable && cardElement) {
			cardElement.addEventListener('mouseenter', handleMouseEnter);
			cardElement.addEventListener('mousemove', handleMouseMove);
			cardElement.addEventListener('mouseleave', handleMouseLeave);
		}

		return () => {
			if (isHoverable && cardElement) {
				cardElement.removeEventListener('mouseenter', handleMouseEnter);
				cardElement.removeEventListener('mousemove', handleMouseMove);
				cardElement.removeEventListener('mouseleave', handleMouseLeave);
			}
		};
	});
</script>

<article class="group relative h-full w-full select-none" bind:this={cardElement}>
	<!-- 1. Backing Shadow Card (Asymmetric Layer 1) -->
	<div
		class="project-card-shadow pointer-events-none absolute inset-0 z-0 border-2 border-foreground bg-transparent"
	></div>

	<!-- 2. Main Origami Card (Layer 10) -->
	<div
		class="project-card-inner relative z-10 flex h-full flex-col overflow-hidden border-2 border-foreground bg-card"
	>
		<!-- Origami Crease Lighting Overlay -->
		<div class="origami-crease pointer-events-none absolute inset-0 z-20 opacity-35"></div>

		<!-- 3D Origami Corner Flap -->
		<div
			class="origami-flap-container pointer-events-none absolute top-0 right-0 z-30 size-16 overflow-visible"
		>
			<div
				class="absolute inset-0 bg-primary/20"
				style="clip-path: polygon(100% 0, 100% 100%, 0 0);"
			></div>
			<div
				class="origami-flap absolute inset-0 origin-top-left border-b-2 border-l-2 border-foreground bg-card"
				style="clip-path: polygon(100% 0, 100% 100%, 0 0); transform-style: preserve-3d; transform: rotate3d(1, -1, 0, 0deg);"
			></div>
		</div>

		<!-- Image Wrapper with Clip-Path -->
		<div class="project-card-image-wrapper relative aspect-video overflow-hidden">
			{#if project.thumbnailUrl}
				<img
					src={optimizeImage(project.thumbnailUrl, { width: 800, quality: 75 })}
					alt={project.title}
					class="project-card-image h-full w-full object-cover grayscale transition-all duration-700 ease-out"
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
			<div class="absolute top-4 left-4 z-20 flex flex-col gap-2">
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

			<!-- Quick Actions (Pop-up pop elements) -->
			<div
				class="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-0 transition-all duration-300 group-hover:opacity-100"
			>
				{#if project.demoUrl}
					<a
						href={project.demoUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="action-btn flex size-10 items-center justify-center border-2 border-white bg-black/50 text-white transition-all hover:border-primary hover:bg-primary lg:backdrop-blur-md"
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
						class="action-btn flex size-10 items-center justify-center border-2 border-white bg-black/50 text-white transition-all hover:border-primary hover:bg-primary lg:backdrop-blur-md"
						title={m.project_button_view_code()}
					>
						<Github class="size-5" />
					</a>
				{/if}
			</div>
		</div>

		<!-- Content -->
		<div class="relative z-10 flex flex-1 flex-col bg-card p-6">
			<!-- Tech Stack -->
			{#if project.tags && project.tags.length > 0}
				<div class="mb-4 flex flex-wrap gap-2">
					{#each project.tags as tag (tag.name)}
						<span
							class="tech-tag flex items-center gap-1.5 border border-foreground/10 px-2.5 py-1 font-mono text-[9px] font-black tracking-widest uppercase transition-all"
						>
							{#if tag.icon}
								<Icon src={tag.icon} size={12} />
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
				<div class="project-card-arrow shrink-0">
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
					<div class="footer-line h-0.5 w-8 bg-primary/30"></div>
				</div>
				<div class="font-mono text-[8px] font-black tracking-widest text-foreground/30 uppercase">
					ID: {project.slug?.toUpperCase().replace(/-/g, '_') || 'UNKNOWN'}
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

	/* Double Layer Asymmetric Origami Geometry */
	.project-card-inner {
		transform-style: preserve-3d;
		clip-path: polygon(0 0, 100% 4%, 96% 96%, 4% 100%);
		transition:
			border-color 0.4s ease,
			clip-path 0.6s cubic-bezier(0.25, 1, 0.5, 1);
		will-change: transform, border-color, clip-path;
	}

	.project-card-shadow {
		clip-path: polygon(4% 4%, 96% 0%, 100% 100%, 0% 96%);
		transform: translate(6px, 6px);
		transition:
			transform 0.4s cubic-bezier(0.25, 1, 0.5, 1),
			clip-path 0.6s cubic-bezier(0.25, 1, 0.5, 1),
			background-color 0.4s ease;
		will-change: transform, clip-path, background-color;
	}

	.group:hover .project-card-inner {
		clip-path: polygon(4% 4%, 96% 0%, 100% 100%, 0% 96%);
	}

	.group:hover .project-card-shadow {
		clip-path: polygon(0 0, 100% 4%, 96% 96%, 4% 100%);
	}

	/* Image Wrapper clip path shifting */
	.project-card-image-wrapper {
		clip-path: polygon(0 0, 100% 0, 100% 88%, 0 100%);
		transition: clip-path 0.6s cubic-bezier(0.25, 1, 0.5, 1);
		will-change: clip-path;
	}

	.group:hover .project-card-image-wrapper {
		clip-path: polygon(0 0, 100% 0, 100% 100%, 0 88%);
	}

	/* Origami Crease Lighting */
	.origami-crease {
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.05) 0%,
			rgba(255, 255, 255, 0) 50%,
			rgba(0, 0, 0, 0.08) 50.1%,
			rgba(0, 0, 0, 0.16) 100%
		);
		mix-blend-mode: multiply;
	}

	:global(.dark) .origami-crease {
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.03) 0%,
			rgba(255, 255, 255, 0) 50%,
			rgba(0, 0, 0, 0.18) 50.1%,
			rgba(0, 0, 0, 0.38) 100%
		);
	}

	@media (max-width: 1024px) {
		.project-card-shadow {
			transform: translate(6px, 6px) !important;
			background-color: var(--primary) !important;
		}
	}
</style>
