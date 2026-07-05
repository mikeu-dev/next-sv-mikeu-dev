<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { gsap } from 'gsap';
	import { m } from '$lib/paraglide/messages';

	let heroSection = $state<HTMLElement>();
	let heroCard = $state<HTMLElement>();
	let heroNameEl = $state<HTMLElement>();
	let devTagEl = $state<HTMLElement>();

	const currentYear = new Date().getFullYear();

	let ctx: gsap.Context;
	let removeListeners: (() => void) | undefined;
	let visibilityObserver: IntersectionObserver | undefined;
	const ambientTweens: gsap.core.Tween[] = [];

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

	/**
	 * Blueprint-style cursor spotlight — tracks pointer position as CSS custom
	 * properties consumed by `.mouse-spotlight`'s radial-gradient, instead of
	 * animating any element directly (cheap: one style write per rAF-throttled
	 * move, no GSAP tween churn).
	 */
	function setupMouseSpotlight(card: HTMLElement): () => void {
		let ticking = false;
		let lastEvent: MouseEvent | null = null;

		const applyMove = () => {
			if (!lastEvent) return;
			const rect = card.getBoundingClientRect();
			const x = ((lastEvent.clientX - rect.left) / rect.width) * 100;
			const y = ((lastEvent.clientY - rect.top) / rect.height) * 100;
			card.style.setProperty('--mouse-x', `${x}%`);
			card.style.setProperty('--mouse-y', `${y}%`);
			ticking = false;
		};

		const handleMove = (e: MouseEvent) => {
			lastEvent = e;
			if (!ticking) {
				ticking = true;
				requestAnimationFrame(applyMove);
			}
		};

		card.addEventListener('mousemove', handleMove);
		return () => card.removeEventListener('mousemove', handleMove);
	}

	/**
	 * The "Dev" tag hangs at an angle (its entrance swing lives in the intro
	 * timeline) and straightens up on hover, then swings back on mouseleave —
	 * moved here from the navbar logo, which no longer has it.
	 */
	function setupPendulumHover(trigger: HTMLElement, tag: HTMLElement): () => void {
		const hoverIn = () => {
			gsap.to(tag, { rotate: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
		};
		const hoverOut = () => {
			gsap.to(tag, { rotate: -25, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
		};

		trigger.addEventListener('mouseenter', hoverIn);
		trigger.addEventListener('mouseleave', hoverOut);
		return () => {
			trigger.removeEventListener('mouseenter', hoverIn);
			trigger.removeEventListener('mouseleave', hoverOut);
		};
	}

	onMount(() => {
		if (!browser || !heroSection) return;

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const section = heroSection;

		ctx = gsap.context(() => {
			if (!prefersReducedMotion) {
				gsap.set('.hero-greeting', { opacity: 0, y: 24 });
				gsap.set('.hero-name', { opacity: 0, y: 24 });
				gsap.set('.hero-dev-tag', { opacity: 0, rotate: 0 });
				gsap.set('.hero-pills', { opacity: 0, y: 16 });
				gsap.set('.tape-button-wrapper', { opacity: 0, scale: 0.6, y: 16 });
				gsap.set('.hero-secondary-link', { opacity: 0, y: 8 });
				gsap.set('.hero-caption', { opacity: 0 });

				const introTl = gsap.timeline();
				introTl.to('.hero-greeting', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0);
				introTl.to('.hero-name', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.1);
				introTl.to(
					'.hero-dev-tag',
					{ opacity: 1, rotate: -25, duration: 1, ease: 'bounce.out' },
					0.3
				);
				introTl.to('.hero-pills', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.35);
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

				// Ambient dot pulse — the only looping tween left once the color-blob
				// background was swapped for the static blueprint/origami panel.
				// Collected so it can be paused whenever the hero scrolls out of view.
				ambientTweens.push(
					gsap.to('.hero-dot', {
						scale: 1.5,
						opacity: 0.4,
						duration: 1.6,
						repeat: -1,
						yoyo: true,
						ease: 'sine.inOut'
					})
				);

				visibilityObserver = new IntersectionObserver(
					([entry]) => {
						if (entry.isIntersecting) {
							ambientTweens.forEach((tween) => tween.play());
							section.classList.remove('hero-offscreen');
						} else {
							ambientTweens.forEach((tween) => tween.pause());
							section.classList.add('hero-offscreen');
						}
					},
					{ threshold: 0 }
				);
				visibilityObserver.observe(section);
			}

			const pointerIsFine = window.matchMedia('(pointer: fine)').matches;
			const removeMagnetic = prefersReducedMotion ? undefined : setupMagneticButtons(section);
			const removeSpotlight =
				!prefersReducedMotion && pointerIsFine && heroCard
					? setupMouseSpotlight(heroCard)
					: undefined;
			const removePendulumHover =
				!prefersReducedMotion && heroNameEl && devTagEl
					? setupPendulumHover(heroNameEl, devTagEl)
					: undefined;
			removeListeners = () => {
				removeMagnetic?.();
				removeSpotlight?.();
				removePendulumHover?.();
			};
		});
	});

	onDestroy(() => {
		removeListeners?.();
		visibilityObserver?.disconnect();
		if (ctx) ctx.revert();
	});
</script>

<section
	id="hero"
	bind:this={heroSection}
	class="paper-hero relative flex flex-col items-center justify-center px-3 pt-24 pb-6 transition-colors duration-300 sm:px-6 sm:pt-28 sm:pb-10"
>
	<div
		bind:this={heroCard}
		class="hero-card max-w-screen-4xl relative flex min-h-[90vh] w-full flex-col items-center justify-center text-center sm:min-h-[90vh]"
		style="--mouse-x: 50%; --mouse-y: 50%;"
	>
		<!-- Crumpled-paper surface — fractal-noise height map lit by SVG filters:
		     feDiffuseLighting bakes each wrinkle's matte shadow/highlight, the
		     sheen layer adds the glossy light-catch on crease ridges. -->
		<div class="crumpled-paper pointer-events-none absolute inset-0"></div>
		<div class="crumpled-sheen pointer-events-none absolute inset-0"></div>

		<!-- Interactive spotlight following the cursor -->
		<div class="mouse-spotlight pointer-events-none absolute inset-0"></div>

		<!-- Glossy diagonal reflection, like light catching a folded paper surface -->
		<div class="hero-sweep pointer-events-none absolute inset-0"></div>

		<!-- Crease shading — a soft diagonal fold running through the panel -->
		<div class="hero-crease pointer-events-none absolute inset-0"></div>

		<!-- Folded paper corners -->
		<div class="hero-fold hero-fold-tr absolute top-0 right-0">
			<div class="hero-fold-shine absolute inset-0"></div>
		</div>
		<div class="hero-fold hero-fold-bl absolute bottom-0 left-0">
			<div class="hero-fold-shine absolute inset-0"></div>
		</div>

		<!-- Fine grain overlay -->
		<div
			class="pointer-events-none absolute inset-0 z-40 opacity-[0.04] mix-blend-overlay"
			style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
		></div>

		<!-- Content -->
		<div class="relative z-10 mx-auto flex flex-col items-center px-6 py-16 md:py-24">
			<p class="hero-greeting font-mono text-sm tracking-wide text-[#c7d796]/80">
				{m.hero_title()}
			</p>

			<h1
				bind:this={heroNameEl}
				class="hero-name relative z-50 mt-2 font-poppins text-6xl font-bold tracking-tight text-white italic drop-shadow-[0_2px_20px_rgba(0,0,0,0.35)] sm:text-7xl md:text-8xl"
			>
				{m.common_alias_name()}
				<span class="hero-dot absolute top-2 -right-4 inline-block size-3 rounded-full bg-primary"
				></span>
				<span
					bind:this={devTagEl}
					class="hero-dev-tag absolute -right-2 -bottom-2 inline-block bg-primary px-3 py-1 font-mono text-xs font-black tracking-widest text-primary-foreground uppercase not-italic sm:-right-4 sm:-bottom-3 sm:text-sm"
					style="clip-path: polygon(5% 0, 100% 0, 95% 100%, 0 100%);"
				>
					Dev
					<span class="absolute right-1 bottom-1 size-1.5 rounded-full bg-white"></span>
				</span>
			</h1>

			<div class="hero-pills mt-6">
				<div class="tape-wrapper">
					<div class="tape-body">
						<span class="tape-label-text font-mono">{m.hero_subtitle()}</span>
						<div class="tape-fold-tr"></div>
						<div class="tape-fold-bl"></div>
					</div>
				</div>
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
					class="hero-secondary-link font-mono text-xs tracking-wide text-[#c7d796]/70 underline decoration-transparent underline-offset-4 transition-colors hover:text-white hover:decoration-current sm:text-sm"
				>
					{m.hero_button_link()} →
				</a>
			</div>
		</div>

		<!-- Corner captions — blueprint-style annotations -->
		<span
			class="hero-caption absolute bottom-4 left-4 z-10 font-mono text-[10px] tracking-[0.2em] text-[#c7d796]/70 uppercase sm:bottom-6 sm:left-6"
			>{currentYear}</span
		>
		<span
			class="hero-caption absolute right-4 bottom-4 z-10 font-mono text-[10px] tracking-[0.2em] text-[#c7d796]/70 uppercase sm:right-6 sm:bottom-6"
			>Indonesia</span
		>
	</div>
</section>

<style lang="postcss">
	@reference "tailwindcss";

	.paper-hero {
		perspective: 1500px;
	}

	/* The card is now the origami "paper" panel itself — an asymmetric clipped
	   sheet rather than a rounded glass card, matching the brutalist-origami
	   fold motif used across the rest of the site (tape CTAs, the "Dev" tag). */
	.hero-card {
		overflow: hidden;
		clip-path: polygon(0% 2%, 98% 0%, 100% 98%, 2% 100%);
		border: 3px solid var(--hero-border);
		background: var(--hero-paper-grad);
	}

	/* "Dev" tag — hangs off the name at an angle, pinned at its own bottom-right
	   corner (moved here from the navbar logo, which no longer has it). */
	.hero-dev-tag {
		transform-origin: calc(100% - 0.375rem) calc(100% - 0.375rem);
	}

	:root {
		--hero-border: rgba(199, 215, 150, 0.5);
		--hero-paper-grad: linear-gradient(135deg, #215542 0%, #1a4435 55%, #0c2019 100%);
		--mouse-glow: rgba(252, 236, 98, 0.1);

		/* Glossy Badges — the subtitle's "tape label" treatment */
		--badge-bg-grad:
			linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 25%),
			linear-gradient(135deg, #ffffff 0%, #f4f4f4 50%, #e0e0e0 100%);
		--badge-color: #1a4435;
		--badge-fold-color: #f8f8f8;
		/* --tape-bg-grad / --tape-color / --tape-shadow* now live in app.css as
		   global brand tokens, shared with the work section's CTA. */
	}

	:global(.dark) {
		--hero-border: rgba(255, 255, 255, 0.3);
		--hero-paper-grad: linear-gradient(135deg, #3f3f46 0%, #18181b 55%, #000000 100%);
		--mouse-glow: rgba(255, 255, 255, 0.08);

		--badge-bg-grad:
			linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 25%),
			linear-gradient(135deg, #3f3f46 0%, #27272a 50%, #18181b 100%);
		--badge-color: #e2e2e8;
		--badge-fold-color: #4a4a52;
	}

	/* ── Realistic crumpled-paper surface ────────────────────────────────────
	   A fractal-noise height map fed into SVG lighting filters. `feDiffuseLighting`
	   bakes the matte shadow/highlight of every wrinkle under a fixed top-left
	   "sun" (azimuth 235°, low elevation), tuned so a FLAT area lands on ~0.5 grey
	   — neutral for the `overlay` blend — while slopes facing the light lift and
	   slopes turned away sink into shadow. Tune crease SIZE via `baseFrequency`
	   and crease DEPTH via `surfaceScale`. The sheen layer reuses the same
	   seed/frequency so its glossy `feSpecularLighting` highlights land on the
	   exact same ridges. */
	.crumpled-paper {
		background: center / cover no-repeat
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.009 0.012' numOctaves='6' seed='6' stitchTiles='stitch' result='n'/%3E%3CfeDiffuseLighting in='n' surfaceScale='3.4' diffuseConstant='0.72' lighting-color='%23fff'%3E%3CfeDistantLight azimuth='235' elevation='46'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='1200' height='1200' filter='url(%23p)'/%3E%3C/svg%3E");
		mix-blend-mode: overlay;
		opacity: 0.68;
	}

	.crumpled-sheen {
		background: center / cover no-repeat
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200'%3E%3Cfilter id='s'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.009 0.012' numOctaves='6' seed='6' stitchTiles='stitch' result='n'/%3E%3CfeSpecularLighting in='n' surfaceScale='3.4' specularConstant='0.55' specularExponent='18' lighting-color='%23fff'%3E%3CfeDistantLight azimuth='235' elevation='58'/%3E%3C/feSpecularLighting%3E%3C/filter%3E%3Crect width='1200' height='1200' filter='url(%23s)'/%3E%3C/svg%3E");
		mix-blend-mode: screen;
		opacity: 0.3;
	}

	/* Dark paper is already near-black, so the same wrinkles need a gentler hand
	   to avoid crushing to pure black / blowing out to white. */
	:global(.dark) .crumpled-paper {
		opacity: 0.52;
	}

	:global(.dark) .crumpled-sheen {
		opacity: 0.17;
	}

	.mouse-spotlight {
		background: radial-gradient(
			circle 450px at var(--mouse-x) var(--mouse-y),
			var(--mouse-glow),
			transparent 70%
		);
	}

	.hero-sweep {
		opacity: 0.7;
		mix-blend-mode: overlay;
		background: linear-gradient(
			110deg,
			rgba(255, 255, 255, 0) 35%,
			rgba(255, 255, 255, 0.2) 45%,
			rgba(255, 255, 255, 0.6) 50%,
			rgba(255, 255, 255, 0) 55%
		);
	}

	.hero-crease {
		opacity: 0.6;
		mix-blend-mode: multiply;
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0) 50%,
			rgba(0, 0, 0, 0.1) 50.1%,
			rgba(0, 0, 0, 0.3) 100%
		);
	}

	:global(.dark) .hero-crease {
		opacity: 0.8;
		mix-blend-mode: overlay;
	}

	/* Dog-eared paper corners, sitting flush in the card's own corners (rather
	   than the old design's hang-past-the-edge trick, which relied on empty
	   space around a much smaller decorative panel — this card is full-bleed,
	   so the wedge is clipped to stay inside it instead). */
	.hero-fold {
		width: 4rem;
		height: 4rem;
	}

	.hero-fold-tr {
		background: linear-gradient(225deg, #e4edc8 0%, #c7d796 100%);
		clip-path: polygon(100% 0%, 0% 0%, 100% 100%);
		filter: drop-shadow(-2px 2px 3px rgba(0, 0, 0, 0.35));
	}

	.hero-fold-bl {
		width: 3rem;
		height: 3rem;
		background: linear-gradient(45deg, #e4edc8 0%, #c7d796 100%);
		clip-path: polygon(0% 100%, 0% 0%, 100% 100%);
		filter: drop-shadow(2px -2px 3px rgba(0, 0, 0, 0.35));
	}

	.hero-fold-tr .hero-fold-shine {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, transparent 40%);
	}

	.hero-fold-bl .hero-fold-shine {
		background: linear-gradient(225deg, rgba(255, 255, 255, 0.8) 0%, transparent 40%);
	}

	/* ── Tape Label (subtitle badge, stacked-paper style) ── */
	.tape-wrapper {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		filter: drop-shadow(0px 4px 6px var(--tape-shadow));
		transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
		will-change: transform, filter;
	}

	.tape-wrapper:hover {
		filter: drop-shadow(0px 6px 10px var(--tape-shadow-hover));
		transform: translateY(-2px);
	}

	.tape-body {
		position: relative;
		display: inline-flex;
		align-items: center;
		padding: 8px 20px;
		background: var(--badge-bg-grad);
		color: var(--badge-color);
		clip-path: polygon(
			0% 0%,
			calc(100% - 16px) 0%,
			100% 16px,
			100% 100%,
			16px 100%,
			0% calc(100% - 16px)
		);
	}

	.tape-label-text {
		font-size: 12px;
		font-weight: 500;
		letter-spacing: 0.02em;
	}

	@media (min-width: 640px) {
		.tape-label-text {
			font-size: 14px;
		}
	}

	.tape-fold-tr {
		position: absolute;
		top: 0;
		right: 0;
		width: 16px;
		height: 16px;
		background: linear-gradient(
			225deg,
			transparent 50%,
			var(--badge-fold-color) 50%,
			rgba(255, 255, 255, 0.9) 100%
		);
		filter: drop-shadow(-1.5px 1.5px 1px rgba(0, 0, 0, 0.3));
	}

	.tape-fold-bl {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 16px;
		height: 16px;
		background: linear-gradient(
			45deg,
			transparent 50%,
			var(--badge-fold-color) 50%,
			rgba(255, 255, 255, 0.9) 100%
		);
		filter: drop-shadow(1.5px -1.5px 1px rgba(0, 0, 0, 0.3));
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
		clip-path: polygon(4% 0%, 100% 12%, 96% 88%, 0% 100%);
		transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
		text-decoration: none;
	}

	@media (min-width: 640px) {
		.tape-button {
			padding: 18px 48px;
		}
	}
</style>
