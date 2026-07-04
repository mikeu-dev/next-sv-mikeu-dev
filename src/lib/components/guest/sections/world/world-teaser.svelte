<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { ArrowRight, Terminal, Command, Hash, Sparkles } from '@lucide/svelte';
	import FoldedWorld from './folded-world.svelte';
	import SectionLoader from '$lib/components/ui/section-loader.svelte';

	let sectionEl = $state<HTMLElement>();
	let cardElement = $state<HTMLElement>();

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		// 1. Staggered section entrance animations
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: sectionEl,
				start: 'top 75%',
				toggleActions: 'play none none none'
			}
		});

		// Origami abstract background shards swing & fold in
		tl.from('.teaser-shard', {
			rotateX: -120,
			rotateY: 45,
			scale: 0.3,
			opacity: 0,
			duration: 1.5,
			stagger: 0.15,
			ease: 'power3.out'
		});

		// 3D paper-drop unfold of the content card
		tl.from(
			'.teaser-card-stagger',
			{
				rotateX: -105,
				transformOrigin: 'top center',
				y: -50,
				opacity: 0,
				duration: 1.8,
				ease: 'elastic.out(0.85, 0.7)'
			},
			'-=1.0'
		);

		// Mouse Parallax for background element depth
		const handleMouseMoveSection = (e: MouseEvent) => {
			const { clientX, clientY } = e;
			const x = (clientX / window.innerWidth - 0.5) * 15;
			const y = (clientY / window.innerHeight - 0.5) * 15;

			gsap.to('.teaser-parallax-layer', {
				rotateY: x,
				rotateX: -y,
				duration: 1.5,
				ease: 'power2.out'
			});
		};

		window.addEventListener('mousemove', handleMouseMoveSection);

		// 2. Mouse interaction for the central card (Tilt & Origami Flap)
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

			const inner = cardElement.querySelector('.teaser-card-inner');
			const shadow = cardElement.querySelector('.teaser-card-shadow');
			const crease = cardElement.querySelector('.origami-crease');
			const flap = cardElement.querySelector('.origami-flap');
			const button = cardElement.querySelector('.teaser-button');

			hoverTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

			// Elevate card, push/shear backing shadow
			hoverTl.to(
				inner,
				{
					z: 50,
					scale: 1.03,
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
					rotate: -3,
					backgroundColor: 'var(--primary)',
					duration: 0.5
				},
				0
			);

			// Deepen crease shadow
			hoverTl.to(
				crease,
				{
					opacity: 0.75,
					duration: 0.4
				},
				0
			);

			// Fold corner flap 180 degrees back
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

			// Button pop
			if (button) {
				hoverTl.to(
					button,
					{
						scale: 1.05,
						skewX: -8,
						boxShadow: '4px 4px 0px var(--foreground)',
						duration: 0.4
					},
					0
				);
			}
		};

		const handleMouseMoveCard = (e: MouseEvent) => {
			if (!isHoverable || !cardElement) return;

			const rect = cardElement.getBoundingClientRect();
			const x = (e.clientX - rect.left) / rect.width - 0.5;
			const y = (e.clientY - rect.top) / rect.height - 0.5;

			gsap.to(cardElement.querySelector('.teaser-card-inner'), {
				rotateY: x * 12,
				rotateX: -y * 12,
				duration: 0.4,
				ease: 'power2.out'
			});

			gsap.to(cardElement.querySelector('.teaser-card-shadow'), {
				x: 20 - x * 10,
				y: 20 - y * 10,
				duration: 0.4,
				ease: 'power2.out'
			});
		};

		const handleMouseLeave = () => {
			if (!isHoverable || !cardElement) return;

			if (hoverTl) hoverTl.kill();

			const inner = cardElement.querySelector('.teaser-card-inner');
			const shadow = cardElement.querySelector('.teaser-card-shadow');
			const crease = cardElement.querySelector('.origami-crease');
			const flap = cardElement.querySelector('.origami-flap');
			const button = cardElement.querySelector('.teaser-button');

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

			if (button) {
				hoverTl.to(
					button,
					{
						scale: 1,
						skewX: 0,
						boxShadow: 'none'
					},
					0
				);
			}
		};

		if (isHoverable && cardElement) {
			cardElement.addEventListener('mouseenter', handleMouseEnter);
			cardElement.addEventListener('mousemove', handleMouseMoveCard);
			cardElement.addEventListener('mouseleave', handleMouseLeave);
		}

		return () => {
			window.removeEventListener('mousemove', handleMouseMoveSection);
			if (isHoverable && cardElement) {
				cardElement.removeEventListener('mouseenter', handleMouseEnter);
				cardElement.removeEventListener('mousemove', handleMouseMoveCard);
				cardElement.removeEventListener('mouseleave', handleMouseLeave);
			}
		};
	});
</script>

<section
	id="world-teaser"
	bind:this={sectionEl}
	class="relative h-[65vh] min-h-[500px] w-full overflow-hidden border-y-2 border-foreground bg-background py-16"
>
	<!-- Grain Texture Overlay -->
	<div
		class="pointer-events-none absolute inset-0 z-50 opacity-[0.02] mix-blend-overlay contrast-150 grayscale"
		style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
	></div>

	<!-- 3D Globe Interactive Background -->
	<div class="absolute inset-0 z-0">
		<SectionLoader class="h-full w-full">
			{#snippet fallback()}
				<div class="flex h-full w-full items-center justify-center bg-muted/5">
					<div class="h-1.5 w-1.5 animate-pulse bg-primary"></div>
				</div>
			{/snippet}
			<FoldedWorld nodes={[]} totalVisitors={0} minimal={true} />
		</SectionLoader>
	</div>

	<!-- Technical HUD Watermark Overlays -->
	<div
		class="pointer-events-none absolute inset-x-0 top-6 z-10 container mx-auto flex justify-between font-mono text-[8px] font-black tracking-[0.3em] text-foreground/20 uppercase"
	>
		<div class="flex items-center gap-2">
			<Terminal class="size-3" />
			<span>SYS_LINK: WORLD_MATRIX_ENGINE</span>
		</div>
		<div class="flex items-center gap-2">
			<Command class="size-3 animate-pulse" />
			<span>STATUS: DYNAMIC_SIMULATION</span>
		</div>
	</div>

	<!-- Central Teaser Content Overlay -->
	<div
		class="teaser-parallax-layer relative z-20 container mx-auto flex h-full flex-col items-center justify-center"
	>
		<!-- Floating Origami Shards -->
		<div
			class="teaser-shard pointer-events-none absolute -top-12 -left-12 size-48 bg-primary/5 dark:bg-primary/10"
			style="clip-path: polygon(15% 0%, 100% 10%, 85% 90%, 0% 100%);"
		></div>
		<div
			class="teaser-shard pointer-events-none absolute -right-12 -bottom-12 size-44 bg-foreground/5"
			style="clip-path: polygon(0% 20%, 90% 0%, 100% 80%, 10% 100%);"
		></div>

		<!-- CENTRAL ORIGAMI TEASER CARD -->
		<div
			class="teaser-card-stagger group relative w-full max-w-2xl select-none"
			bind:this={cardElement}
		>
			<!-- 1. Card Backing Shadow -->
			<div
				class="teaser-card-shadow pointer-events-none absolute inset-0 z-0 border-2 border-foreground bg-transparent"
			></div>

			<!-- 2. Central Interactive Card -->
			<div
				class="teaser-card-inner relative z-10 overflow-hidden border-2 border-foreground bg-background/85 p-8 text-center backdrop-blur-md md:p-12 dark:bg-background/90"
			>
				<!-- Crease Overlay -->
				<div class="origami-crease pointer-events-none absolute inset-0 z-20 opacity-35"></div>

				<!-- 3D Origami Flap -->
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

				<div class="relative z-10 flex flex-col items-center">
					<div
						class="mb-4 flex items-center gap-1.5 bg-primary px-3 py-1 font-mono text-[9px] font-black tracking-widest text-primary-foreground uppercase shadow-[2px_2px_0_var(--foreground)]"
					>
						<Sparkles class="size-3" /> [SYS_PORTAL: READY]
					</div>

					<h2
						class="font-poppins text-4xl leading-none font-black tracking-tighter text-foreground sm:text-5xl md:text-6xl"
					>
						{m.world_teaser_title()}
					</h2>

					<p
						class="mt-6 max-w-xl font-mono text-xs leading-relaxed text-muted-foreground uppercase"
					>
						{m.world_teaser_subtitle()}<br />
						// {m.world_teaser_desc()}
					</p>

					<!-- Folded Style CTA Button -->
					<a
						href={localizeHref('/world')}
						class="teaser-button group mt-10 inline-flex h-16 items-center justify-center border-2 border-foreground bg-primary px-10 text-primary-foreground transition-all duration-300"
					>
						<span class="font-poppins text-sm font-black tracking-widest uppercase">
							{m.world_teaser_button()}
						</span>
						<ArrowRight
							class="ml-3 size-5 transition-transform duration-300 group-hover:translate-x-2"
						/>
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Bottom Technical Overlay -->
	<div
		class="pointer-events-none absolute inset-x-0 bottom-6 z-10 container mx-auto flex justify-between font-mono text-[8px] font-black tracking-[0.3em] text-foreground/20 uppercase"
	>
		<span>GEOMETRY: POLYGONAL_GLOBE // ACC-01</span>
		<div class="hidden items-center gap-1 sm:flex">
			<Hash class="size-2.5" />
			<span>SYS.VERSION.2.0.4</span>
		</div>
	</div>
</section>

<style lang="postcss">
	@reference "tailwindcss";

	#world-teaser {
		perspective: 1200px;
	}

	.teaser-parallax-layer {
		transform-style: preserve-3d;
	}

	/* Double Layer Asymmetric Origami Geometry */
	.teaser-card-inner {
		transform-style: preserve-3d;
		clip-path: polygon(0 0, 100% 2%, 98% 98%, 2% 100%);
		transition:
			border-color 0.4s ease,
			clip-path 0.6s cubic-bezier(0.25, 1, 0.5, 1);
		will-change: transform, border-color, clip-path;
	}

	.teaser-card-shadow {
		clip-path: polygon(2% 2%, 98% 0%, 100% 100%, 0% 98%);
		transform: translate(8px, 8px);
		transition:
			transform 0.4s cubic-bezier(0.25, 1, 0.5, 1),
			clip-path 0.6s cubic-bezier(0.25, 1, 0.5, 1),
			background-color 0.4s ease;
		will-change: transform, clip-path, background-color;
	}

	.group:hover .teaser-card-inner {
		clip-path: polygon(2% 2%, 98% 0%, 100% 100%, 0% 98%);
	}

	.group:hover .teaser-card-shadow {
		clip-path: polygon(0 0, 100% 2%, 98% 98%, 2% 100%);
	}

	/* Crease Lighting */
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

	/* Button Custom Tab Cut */
	.teaser-button {
		clip-path: polygon(0 15%, 100% 0, 95% 100%, 5% 85%);
		will-change: transform, box-shadow;
	}

	@media (max-width: 1024px) {
		.teaser-card-shadow {
			transform: translate(8px, 8px) !important;
			background-color: var(--primary) !important;
		}
	}
</style>
