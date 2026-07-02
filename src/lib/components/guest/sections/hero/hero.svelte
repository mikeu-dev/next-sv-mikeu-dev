<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { gsap } from 'gsap';
	import { m } from '$lib/paraglide/messages';

	let heroSection = $state<HTMLElement>();

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
				gsap.set('.hero-role', { opacity: 0, y: 16 });
				gsap.set('.tape-button-wrapper', { opacity: 0, scale: 0.6, y: 16 });
				gsap.set('.hero-secondary-link', { opacity: 0, y: 8 });

				const introTl = gsap.timeline();
				introTl.to('.hero-greeting', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0);
				introTl.to('.hero-role', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.25);
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
	class="paper-hero relative flex flex-col items-center justify-center overflow-hidden px-6 py-28 text-center transition-colors duration-300 md:py-36 lg:py-44"
>
	<!-- Adaptive Background -->
	<div
		class="pointer-events-none absolute inset-0 bg-background transition-colors duration-300"
	></div>

	<!-- Fine Grain Overlay (site-wide texture, kept for consistency with other sections) -->
	<div
		class="pointer-events-none absolute inset-0 z-10 opacity-[0.02] mix-blend-overlay"
		style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
	></div>

	<div class="relative z-20 mx-auto max-w-3xl">
		<h1
			class="hero-greeting font-poppins text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
		>
			{m.hero_title()} <span class="text-primary">{m.common_author_name()}</span>
		</h1>

		<p
			class="hero-role mx-auto mt-5 max-w-xl font-mono text-sm leading-relaxed tracking-wide text-muted-foreground sm:text-base md:text-lg"
		>
			{m.hero_subtitle()}
		</p>

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
				class="hero-secondary-link font-mono text-xs tracking-wide text-muted-foreground underline decoration-transparent underline-offset-4 transition-colors hover:text-foreground hover:decoration-current sm:text-sm"
			>
				{m.hero_button_link()} →
			</a>
		</div>
	</div>
</section>

<style lang="postcss">
	@reference "tailwindcss";

	.paper-hero {
		perspective: 1500px;
	}

	/* Glossy Tape CTA — the one remaining signature visual detail */
	:root {
		--tape-bg-grad:
			linear-gradient(180deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0) 25%),
			linear-gradient(135deg, #fff07c 0%, #fcec62 50%, #e5c300 100%);
		--tape-color: #363200;
		--tape-shadow: rgba(5, 26, 19, 0.4);
		--tape-shadow-hover: rgba(5, 26, 19, 0.6);
	}

	:global(.dark) {
		--tape-bg-grad:
			linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 25%),
			linear-gradient(135deg, #f4f4f5 0%, #e2e2e8 50%, #b0b0b8 100%);
		--tape-color: #18181b;
		--tape-shadow: rgba(0, 0, 0, 0.8);
		--tape-shadow-hover: rgba(0, 0, 0, 1);
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
