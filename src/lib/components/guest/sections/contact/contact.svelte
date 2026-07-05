<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { ArrowRight, Hash, Command, MessageSquare } from '@lucide/svelte';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';

	let contactSection = $state<HTMLElement>();
	let shardsContainer = $state<HTMLElement>();
	let cardElement = $state<HTMLElement>();

	onMount(() => {
		if (!contactSection || !shardsContainer || !cardElement) return;

		gsap.registerPlugin(ScrollTrigger);

		// 3D Reveal Timeline
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: contactSection,
				start: 'top 80%',
				toggleActions: 'play none none none'
			}
		});

		// Origami Reveal Animations
		tl.from('.origami-bg-shard', {
			rotateX: -90,
			opacity: 0,
			duration: 1.2,
			stagger: 0.1,
			ease: 'power4.out'
		})
			.from(
				cardElement,
				{
					rotateX: -100,
					transformOrigin: 'top center',
					y: 80,
					opacity: 0,
					duration: 1.5,
					ease: 'elastic.out(0.9, 0.75)'
				},
				'-=0.8'
			)
			.from(
				'.technical-label',
				{
					x: -20,
					opacity: 0,
					duration: 0.5,
					stagger: 0.1
				},
				'-=0.8'
			);

		// Mouse Interaction (Parallax for Shards and Main Wrapper)
		const handleMouseMove = (e: MouseEvent) => {
			if (!shardsContainer) return;
			const { clientX, clientY } = e;
			const x = (clientX / window.innerWidth - 0.5) * 15;
			const y = (clientY / window.innerHeight - 0.5) * 15;

			gsap.to('.shards-wrapper', {
				rotateY: x,
				rotateX: -y,
				duration: 1.5,
				ease: 'power2.out'
			});
		};

		// 3D Card Hover Interaction (Tilt & Fold corner flap)
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

			const inner = cardElement.querySelector('.contact-card-inner');
			const shadow = cardElement.querySelector('.contact-card-shadow');
			const crease = cardElement.querySelector('.origami-crease');
			const flap = cardElement.querySelector('.origami-flap');

			hoverTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

			// Elevate card, shift & scale neo-brutalist backing shadow, and morph clip-paths
			hoverTl.to(
				inner,
				{
					z: 40,
					scale: 1.02,
					borderColor: 'var(--primary)',
					clipPath: 'polygon(2% 2%, 98% 0%, 100% 100%, 0% 98%)',
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
					clipPath: 'polygon(0% 0%, 100% 2%, 98% 98%, 2% 100%)',
					duration: 0.5
				},
				0
			);

			// Crease shadow deepens for a 3D folded paper crease aesthetic
			hoverTl.to(
				crease,
				{
					opacity: 0.6,
					duration: 0.4
				},
				0
			);

			// Fold top-right origami corner flap 180 degrees back along diagonal
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
		};

		const handleMouseLeave = () => {
			if (!isHoverable || !cardElement) return;

			if (hoverTl) hoverTl.kill();

			const inner = cardElement.querySelector('.contact-card-inner');
			const shadow = cardElement.querySelector('.contact-card-shadow');
			const crease = cardElement.querySelector('.origami-crease');
			const flap = cardElement.querySelector('.origami-flap');

			hoverTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

			hoverTl.to(
				inner,
				{
					z: 0,
					scale: 1,
					borderColor: 'var(--foreground)',
					clipPath: 'polygon(0% 0%, 100% 2%, 98% 98%, 2% 100%)',
					duration: 0.5
				},
				0
			);

			hoverTl.to(
				shadow,
				{
					x: 8,
					y: 8,
					rotate: 0,
					backgroundColor: 'transparent',
					clipPath: 'polygon(2% 2%, 98% 0%, 100% 100%, 0% 98%)',
					duration: 0.5
				},
				0
			);

			hoverTl.to(
				crease,
				{
					opacity: 0.35,
					duration: 0.4
				},
				0
			);

			hoverTl.to(
				flapState,
				{
					deg: 0,
					duration: 0.6,
					ease: 'power2.inOut',
					onUpdate: () => applyFlapRotation(flap)
				},
				0
			);
		};

		window.addEventListener('mousemove', handleMouseMove);

		if (cardElement) {
			cardElement.addEventListener('mouseenter', handleMouseEnter);
			cardElement.addEventListener('mouseleave', handleMouseLeave);
		}

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			if (cardElement) {
				cardElement.removeEventListener('mouseenter', handleMouseEnter);
				cardElement.removeEventListener('mouseleave', handleMouseLeave);
			}
		};
	});
</script>

<section
	bind:this={contactSection}
	class="contact-section relative z-10 overflow-hidden bg-background py-24 md:py-32"
>
	<!-- Grain Texture Overlay -->
	<div
		class="pointer-events-none absolute inset-0 z-50 opacity-[0.03] mix-blend-overlay contrast-150 grayscale"
		style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
	></div>

	<div class="relative container mx-auto px-6">
		<div bind:this={shardsContainer} class="shards-wrapper relative flex flex-col items-center">
			<!-- Decorative Shards -->
			<div
				class="origami-bg-shard absolute -top-12 -left-12 size-64 bg-primary/5 dark:bg-primary/10"
				style="clip-path: polygon(0% 15%, 100% 0%, 85% 100%, 15% 85%);"
			></div>
			<div
				class="origami-bg-shard absolute -right-12 -bottom-12 size-80 bg-foreground/5"
				style="clip-path: polygon(15% 0%, 100% 15%, 85% 85%, 0% 100%);"
			></div>

			<!-- Technical Labels -->
			<div
				class="mb-12 flex w-full flex-wrap items-center justify-between gap-4 border-b-2 border-foreground pb-6"
			>
				<div
					class="technical-label flex items-center gap-2 font-mono text-[10px] font-black text-primary uppercase"
				>
					<Hash class="size-3" /> PROTOCOL: CONTACT_INIT_V2
				</div>
				<div
					class="technical-label flex items-center gap-2 font-mono text-[10px] font-black text-foreground/50 uppercase"
				>
					<Command class="size-3 animate-pulse" /> [READY_FOR_DEPLOYMENT]
				</div>
			</div>

			<!-- Main Content Card Wrapper (Double Layer Asymmetric Origami Geometry) -->
			<div class="group relative my-8 w-full max-w-4xl select-none" bind:this={cardElement}>
				<!-- 1. Backing Shadow Card (Asymmetric Layer) -->
				<div
					class="contact-card-shadow pointer-events-none absolute inset-0 z-0 border-4 border-foreground bg-transparent"
				></div>

				<!-- 2. Main Origami Card -->
				<div
					class="contact-card-inner relative z-10 flex flex-col items-center justify-center overflow-hidden border-4 border-foreground bg-card p-10 text-center sm:p-16 md:p-20"
				>
					<!-- Origami Crease Lighting Overlay -->
					<div class="origami-crease pointer-events-none absolute inset-0 z-20 opacity-35"></div>

					<!-- 3D Origami Corner Flap -->
					<div
						class="origami-flap-container pointer-events-none absolute top-0 right-0 z-30 size-20 overflow-visible"
					>
						<div
							class="absolute inset-0 bg-primary/20"
							style="clip-path: polygon(100% 0, 100% 100%, 0 0);"
						></div>
						<div
							class="origami-flap absolute inset-0 origin-top-left border-b-4 border-l-4 border-foreground bg-card"
							style="clip-path: polygon(100% 0, 100% 100%, 0 0); transform-style: preserve-3d; transform: rotate3d(1, -1, 0, 0deg);"
						></div>
					</div>

					<!-- Content inside Card -->
					<div class="contact-content relative z-10 flex w-full flex-col items-center">
						<div
							class="mb-6 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-4 py-1.5 font-mono text-[10px] font-bold tracking-widest text-foreground/80 uppercase"
						>
							<MessageSquare class="size-3 text-primary" />
							{m.contact_page_title()}
						</div>

						<h2
							class="mb-8 font-poppins text-4xl leading-none font-black tracking-tighter sm:text-6xl lg:text-7xl"
						>
							{m.contact_title()}<span class="text-primary">.</span>
						</h2>

						<p
							class="mx-auto mb-12 max-w-2xl font-mono text-xs leading-relaxed text-muted-foreground uppercase sm:text-sm"
						>
							{m.contact_subtitle_first_part()}
							<span class="mt-2 block font-bold text-foreground">
								{m.contact_subtitle_second_part()}
							</span>
						</p>

						<a
							href={localizeHref('/contact')}
							class="contact-button group/btn relative inline-flex h-20 w-full items-center justify-center bg-primary px-12 text-primary-foreground sm:w-80"
						>
							<div class="flex items-center gap-4">
								<span
									class="font-poppins text-xl font-black tracking-tighter uppercase sm:text-2xl"
								>
									{m.contact_button()}
								</span>
								<ArrowRight
									class="size-7 transition-transform duration-300 group-hover/btn:translate-x-2"
								/>
							</div>
						</a>
					</div>
				</div>
			</div>

			<!-- Technical Footer -->
			<div class="mt-16 w-full border-t-2 border-foreground/10 pt-6">
				<div
					class="flex justify-between font-mono text-[8px] font-black tracking-[0.2em] text-foreground/40 uppercase"
				>
					<span>© MIKEU_DEV // 2026</span>
					<span class="hidden sm:block">ENCRYPTED_COMMS // SECURED</span>
					<span>STATUS: ACTIVE</span>
				</div>
			</div>
		</div>
	</div>
</section>

<style lang="postcss">
	@reference "tailwindcss";

	.contact-section {
		perspective: 1200px;
	}

	.shards-wrapper {
		transform-style: preserve-3d;
	}

	.origami-bg-shard {
		transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
		pointer-events: none;
	}

	/* Double Layer Asymmetric Origami Geometry for Main Container */
	.contact-card-inner {
		transform-style: preserve-3d;
		clip-path: polygon(0% 0%, 100% 2%, 98% 98%, 2% 100%);
		transition: border-color 0.4s ease;
		will-change: transform, border-color, clip-path;
	}

	.contact-card-shadow {
		clip-path: polygon(2% 2%, 98% 0%, 100% 100%, 0% 98%);
		transform: translate(8px, 8px);
		transition:
			transform 0.4s cubic-bezier(0.25, 1, 0.5, 1),
			background-color 0.4s ease;
		will-change: transform, clip-path, background-color;
	}

	/* Crease and Flap styling */
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

	/* Brutalist Origami Button styling */
	.contact-button {
		clip-path: polygon(0 15%, 100% 0, 95% 100%, 5% 85%);
		border: 2px solid var(--foreground);
		transition:
			transform 0.4s cubic-bezier(0.25, 1, 0.5, 1),
			box-shadow 0.4s cubic-bezier(0.25, 1, 0.5, 1),
			background-color 0.3s ease;
		will-change: transform, box-shadow;
	}

	.contact-button:hover {
		transform: scale(1.03) skewX(-6deg);
		box-shadow: 4px 4px 0px var(--foreground);
		background-color: var(--primary);
	}

	@media (max-width: 1024px) {
		.contact-card-shadow {
			transform: translate(6px, 6px) !important;
			background-color: var(--primary) !important;
		}
	}

	@media (max-width: 640px) {
		.origami-bg-shard {
			opacity: 0.1;
		}
	}
</style>
