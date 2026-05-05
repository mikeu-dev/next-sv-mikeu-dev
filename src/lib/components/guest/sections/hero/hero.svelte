<script lang="ts">
	import { onMount } from 'svelte';
	import Matter, { type IChamferableBodyDefinition } from 'matter-js';
	import Button from '@/lib/components/ui/button/button.svelte';
	import { gsap } from 'gsap';
	import { m } from '@/lib/paraglide/messages';
	import { Terminal, Cpu, Activity, Hash, ArrowRight } from '@lucide/svelte';

	let { skills }: { skills: string[] } = $props();

	const { Engine, Runner, Bodies, Composite } = Matter;

	let heroTitle = $state<HTMLElement>();
	let heroSubtitle = $state<HTMLElement>();
	let heroButton = $state<HTMLElement>();
	let bulletContainer = $state<HTMLElement>();
	let letterElements = $state<HTMLElement[]>([]);

	const titleText = $state<string>(m.hero_title());
	const titleChars: string[] = titleText.split('');

	interface LetterData {
		body: Matter.Body;
		element: HTMLElement;
		initialX: number;
		initialY: number;
	}

	onMount(() => {
		if (!heroTitle || !heroSubtitle || !heroButton || !bulletContainer) return;

		const subtitle = heroSubtitle;
		const button = heroButton;
		const bullets = bulletContainer;

		const ctx = gsap.context(() => {
			if (!subtitle || !button || !bullets) return;
			
			// Custom Stagger for Brutalist Elements
			gsap.from('.hero-stagger', { 
				y: 30, 
				opacity: 0, 
				duration: 0.8, 
				stagger: 0.1, 
				ease: 'expo.out',
				delay: 1.2
			});

			// Background Shards Animation
			gsap.from('.origami-shard', {
				rotateX: -90,
				opacity: 0,
				duration: 1.5,
				stagger: 0.2,
				ease: 'power4.out',
				delay: 0.5
			});

		});

		// --- Matter.js Logic (MAINTAINED) ---
		const engine = Engine.create();
		const world: Matter.World = engine.world;
		engine.gravity.y = 1.0;

		const titleRect: DOMRect = heroTitle.getBoundingClientRect();
		const wallOptions: IChamferableBodyDefinition = { isStatic: true, render: { visible: false } };

		const floorY = 160; 
		const floor = Bodies.rectangle(titleRect.width / 2, floorY, titleRect.width * 2, 20, wallOptions);
		const wallLeft = Bodies.rectangle(
			-100,
			titleRect.height / 2,
			20,
			titleRect.height + 400,
			wallOptions
		);
		const wallRight = Bodies.rectangle(
			titleRect.width + 100,
			titleRect.height / 2,
			20,
			titleRect.height + 400,
			wallOptions
		);

		Composite.add(world, [floor, wallLeft, wallRight]);

		const letters: LetterData[] = letterElements
			.map((el, i) => {
				if (!el || titleChars[i] === ' ') return null;
				const rect = el.getBoundingClientRect();
				const initialX = rect.left - titleRect.left + rect.width / 2;
				const initialY = rect.top - titleRect.top + rect.height / 2;
				const body = Bodies.rectangle(
					initialX,
					initialY - 200 - Math.random() * 100,
					rect.width,
					rect.height,
					{
						restitution: 0.5,
						friction: 0.5,
						frictionAir: 0.02,
						chamfer: { radius: 2 }
					}
				);
				return { body, element: el, initialX, initialY };
			})
			.filter((v): v is LetterData => v !== null);

		letters.forEach((letter, i) => {
			setTimeout(() => {
				if (world) Composite.add(world, letter.body);
			}, i * 30); // Lebih instan, tanpa delay 1000ms
		});

		const runner = Runner.create();
		let rafId: number;
		let isVisible = true;

		const observer = new IntersectionObserver((entries) => {
			isVisible = entries[0].isIntersecting;
			if (isVisible) {
				Runner.run(runner, engine);
			} else {
				Runner.stop(runner);
			}
		});

		const heroSection = heroTitle.closest('section');
		if (heroSection) observer.observe(heroSection);

		function update() {
			if (isVisible) {
				for (const { body, element, initialX, initialY } of letters) {
					const { x, y } = body.position;
					element.style.transform = `translate(${x - initialX}px, ${y - initialY}px) rotate(${body.angle}rad)`;
				}
			}
			rafId = requestAnimationFrame(update);
		}
		rafId = requestAnimationFrame(update);

		heroTitle.style.position = 'relative';
		heroTitle.style.overflow = 'visible';

		return () => {
			ctx.revert();
			observer.disconnect();
			Runner.stop(runner);
			Engine.clear(engine);
			cancelAnimationFrame(rafId);
		};
	});
</script>

<section
	id="hero"
	class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background pt-32 pb-20 text-center md:pt-40"
>
	<!-- Grain Texture Overlay -->
	<div
		class="pointer-events-none absolute inset-0 z-50 opacity-[0.04] mix-blend-overlay contrast-150 grayscale"
		style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
	></div>

	<!-- Background Decorative Elements -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		<div class="origami-shard absolute -top-24 -left-24 size-[500px] bg-primary/5 dark:bg-primary/10" style="clip-path: polygon(0 0, 100% 0, 80% 100%, 0 80%);"></div>
		<div class="origami-shard absolute -bottom-48 -right-48 size-[600px] bg-foreground/5" style="clip-path: polygon(20% 0, 100% 20%, 100% 100%, 0 100%);"></div>
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-full bg-[radial-gradient(circle_at_center,var(--primary-foreground)_0%,transparent_70%)] opacity-20 dark:opacity-5"></div>
	</div>

	<div class="container relative z-10 mx-auto px-6">
		
		<!-- Technical Metadata Header -->
		<div class="hero-stagger mb-12 flex flex-wrap items-center justify-center gap-6 border-b-2 border-foreground/10 pb-8">
			<div class="flex items-center gap-2 font-mono text-[10px] font-black text-primary uppercase tracking-[0.2em]">
				<Terminal class="size-3" /> CORE_IDENTIFIER: MIKEU_DEV_V5
			</div>
			<div class="flex items-center gap-2 font-mono text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">
				<Cpu class="size-3" /> ARCH_TYPE: FULLSTACK_ARCHIVE
			</div>
			<div class="flex items-center gap-2 font-mono text-[10px] font-black text-primary uppercase tracking-[0.2em]">
				<Activity class="size-3 animate-pulse" /> SYSTEM_STATUS: STABLE
			</div>
		</div>

		<!-- Title Container (Matter.js Target) -->
		<div class="relative mx-auto mb-12 inline-block" style="height: 180px;">
			<h1
				bind:this={heroTitle}
				class="flex flex-wrap justify-center font-mono text-5xl font-black leading-none tracking-tighter text-foreground drop-shadow-2xl uppercase sm:text-7xl md:text-8xl lg:text-9xl"
			>
				{#each titleChars as char, i (i)}
					<span bind:this={letterElements[i]} class="inline-block" style="white-space: pre;">
						{char}
					</span>
				{/each}
			</h1>
		</div>

		<!-- Subtitle & Content -->
		<div class="hero-stagger mt-8">
			<p
				bind:this={heroSubtitle}
				class="mx-auto max-w-3xl font-mono text-sm leading-relaxed text-muted-foreground uppercase tracking-widest sm:text-base md:text-lg"
			>
				// {m.hero_subtitle()} //
			</p>

			<!-- Industrial Skills List -->
			<div bind:this={bulletContainer} class="mt-12 flex flex-wrap justify-center gap-4">
				{#each skills as skill (skill)}
					<div class="group flex items-center gap-3 border-2 border-foreground/10 bg-foreground/[0.02] px-6 py-3 transition-all hover:border-primary hover:bg-primary/5">
						<Hash class="size-3 text-primary transition-transform group-hover:rotate-12" />
						<span class="font-mono text-[11px] font-black uppercase tracking-wider text-foreground">
							{skill}
						</span>
					</div>
				{/each}
			</div>

			<!-- Sharp Buttons -->
			<div bind:this={heroButton} class="mt-16 flex flex-wrap justify-center gap-6">
				<a
					href="#contact"
					class="group relative inline-flex h-16 items-center justify-center overflow-hidden bg-primary px-10 text-primary-foreground transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:bg-foreground hover:text-background hover:shadow-[6px_6px_0_var(--foreground)]"
					style="clip-path: polygon(0 15%, 100% 0, 95% 100%, 5% 85%);"
				>
					<div class="flex items-center gap-3">
						<span class="font-poppins text-lg font-black tracking-tighter uppercase">
							{m.hero_button_text()}
						</span>
						<ArrowRight class="size-5 transition-transform group-hover:translate-x-1" />
					</div>
				</a>

				<a
					href="#work"
					class="group relative inline-flex h-16 items-center justify-center overflow-hidden border-2 border-foreground px-10 text-foreground transition-all hover:bg-foreground hover:text-background"
					style="clip-path: polygon(5% 0, 95% 15%, 100% 85%, 0 100%);"
				>
					<span class="font-poppins text-lg font-black tracking-tighter uppercase">
						{m.hero_button_link()}
					</span>
				</a>
			</div>
		</div>

		<!-- Technical Footer ID -->
		<div class="hero-stagger mt-24 flex items-center justify-center gap-8 font-mono text-[8px] font-black tracking-[0.4em] text-foreground/20 uppercase">
			<p>UID: 0x7F4B21_MIKEU</p>
			<p>SECTOR: ALPHA_PRIMARY</p>
			<p>LOAD_TIME: 242ms</p>
		</div>
	</div>
</section>

<style lang="postcss">
	@reference "tailwindcss";

	#hero {
		perspective: 1500px;
	}

	.hero-stagger {
		transform: translateZ(50px);
	}

	.origami-shard {
		pointer-events: none;
	}

	/* Title characters need clean baseline for physics */
	span {
		user-select: none;
	}
</style>

