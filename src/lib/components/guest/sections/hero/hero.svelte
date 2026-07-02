<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { gsap } from 'gsap';
	import { m } from '$lib/paraglide/messages';

	let heroSection = $state<HTMLElement>();

	const currentYear = new Date().getFullYear();

	let ctx: gsap.Context;
	let removeListeners: (() => void) | undefined;

	/** Subtle magnetic cursor-pull on the CTA button; returns a cleanup function */
	function setupMagneticButtons(root: HTMLElement): () => void {
		const wrappers = root.querySelectorAll<HTMLElement>('.tape-button-wrapper');
		const cleanups: (() => void)[] = [];

		wrappers.forEach((wrapper) => {
			const xTo = gsap.quickTo(wrapper, 'x', { duration: 0.4, ease: 'power3.out' });
			const yTo = gsap.quickTo(wrapper, 'y', { duration: 0.4, ease: 'power3.out' });

			const handleMove = (e: MouseEvent) => {
				const rect = wrapper.getBoundingClientRect();
				const relX = e.clientX - rect.left - rect.width / 2;
				const relY = e.clientY - rect.top - rect.height / 2;
				xTo(gsap.utils.clamp(-8, 8, relX * 0.25));
				yTo(gsap.utils.clamp(-8, 8, relY * 0.25) - 2);
			};
			const handleLeave = () => {
				gsap.to(wrapper, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
			};

			wrapper.addEventListener('mousemove', handleMove);
			wrapper.addEventListener('mouseleave', handleLeave);
			cleanups.push(() => {
				wrapper.removeEventListener('mousemove', handleMove);
				wrapper.removeEventListener('mouseleave', handleLeave);
			});
		});

		return () => cleanups.forEach((fn) => fn());
	}

	onMount(() => {
		if (!browser || !heroSection) return;

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const section = heroSection;

		ctx = gsap.context(() => {
			if (!prefersReducedMotion) {
				gsap.set('.hero-greeting', { opacity: 0, y: 24 });
				gsap.set('.hero-name', { opacity: 0, y: 24 });
				gsap.set('.hero-pills', { opacity: 0, y: 16 });
				gsap.set('.tape-button-wrapper', { opacity: 0, scale: 0.6, y: 16 });
				gsap.set('.hero-secondary-link', { opacity: 0, y: 8 });
				gsap.set('.hero-caption', { opacity: 0 });

				const introTl = gsap.timeline();
				introTl.to('.hero-greeting', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0);
				introTl.to('.hero-name', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.1);
				introTl.to('.hero-pills', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.3);
				introTl.to(
					'.tape-button-wrapper',
					{ opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(2)' },
					0.5
				);
				introTl.to(
					'.hero-secondary-link',
					{ opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
					0.65
				);
				introTl.to('.hero-caption', { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.5);

				// Ambient blob drift — slow, organic, non-synchronized
				gsap.to('.hero-blob-1', {
					x: 40,
					y: 30,
					duration: 9,
					repeat: -1,
					yoyo: true,
					ease: 'sine.inOut'
				});
				gsap.to('.hero-blob-2', {
					x: -35,
					y: -25,
					duration: 11,
					repeat: -1,
					yoyo: true,
					ease: 'sine.inOut'
				});
				gsap.to('.hero-blob-3', {
					x: 25,
					y: -30,
					duration: 7.5,
					repeat: -1,
					yoyo: true,
					ease: 'sine.inOut'
				});
				gsap.to('.hero-dot', {
					scale: 1.5,
					opacity: 0.4,
					duration: 1.6,
					repeat: -1,
					yoyo: true,
					ease: 'sine.inOut'
				});
			}

			const removeMagnetic = prefersReducedMotion ? undefined : setupMagneticButtons(section);
			removeListeners = () => {
				removeMagnetic?.();
			};
		});
	});

	onDestroy(() => {
		removeListeners?.();
		if (ctx) ctx.revert();
	});
</script>

<section
	id="hero"
	bind:this={heroSection}
	class="paper-hero relative flex flex-col items-center justify-center px-3 pt-24 pb-6 transition-colors duration-300 sm:px-6 sm:pt-28 sm:pb-10"
>
	<div
		class="hero-card relative flex min-h-[70vh] w-full max-w-6xl flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 text-center sm:min-h-[75vh]"
	>
		<!-- Blurred color-blob glass background -->
		<div class="hero-blob hero-blob-1 absolute rounded-full blur-3xl"></div>
		<div class="hero-blob hero-blob-2 absolute rounded-full blur-3xl"></div>
		<div class="hero-blob hero-blob-3 absolute rounded-full blur-3xl"></div>
		<div class="hero-glass pointer-events-none absolute inset-0 backdrop-blur-sm"></div>

		<!-- Content -->
		<div class="relative z-10 mx-auto flex flex-col items-center px-6 py-16 md:py-24">
			<p class="hero-greeting font-mono text-sm tracking-wide text-white/80">
				{m.hero_title()}
			</p>

			<h1
				class="hero-name relative mt-2 font-poppins text-6xl font-bold tracking-tight text-white italic drop-shadow-[0_2px_20px_rgba(0,0,0,0.35)] sm:text-7xl md:text-8xl"
			>
				{m.common_alias_name()}
				<span class="hero-dot absolute top-2 -right-4 inline-block size-3 rounded-full bg-primary"
				></span>
			</h1>

			<div class="hero-pills mt-6">
				<span
					class="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-5 py-2 font-mono text-xs tracking-wide text-white/90 backdrop-blur-md sm:text-sm"
				>
					{m.hero_subtitle()}
				</span>
			</div>

			<div class="mt-10 flex flex-col items-center gap-4">
				<div class="tape-button-wrapper">
					<a
						href="#contact"
						onclick={(e) => {
							e.preventDefault();
							document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
						}}
						class="tape-button"
					>
						<span class="relative z-10 font-poppins text-lg font-bold tracking-wide sm:text-xl">
							{m.hero_button_text()}
						</span>
					</a>
				</div>

				<a
					href="#work"
					onclick={(e) => {
						e.preventDefault();
						document.querySelector('#work')?.scrollIntoView({ behavior: 'smooth' });
					}}
					class="hero-secondary-link font-mono text-xs tracking-wide text-white/60 underline decoration-transparent underline-offset-4 transition-colors hover:text-white hover:decoration-current sm:text-sm"
				>
					{m.hero_button_link()} →
				</a>
			</div>
		</div>

		<!-- Corner captions -->
		<span
			class="hero-caption absolute bottom-4 left-4 z-10 font-mono text-[10px] tracking-widest text-white/50 sm:bottom-6 sm:left-6"
			>{currentYear}</span
		>
		<span
			class="hero-caption absolute right-4 bottom-4 z-10 font-mono text-[10px] tracking-widest text-white/50 sm:right-6 sm:bottom-6"
			>Indonesia</span
		>
	</div>
</section>

<style lang="postcss">
	@reference "tailwindcss";

	.paper-hero {
		perspective: 1500px;
	}

	.hero-card {
		background: var(--hero-base);
	}

	:root {
		--hero-base: #051a13;
		--hero-blob-1: #fcec62;
		--hero-blob-2: #c7d796;
		--hero-blob-3: #438468;

		/* Glossy Tape CTA — the one remaining signature visual detail */
		--tape-bg-grad:
			linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0) 25%),
			linear-gradient(135deg, #fff07c 0%, #fcec62 50%, #e5c300 100%);
		--tape-color: #363200;
		--tape-shadow: rgba(5, 26, 19, 0.4);
		--tape-shadow-hover: rgba(5, 26, 19, 0.6);
	}

	:global(.dark) {
		--hero-base: #051a13;
		--hero-blob-1: #fcec62;
		--hero-blob-2: #1a4435;
		--hero-blob-3: #438468;

		--tape-bg-grad:
			linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 25%),
			linear-gradient(135deg, #f4f4f5 0%, #e2e2e8 50%, #b0b0b8 100%);
		--tape-color: #18181b;
		--tape-shadow: rgba(0, 0, 0, 0.8);
		--tape-shadow-hover: rgba(0, 0, 0, 1);
	}

	.hero-blob {
		width: 60vw;
		max-width: 640px;
		aspect-ratio: 1;
		opacity: 0.55;
		will-change: transform;
	}

	.hero-blob-1 {
		top: -12%;
		left: -10%;
		background: var(--hero-blob-1);
	}

	.hero-blob-2 {
		right: -8%;
		bottom: -15%;
		background: var(--hero-blob-2);
	}

	.hero-blob-3 {
		top: 15%;
		right: 15%;
		width: 40vw;
		max-width: 420px;
		background: var(--hero-blob-3);
	}

	.hero-glass {
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.06) 0%,
			rgba(255, 255, 255, 0) 40%,
			rgba(0, 0, 0, 0.25) 100%
		);
	}

	.tape-button-wrapper {
		display: inline-flex;
		filter: drop-shadow(0px 6px 12px var(--tape-shadow));
		transition: filter 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
		will-change: transform, filter;
	}

	.tape-button-wrapper:hover {
		/* Lift is applied via the magnetic-hover GSAP tween, not here — an inline
		   transform written by GSAP always wins over this rule anyway. */
		filter: drop-shadow(0px 10px 16px var(--tape-shadow-hover));
	}

	.tape-button {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 14px 36px;
		cursor: pointer;
		background: var(--tape-bg-grad);
		color: var(--tape-color);
		border-radius: 9999px;
		transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
		text-decoration: none;
	}

	@media (min-width: 640px) {
		.tape-button {
			padding: 18px 48px;
		}
	}
</style>
