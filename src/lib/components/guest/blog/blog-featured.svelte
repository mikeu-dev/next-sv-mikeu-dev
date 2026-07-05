<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import type { BlogPost } from '$lib/types';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { Calendar, Clock, Sparkles, Hash, ArrowUpRight } from '@lucide/svelte';
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
			month: 'long',
			day: 'numeric'
		})
	);

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		// Entrance animation
		if (cardElement && animateOnScroll) {
			gsap.from(cardElement, {
				rotateX: -75,
				transformOrigin: 'top center',
				y: 60,
				opacity: 0,
				duration: 1.6,
				ease: 'elastic.out(1, 0.8)',
				scrollTrigger: {
					trigger: cardElement,
					start: 'top 85%',
					toggleActions: 'play none none none'
				}
			});
		}

		// Mouse interaction (Tilt & Origami Timeline)
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

			const inner = cardElement.querySelector('.featured-card-inner');
			const shadow = cardElement.querySelector('.featured-card-shadow');
			const crease = cardElement.querySelector('.origami-crease');
			const flap = cardElement.querySelector('.origami-flap');
			const tags = cardElement.querySelectorAll('.featured-tag');
			const image = cardElement.querySelector('.featured-image');
			const arrow = cardElement.querySelector('.featured-arrow');
			const cta = cardElement.querySelector('.footer-cta');
			const line = cardElement.querySelector('.footer-line');

			hoverTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

			// 1. Elevate inner card, shear shadow
			hoverTl.to(
				inner,
				{
					z: 50,
					scale: 1.02,
					borderColor: 'var(--primary)',
					duration: 0.5
				},
				0
			);

			hoverTl.to(
				shadow,
				{
					x: 20,
					y: 20,
					rotate: -2,
					backgroundColor: 'var(--primary)',
					duration: 0.5
				},
				0
			);

			// 2. Crease lighting
			hoverTl.to(
				crease,
				{
					opacity: 0.75,
					duration: 0.4
				},
				0
			);

			// 3. Fold corner flap 180 degrees
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

			// 4. Stagger tags
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
						stagger: 0.05,
						duration: 0.4,
						ease: 'back.out(2.2)'
					},
					0.1
				);
			}

			// 5. Image pop
			if (image) {
				hoverTl.to(
					image,
					{
						scale: 1.06,
						filter: 'grayscale(0%)',
						duration: 0.8
					},
					0
				);
			}

			// 6. Arrow pop
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

			// 7. Reveal view CTA
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
						width: '5rem',
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

			gsap.to(cardElement.querySelector('.featured-card-inner'), {
				rotateY: x * 10,
				rotateX: -y * 10,
				duration: 0.4,
				ease: 'power2.out'
			});

			gsap.to(cardElement.querySelector('.featured-card-shadow'), {
				x: 20 - x * 10,
				y: 20 - y * 10,
				duration: 0.4,
				ease: 'power2.out'
			});
		};

		const handleMouseLeave = () => {
			if (!isHoverable || !cardElement) return;

			if (hoverTl) hoverTl.kill();

			const inner = cardElement.querySelector('.featured-card-inner');
			const shadow = cardElement.querySelector('.featured-card-shadow');
			const crease = cardElement.querySelector('.origami-crease');
			const flap = cardElement.querySelector('.origami-flap');
			const image = cardElement.querySelector('.featured-image');
			const arrow = cardElement.querySelector('.featured-arrow');
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
					borderColor: 'var(--foreground)'
				},
				0
			);

			hoverTl.to(
				shadow,
				{
					x: 8,
					y: 8,
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
						width: '3rem'
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
		class="featured-card-shadow pointer-events-none absolute inset-0 z-0 border-2 border-foreground bg-transparent"
	></div>

	<!-- 2. Main Origami Card (Layer 10) -->
	<a
		href={localizeHref(`/blog/${post.slug}`)}
		class="featured-card-inner relative z-10 flex flex-col overflow-hidden border-2 border-foreground bg-card text-card-foreground md:flex-row"
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

		<!-- Image Section with Clip Path -->
		<div class="featured-image-wrapper relative h-72 overflow-hidden md:h-auto md:w-1/2">
			<img
				src={optimizeImage(post.thumbnailUrl || '/images/placeholder-blog.jpg', {
					width: 1200,
					quality: 80
				})}
				alt={post.title}
				class="featured-image h-full w-full object-cover grayscale transition-all duration-700 ease-out"
			/>
			<div class="absolute inset-0 bg-primary/10 opacity-0 transition-opacity"></div>

			<!-- Featured Label -->
			<div class="absolute top-6 left-6 z-20">
				<div
					class="flex items-center gap-1 bg-primary px-4 py-1.5 font-mono text-[10px] font-black tracking-[0.2em] text-primary-foreground uppercase shadow-[4px_4px_0_var(--foreground)]"
				>
					<Sparkles class="size-3.5" /> [FEATURED_ENTRY]
				</div>
			</div>
		</div>

		<!-- Content Section -->
		<div class="relative z-10 flex flex-col justify-center bg-card p-8 md:w-1/2 md:p-12 lg:p-16">
			<!-- Tags -->
			<div class="mb-6 flex flex-wrap gap-3">
				{#each post.tags || [] as tag (tag)}
					<span
						class="featured-tag flex items-center gap-1 border border-foreground/10 px-3 py-1.5 font-mono text-[9px] font-black tracking-widest text-card-foreground uppercase dark:text-primary"
					>
						<Hash class="size-2.5" />
						{tag}
					</span>
				{/each}
			</div>

			<div class="flex items-start justify-between gap-6">
				<h2
					class="font-poppins text-3xl leading-tight font-black tracking-tighter transition-colors group-hover:text-primary md:text-5xl lg:text-6xl"
				>
					{post.title}
				</h2>
				<div class="featured-arrow shrink-0 md:mt-2">
					<ArrowUpRight class="size-8 text-primary" />
				</div>
			</div>

			<p
				class="mt-8 line-clamp-3 font-mono text-xs leading-relaxed tracking-tight text-card-foreground/70 uppercase md:text-sm dark:text-muted-foreground"
			>
				// {post.description}
			</p>

			<!-- Metas & CTA -->
			<div
				class="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-foreground/10 pt-8"
			>
				<div class="flex flex-wrap items-center gap-6">
					<div
						class="flex items-center gap-2 font-mono text-[10px] font-black tracking-widest text-card-foreground/60 uppercase dark:text-foreground/50"
					>
						<Calendar class="size-3.5" />
						<span>{formattedDate}</span>
					</div>
					{#if post.readingTime}
						<div
							class="flex items-center gap-2 font-mono text-[10px] font-black tracking-widest text-card-foreground/60 uppercase dark:text-foreground/50"
						>
							<Clock class="size-3.5" />
							<span>{post.readingTime} MIN_READ</span>
						</div>
					{/if}
				</div>

				<div
					class="footer-cta flex items-center gap-2 font-mono text-[10px] font-black text-primary opacity-0 transition-opacity"
				>
					<span>VIEW_ARCHIVE_ENTRY</span>
					<div class="footer-line h-0.5 w-12 bg-primary/30"></div>
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
	.featured-card-inner {
		transform-style: preserve-3d;
		clip-path: polygon(0 0, 100% 2%, 98% 98%, 2% 100%);
		transition:
			border-color 0.4s ease,
			clip-path 0.6s cubic-bezier(0.25, 1, 0.5, 1);
		will-change: transform, border-color, clip-path;
	}

	.featured-card-shadow {
		clip-path: polygon(2% 2%, 98% 0%, 100% 100%, 0% 98%);
		transform: translate(8px, 8px);
		transition:
			transform 0.4s cubic-bezier(0.25, 1, 0.5, 1),
			clip-path 0.6s cubic-bezier(0.25, 1, 0.5, 1),
			background-color 0.4s ease;
		will-change: transform, clip-path, background-color;
	}

	.group:hover .featured-card-inner {
		clip-path: polygon(2% 2%, 98% 0%, 100% 100%, 0% 98%);
	}

	.group:hover .featured-card-shadow {
		clip-path: polygon(0 0, 100% 2%, 98% 98%, 2% 100%);
	}

	/* Image Section clip path shifting */
	.featured-image-wrapper {
		clip-path: polygon(0 0, 100% 0, 93% 100%, 0 100%);
		transition: clip-path 0.6s cubic-bezier(0.25, 1, 0.5, 1);
		will-change: clip-path;
	}

	.group:hover .featured-image-wrapper {
		clip-path: polygon(0 0, 100% 0, 100% 100%, 7% 100%);
	}

	/* Origami Crease Lighting */
	.origami-crease {
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.04) 0%,
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
		.featured-card-shadow {
			transform: translate(8px, 8px) !important;
			background-color: var(--primary) !important;
		}
	}
</style>
