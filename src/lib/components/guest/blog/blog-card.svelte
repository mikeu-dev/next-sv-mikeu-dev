<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import type { BlogPost } from '$lib/types';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { ArrowUpRight, Calendar, Clock, Sparkles, Hash } from '@lucide/svelte';
	import { optimizeImage } from '$lib/utils/image.util';

	let {
		post,
		animateOnScroll = true
	}: {
		post: BlogPost;
		animateOnScroll?: boolean;
	} = $props();

	let cardElement = $state<HTMLElement>();

	const formattedDate = $derived(
		new Date(post.date).toLocaleDateString(getLocale(), {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		})
	);

	const isNew = $derived(
		new Date().getTime() - new Date(post.date).getTime() < 7 * 24 * 60 * 60 * 1000
	);

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

		// GSAP's CSSPlugin only knows rotationX/Y/Z (rotation around the
		// standard axes) — `rotate3d` isn't one of its property names, so
		// tweening it directly warns "Invalid property rotate3d" and never
		// animates. Tweening a plain number and writing the transform
		// ourselves in onUpdate keeps the diagonal-axis flip GSAP can't
		// express natively, while `flapState` staying alive across hover
		// in/out lets a fast re-hover reverse smoothly from wherever the flap
		// actually is instead of snapping.
		const flapState = { deg: 0 };
		const applyFlapRotation = (flap: Element | null) => {
			if (flap) (flap as HTMLElement).style.transform = `rotate3d(1, -1, 0, ${flapState.deg}deg)`;
		};

		const handleMouseEnter = () => {
			if (!isHoverable || !cardElement) return;

			if (hoverTl) hoverTl.kill();

			const inner = cardElement.querySelector('.blog-card-inner');
			const shadow = cardElement.querySelector('.blog-card-shadow');
			const crease = cardElement.querySelector('.origami-crease');
			const flap = cardElement.querySelector('.origami-flap');
			const tags = cardElement.querySelectorAll('.blog-tag');
			const image = cardElement.querySelector('.blog-card-image');
			const arrow = cardElement.querySelector('.blog-card-arrow');
			const cta = cardElement.querySelector('.footer-cta');
			const line = cardElement.querySelector('.footer-line');

			hoverTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

			// 1. Elevate card inner, shear/skew background shadow, and morph clip-paths
			hoverTl.to(
				inner,
				{
					z: 40,
					scale: 1.03,
					borderColor: 'var(--primary)',
					clipPath: 'polygon(4% 4%, 96% 0%, 100% 100%, 0% 96%)',
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
					clipPath: 'polygon(0% 0%, 100% 4%, 96% 96%, 4% 100%)',
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
				flapState,
				{
					deg: 180,
					duration: 0.6,
					ease: 'power2.inOut',
					onUpdate: () => applyFlapRotation(flap)
				},
				0
			);

			// 4. Stagger flip-up tags
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

			// 5. Image scale and pop
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

			// 6. Arrow rotate
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

			// 7. Footer CTA fade-in and line expansion
			if (cta) {
				hoverTl.to(
					cta,
					{
						opacity: 1,
						duration: 0.4
					},
					0
				);
			}

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
			gsap.to(cardElement.querySelector('.blog-card-inner'), {
				rotateY: x * 14,
				rotateX: -y * 14,
				duration: 0.4,
				ease: 'power2.out'
			});

			// Counter parallax displacement for backing shadow to enhance depth
			gsap.to(cardElement.querySelector('.blog-card-shadow'), {
				x: 18 - x * 8,
				y: 18 - y * 8,
				duration: 0.4,
				ease: 'power2.out'
			});
		};

		const handleMouseLeave = () => {
			if (!isHoverable || !cardElement) return;

			if (hoverTl) hoverTl.kill();

			const inner = cardElement.querySelector('.blog-card-inner');
			const shadow = cardElement.querySelector('.blog-card-shadow');
			const crease = cardElement.querySelector('.origami-crease');
			const flap = cardElement.querySelector('.origami-flap');
			const image = cardElement.querySelector('.blog-card-image');
			const arrow = cardElement.querySelector('.blog-card-arrow');
			const cta = cardElement.querySelector('.footer-cta');
			const line = cardElement.querySelector('.footer-line');

			hoverTl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 0.6 } });

			hoverTl.to(
				inner,
				{
					z: 0,
					scale: 1,
					rotateX: 0,
					rotateY: 0,
					borderColor: 'var(--foreground)',
					clipPath: 'polygon(0% 0%, 100% 4%, 96% 96%, 4% 100%)'
				},
				0
			);

			hoverTl.to(
				shadow,
				{
					x: 6,
					y: 6,
					rotate: 0,
					backgroundColor: 'transparent',
					clipPath: 'polygon(4% 4%, 96% 0%, 100% 100%, 0% 96%)'
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
				flapState,
				{
					deg: 0,
					onUpdate: () => applyFlapRotation(flap)
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

			if (cta) {
				hoverTl.to(
					cta,
					{
						opacity: 0
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
		class="blog-card-shadow pointer-events-none absolute inset-0 z-0 border-2 border-foreground bg-transparent"
	></div>

	<!-- 2. Main Origami Card (Layer 10) -->
	<a
		href={localizeHref(`/blog/${post.slug}`)}
		class="blog-card-inner relative z-10 flex h-full flex-col overflow-hidden border-2 border-foreground bg-card text-card-foreground"
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
		<div class="blog-card-image-wrapper relative aspect-video overflow-hidden">
			<img
				src={optimizeImage(post.thumbnailUrl || '/images/placeholder-blog.jpg', {
					width: 600,
					quality: 75
				})}
				alt={post.title}
				class="blog-card-image h-full w-full object-cover grayscale transition-all duration-700 ease-out"
				loading="lazy"
			/>

			<!-- Technical Overlay -->
			<div class="absolute top-4 left-4 z-20 flex flex-col gap-2">
				{#if isNew}
					<div
						class="flex items-center gap-1 bg-primary px-3 py-1 font-mono text-[9px] font-black tracking-widest text-primary-foreground uppercase"
					>
						<Sparkles class="size-3" /> [NEW_ENTRY]
					</div>
				{/if}
				<div
					class="flex items-center gap-1 bg-foreground/90 px-3 py-1 font-mono text-[9px] font-black tracking-widest text-background uppercase"
				>
					<Calendar class="size-3" />
					{formattedDate}
				</div>
			</div>
		</div>

		<!-- Content -->
		<div class="relative z-10 flex flex-1 flex-col bg-card p-6">
			<!-- Tags -->
			<div class="mb-4 flex flex-wrap gap-3">
				{#each post.tags || [] as tag (tag)}
					<span
						class="blog-tag flex items-center gap-1 border border-foreground/10 px-2.5 py-1 font-mono text-[9px] font-black tracking-widest text-card-foreground uppercase dark:text-primary"
					>
						<Hash class="size-2" />
						{tag}
					</span>
				{/each}
			</div>

			<div class="flex items-start justify-between gap-4">
				<h3
					class="font-poppins text-xl leading-tight font-black tracking-tighter transition-colors group-hover:text-primary lg:text-2xl"
				>
					{post.title}
				</h3>
				<div class="blog-card-arrow shrink-0">
					<ArrowUpRight class="size-6 text-primary" />
				</div>
			</div>

			<p
				class="mt-4 line-clamp-2 font-mono text-xs leading-relaxed text-card-foreground/70 uppercase dark:text-muted-foreground"
			>
				{post.description}
			</p>

			<!-- Reading Time & CTA -->
			<div class="mt-auto flex items-center justify-between border-t border-foreground/10 pt-6">
				{#if post.readingTime}
					<div
						class="flex items-center gap-2 font-mono text-[10px] font-black text-card-foreground/60 uppercase dark:text-foreground/50"
					>
						<Clock class="size-3" />
						<span>{post.readingTime} MIN_READ</span>
					</div>
				{/if}

				<div
					class="footer-cta flex items-center gap-2 font-mono text-[10px] font-black text-primary opacity-0 transition-opacity"
				>
					<span>VIEW_ARCHIVE_ENTRY</span>
					<div class="footer-line h-0.5 w-8 bg-primary/30"></div>
				</div>
			</div>
		</div>
	</a>
</article>

<style lang="postcss">
	@reference "tailwindcss";

	article {
		perspective: 1200px;
	}

	/* Double Layer Asymmetric Origami Geometry */
	.blog-card-inner {
		transform-style: preserve-3d;
		clip-path: polygon(0% 0%, 100% 4%, 96% 96%, 4% 100%);
		transition: border-color 0.4s ease;
		will-change: transform, border-color, clip-path;
	}

	.blog-card-shadow {
		clip-path: polygon(4% 4%, 96% 0%, 100% 100%, 0% 96%);
		transform: translate(6px, 6px);
		transition:
			transform 0.4s cubic-bezier(0.25, 1, 0.5, 1),
			background-color 0.4s ease;
		will-change: transform, clip-path, background-color;
	}

	/* Image Wrapper clip path shifting */
	.blog-card-image-wrapper {
		clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
		transition: clip-path 0.6s cubic-bezier(0.25, 1, 0.5, 1);
		will-change: clip-path;
	}

	.group:hover .blog-card-image-wrapper {
		clip-path: polygon(0 0, 100% 0, 100% 100%, 0 85%);
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
		.blog-card-shadow {
			transform: translate(6px, 6px) !important;
			background-color: var(--primary) !important;
		}
	}
</style>
