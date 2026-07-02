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
	 * Blobs live entirely on their own ambient drift/morph — they never move toward
	 * the cursor. The cursor's only job is to "ignite" whichever blob(s) it gets
	 * close to: those glow brighter and distort — skewed/stretched toward the
	 * cursor's direction like a liquid surface reacting to proximity — while their
	 * position stays fully autonomous. Skew is a transform property, independent
	 * of the `border-radius` CSS-keyframe morph already running on the same blob,
	 * so the two never fight over the same property.
	 */
	function setupCursorBlobs(card: HTMLElement): () => void {
		const blobs = Array.from(card.querySelectorAll<HTMLElement>('.hero-blob'));
		const movers = blobs.map((blob) => ({
			blob,
			skewXTo: gsap.quickTo(blob, 'skewX', { duration: 0.5, ease: 'power2.out' }),
			skewYTo: gsap.quickTo(blob, 'skewY', { duration: 0.5, ease: 'power2.out' }),
			scaleTo: gsap.quickTo(blob, 'scale', { duration: 0.5, ease: 'power2.out' }),
			opacityTo: gsap.quickTo(blob, 'opacity', { duration: 0.45, ease: 'power2.out' })
		}));

		let ticking = false;
		let lastEvent: MouseEvent | null = null;

		const applyMove = () => {
			if (!lastEvent) return;

			movers.forEach(({ blob, skewXTo, skewYTo, scaleTo, opacityTo }) => {
				const blobRect = blob.getBoundingClientRect();
				const centerX = blobRect.left + blobRect.width / 2;
				const centerY = blobRect.top + blobRect.height / 2;
				const dx = lastEvent!.clientX - centerX;
				const dy = lastEvent!.clientY - centerY;
				const dist = Math.hypot(dx, dy);
				const proximity = gsap.utils.clamp(0, 1, 1 - dist / 420);

				skewXTo(gsap.utils.clamp(-25, 25, dx * 0.045 * proximity));
				skewYTo(gsap.utils.clamp(-25, 25, dy * 0.045 * proximity));
				scaleTo(1 + proximity * 0.15);
				opacityTo(0.4 + proximity * 0.45);
			});

			ticking = false;
		};

		const handleMove = (e: MouseEvent) => {
			lastEvent = e;
			if (!ticking) {
				ticking = true;
				requestAnimationFrame(applyMove);
			}
		};
		const handleLeave = () => {
			movers.forEach(({ skewXTo, skewYTo, scaleTo, opacityTo }) => {
				skewXTo(0);
				skewYTo(0);
				scaleTo(1);
				opacityTo(0.4);
			});
		};

		card.addEventListener('mousemove', handleMove);
		card.addEventListener('mouseleave', handleLeave);
		return () => {
			card.removeEventListener('mousemove', handleMove);
			card.removeEventListener('mouseleave', handleLeave);
		};
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

				// Ambient blob drift — slow, organic, non-synchronized. Targets the wrapper
				// layer (not `.hero-blob` itself) so it doesn't fight the cursor-follow
				// tween below, which animates the inner blob's x/y independently.
				gsap.to('.hero-blob-wrap-1', {
					x: 40,
					y: 30,
					duration: 9,
					repeat: -1,
					yoyo: true,
					ease: 'sine.inOut'
				});
				gsap.to('.hero-blob-wrap-2', {
					x: -35,
					y: -25,
					duration: 11,
					repeat: -1,
					yoyo: true,
					ease: 'sine.inOut'
				});
				gsap.to('.hero-blob-wrap-3', {
					x: 25,
					y: -30,
					duration: 7.5,
					repeat: -1,
					yoyo: true,
					ease: 'sine.inOut'
				});
				gsap.to('.hero-blob-wrap-4', {
					x: -20,
					y: 35,
					duration: 13,
					repeat: -1,
					yoyo: true,
					ease: 'sine.inOut'
				});
				gsap.to('.hero-blob-wrap-5', {
					x: 30,
					y: 20,
					duration: 10,
					repeat: -1,
					yoyo: true,
					ease: 'sine.inOut'
				});
				gsap.to('.hero-blob-wrap-6', {
					x: -28,
					y: -18,
					duration: 8.5,
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

			const pointerIsFine = window.matchMedia('(pointer: fine)').matches;
			const removeMagnetic = prefersReducedMotion ? undefined : setupMagneticButtons(section);
			const removeCursorBlobs =
				!prefersReducedMotion && pointerIsFine && heroCard ? setupCursorBlobs(heroCard) : undefined;
			const removePendulumHover =
				!prefersReducedMotion && heroNameEl && devTagEl
					? setupPendulumHover(heroNameEl, devTagEl)
					: undefined;
			removeListeners = () => {
				removeMagnetic?.();
				removeCursorBlobs?.();
				removePendulumHover?.();
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
		bind:this={heroCard}
		class="hero-card max-w-screen-4xl relative flex min-h-[70vh] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 text-center sm:min-h-[75vh]"
	>
		<!-- Blurred organic color-blob glass background — outer wrapper drifts ambiently,
		     inner blob morphs shape and is pulled toward the cursor independently -->
		<div class="hero-blob-wrap hero-blob-wrap-1 absolute">
			<div class="hero-blob hero-blob-1 h-full w-full blur-[110px]"></div>
		</div>
		<div class="hero-blob-wrap hero-blob-wrap-2 absolute">
			<div class="hero-blob hero-blob-2 h-full w-full blur-[110px]"></div>
		</div>
		<div class="hero-blob-wrap hero-blob-wrap-3 absolute">
			<div class="hero-blob hero-blob-3 h-full w-full blur-[110px]"></div>
		</div>
		<div class="hero-blob-wrap hero-blob-wrap-4 absolute">
			<div class="hero-blob hero-blob-4 h-full w-full blur-[110px]"></div>
		</div>
		<div class="hero-blob-wrap hero-blob-wrap-5 absolute">
			<div class="hero-blob hero-blob-5 h-full w-full blur-[110px]"></div>
		</div>
		<div class="hero-blob-wrap hero-blob-wrap-6 absolute">
			<div class="hero-blob hero-blob-6 h-full w-full blur-[110px]"></div>
		</div>
		<div class="hero-glass pointer-events-none absolute inset-0 backdrop-blur-sm"></div>

		<!-- Content -->
		<div class="relative z-10 mx-auto flex flex-col items-center px-6 py-16 md:py-24">
			<p class="hero-greeting font-mono text-sm tracking-wide text-white/80">
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

	/* "Dev" tag — hangs off the name at an angle, pinned at its own bottom-right
	   corner (moved here from the navbar logo, which no longer has it). */
	.hero-dev-tag {
		transform-origin: calc(100% - 0.375rem) calc(100% - 0.375rem);
	}

	:root {
		--hero-base: #051a13;
		/* Blob palette stays theme-independent — the card is always a dark glass
		   surface regardless of the site's light/dark toggle, so one set of
		   avocado-family colors covers both. */
		--hero-blob-1: #fcec62; /* yellow */
		--hero-blob-1-light: #fff9c4;
		--hero-blob-2: #c7d796; /* soft mint */
		--hero-blob-2-light: #eef6d9;
		--hero-blob-3: #438468; /* avocado green */
		--hero-blob-3-light: #8fd6ac;
		--hero-blob-4: #a8e063; /* vivid lime, bridges yellow and green */
		--hero-blob-4-light: #e3f7b8;
		--hero-blob-5: #1a4435; /* deep emerald */
		--hero-blob-5-light: #4f9973;
		--hero-blob-6: #2f6e52; /* deep teal-green */
		--hero-blob-6-light: #6bbf94;

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

		--tape-bg-grad:
			linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 25%),
			linear-gradient(135deg, #f4f4f5 0%, #e2e2e8 50%, #b0b0b8 100%);
		--tape-color: #18181b;
		--tape-shadow: rgba(0, 0, 0, 0.8);
		--tape-shadow-hover: rgba(0, 0, 0, 1);
	}

	.hero-blob-wrap {
		width: 50vw;
		max-width: 560px;
		aspect-ratio: 1;
		will-change: transform;
	}

	/* Blobs are sized well past the card itself and heavily overlapped so their
	   blur merges into one continuous mesh-gradient wash, not separate floating
	   shapes — matching the reference's smooth full-bleed color blend. */
	.hero-blob-wrap-1 {
		top: -40%;
		left: -30%;
		width: 95vw;
		max-width: 1050px;
	}

	.hero-blob-wrap-2 {
		right: -25%;
		bottom: -35%;
		width: 90vw;
		max-width: 1000px;
	}

	.hero-blob-wrap-3 {
		top: -10%;
		right: -15%;
		width: 75vw;
		max-width: 840px;
	}

	.hero-blob-wrap-4 {
		bottom: -20%;
		left: -15%;
		width: 70vw;
		max-width: 780px;
	}

	.hero-blob-wrap-5 {
		top: 15%;
		left: 20%;
		width: 62vw;
		max-width: 700px;
	}

	.hero-blob-wrap-6 {
		top: -20%;
		right: 15%;
		width: 58vw;
		max-width: 650px;
	}

	.hero-blob {
		opacity: 0.4;
		/* Screen blend makes overlapping blobs add light together instead of just
		   stacking flat color — the key to reading as glowing light, not paint.
		   Kept lower at rest since these blobs now overlap heavily; screen blend
		   compounds brightness fast where several colors stack. */
		mix-blend-mode: screen;
		will-change: transform, opacity, border-radius;
	}

	.hero-blob-1 {
		background: radial-gradient(
			circle at 50% 50%,
			var(--hero-blob-1-light) 0%,
			var(--hero-blob-1) 45%,
			transparent 75%
		);
		animation: blob-morph-a 16s ease-in-out infinite;
	}

	.hero-blob-2 {
		background: radial-gradient(
			circle at 50% 50%,
			var(--hero-blob-2-light) 0%,
			var(--hero-blob-2) 45%,
			transparent 75%
		);
		animation: blob-morph-b 19s ease-in-out infinite;
	}

	.hero-blob-3 {
		background: radial-gradient(
			circle at 50% 50%,
			var(--hero-blob-3-light) 0%,
			var(--hero-blob-3) 45%,
			transparent 75%
		);
		animation: blob-morph-c 14s ease-in-out infinite;
	}

	.hero-blob-4 {
		background: radial-gradient(
			circle at 50% 50%,
			var(--hero-blob-4-light) 0%,
			var(--hero-blob-4) 45%,
			transparent 75%
		);
		animation: blob-morph-a 21s ease-in-out infinite reverse;
	}

	.hero-blob-5 {
		background: radial-gradient(
			circle at 50% 50%,
			var(--hero-blob-5-light) 0%,
			var(--hero-blob-5) 45%,
			transparent 75%
		);
		animation: blob-morph-b 17s ease-in-out infinite reverse;
	}

	.hero-blob-6 {
		background: radial-gradient(
			circle at 50% 50%,
			var(--hero-blob-6-light) 0%,
			var(--hero-blob-6) 45%,
			transparent 75%
		);
		animation: blob-morph-c 23s ease-in-out infinite reverse;
	}

	@keyframes blob-morph-a {
		0%,
		100% {
			border-radius: 63% 37% 54% 46% / 43% 65% 35% 57%;
		}
		50% {
			border-radius: 38% 62% 63% 37% / 61% 41% 59% 39%;
		}
	}

	@keyframes blob-morph-b {
		0%,
		100% {
			border-radius: 42% 58% 68% 32% / 55% 45% 55% 45%;
		}
		50% {
			border-radius: 66% 34% 44% 56% / 38% 62% 38% 62%;
		}
	}

	@keyframes blob-morph-c {
		0%,
		100% {
			border-radius: 55% 45% 35% 65% / 65% 55% 45% 35%;
		}
		50% {
			border-radius: 48% 52% 70% 30% / 45% 62% 38% 55%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-blob {
			animation: none;
			border-radius: 50%;
		}
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
