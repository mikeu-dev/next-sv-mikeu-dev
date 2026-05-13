<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { SvelteSet, SvelteMap } from 'svelte/reactivity';
	import { browser } from '$app/environment';
	import { gsap } from 'gsap';
	import { m } from '$lib/paraglide/messages';
	import { Terminal, Cpu, Activity, Hash, ArrowRight } from '@lucide/svelte';
	import BrutalistGlyph from '@/lib/components/ui/BrutalistGlyph.svelte';
	import type Matter from 'matter-js';
	import type { IChamferableBodyDefinition } from 'matter-js';

	let { skills }: { skills: string[] } = $props();

	let heroTitle = $state<HTMLElement>();
	let heroSubtitle = $state<HTMLElement>();
	let heroButton = $state<HTMLElement>();
	let bulletContainer = $state<HTMLElement>();
	let impactLayer = $state<HTMLElement>();
	let crackLayer = $state<SVGSVGElement>();
	let heroSection = $state<HTMLElement>();
	let letterElements = $state<HTMLElement[]>([]);

	const titleText = $state<string>(m.hero_title().replace(/\s/g, ''));
	const titleChars: string[] = titleText.split('');

	interface LetterData {
		body: Matter.Body;
		element: HTMLElement;
		initialX: number;
		initialY: number;
	}

	// Physics references for cleanup
	let engine: Matter.Engine;
	let runner: Matter.Runner;
	let rafId: number;
	let observer: IntersectionObserver;
	let ctx: gsap.Context;

	// â”€â”€ Impact FX Utilities â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

	/** Track which bodies already triggered their impact (one-shot per letter) */
	const impactedBodies = new SvelteSet<number>();

	/** Spawn geometric dust particles at impact point */
	function spawnDustParticles(
		x: number,
		y: number,
		velocity: number,
		container: HTMLElement
	): void {
		const count = Math.min(Math.floor(velocity * 1.5) + 3, 12);
		const shapes = ['â–ª', 'â—†', 'â–«', 'â—‡', 'â–¸', 'â–¹'];

		for (let i = 0; i < count; i++) {
			const particle = document.createElement('span');
			particle.className = 'impact-particle';
			particle.textContent = shapes[Math.floor(Math.random() * shapes.length)];
			particle.style.left = `${x}px`;
			particle.style.top = `${y}px`;
			particle.style.fontSize = `${6 + Math.random() * 8}px`;
			container.appendChild(particle);

			const angle = -Math.PI * (0.1 + Math.random() * 0.8); // mostly upward spread
			const force = (30 + Math.random() * 60) * Math.min(velocity / 6, 1.5);

			gsap.fromTo(
				particle,
				{ opacity: 1, scale: 1 },
				{
					x: Math.cos(angle) * force,
					y: Math.sin(angle) * force,
					opacity: 0,
					scale: 0.2,
					rotation: (Math.random() - 0.5) * 360,
					duration: 0.4 + Math.random() * 0.4,
					ease: 'power3.out',
					onComplete: () => particle.remove()
				}
			);
		}
	}

	/** Micro screen-shake on the title container, intensity âˆ velocity */
	function triggerScreenShake(container: HTMLElement, velocity: number): void {
		const intensity = Math.min(velocity * 0.4, 4);
		gsap.to(container, {
			x: `+=${(Math.random() - 0.5) * intensity}`,
			y: `+=${Math.random() * intensity * 0.5}`,
			duration: 0.06,
			ease: 'power2.out',
			yoyo: true,
			repeat: 3,
			onComplete: () => {
				gsap.set(container, { x: 0, y: 0 });
			}
		});
	}

	/** Brief flash / scale pulse on the letter element */
	function triggerImpactFlash(element: HTMLElement, velocity: number): void {
		const pulseScale = 1 + Math.min(velocity * 0.02, 0.15);
		gsap.fromTo(
			element,
			{ filter: 'brightness(2.5)', scale: pulseScale },
			{
				filter: 'brightness(1)',
				scale: 1,
				duration: 0.3,
				ease: 'power2.out'
			}
		);
	}

	/** Create a random geometric shard (triangle or quad) */
	function createOrigamiShard(
		x: number,
		y: number,
		velocity: number,
		container: HTMLElement
	): void {
		const shard = document.createElement('div');
		const size = 8 + Math.random() * 12;
		const color = Math.random() > 0.5 ? 'var(--primary)' : 'var(--foreground)';

		shard.className = 'origami-impact-shard';
		shard.style.width = `${size}px`;
		shard.style.height = `${size}px`;
		shard.style.left = `${x}px`;
		shard.style.top = `${y}px`;
		shard.style.backgroundColor = color;

		// Random polygonal shape via clip-path
		const p1 = `${Math.random() * 100}% ${Math.random() * 100}%`;
		const p2 = `${Math.random() * 100}% ${Math.random() * 100}%`;
		const p3 = `${Math.random() * 100}% ${Math.random() * 100}%`;
		shard.style.clipPath = `polygon(${p1}, ${p2}, ${p3})`;

		container.appendChild(shard);

		const angle = -Math.PI * (0.2 + Math.random() * 0.6);
		const force = (40 + Math.random() * 80) * Math.min(velocity / 5, 2);

		gsap.to(shard, {
			x: Math.cos(angle) * force,
			y: Math.sin(angle) * force,
			rotation: (Math.random() - 0.5) * 720,
			opacity: 0,
			scale: 0.2,
			duration: 0.6 + Math.random() * 0.4,
			ease: 'power2.out',
			onComplete: () => shard.remove()
		});
	}

	/** Draw a sharp geometric "crease" line */
	function drawOrigamiCrease(
		ns: string,
		group: SVGGElement,
		x: number,
		y: number,
		angle: number,
		length: number,
		delay: number
	): void {
		const line = document.createElementNS(ns, 'line') as SVGLineElement;
		const ex = x + Math.cos(angle) * length;
		const ey = y + Math.sin(angle) * length;

		line.setAttribute('x1', `${x}`);
		line.setAttribute('y1', `${y}`);
		line.setAttribute('x2', `${ex}`);
		line.setAttribute('y2', `${ey}`);
		line.setAttribute('stroke', 'var(--primary)');
		line.setAttribute('stroke-width', '1.5');
		line.setAttribute('stroke-linecap', 'square');
		line.setAttribute('opacity', '0');

		group.appendChild(line);

		const len = Math.sqrt(Math.pow(ex - x, 2) + Math.pow(ey - y, 2));
		line.style.strokeDasharray = `${len}`;
		line.style.strokeDashoffset = `${len}`;

		gsap.to(line, {
			opacity: 0.8,
			strokeDashoffset: 0,
			duration: 0.15,
			delay: delay,
			ease: 'expo.out'
		});

		gsap.to(line, {
			opacity: 0,
			duration: 1,
			delay: delay + 0.8,
			ease: 'power2.in'
		});
	}

	/** Draw "Origami Shatter" impact effects */
	function drawFloorCrack(svg: SVGSVGElement, x: number, y: number, velocity: number): void {
		const ns = 'http://www.w3.org/2000/svg';
		const group = document.createElementNS(ns, 'g') as SVGGElement;
		const intensity = Math.min(velocity / 5, 2.0);

		// 1. Sharp Crease Lines (Diagonal & Bold)
		const creaseCount = 3 + Math.floor(Math.random() * 2);
		for (let i = 0; i < creaseCount; i++) {
			const angle = i * (Math.PI / creaseCount) - Math.PI * 0.8;
			const len = (30 + Math.random() * 40) * intensity;
			drawOrigamiCrease(ns, group, x, y, angle, len, i * 0.03);
		}

		// 2. Polygonal Shards (Instead of Dust)
		const shardCount = 5 + Math.floor(intensity * 4);
		const container = svg.parentElement;
		if (container) {
			for (let i = 0; i < shardCount; i++) {
				createOrigamiShard(x, y, velocity, container);
			}
		}

		// 3. Central Geometric "Impact Facet" (Briefly appearing polygon)
		const facet = document.createElementNS(ns, 'polygon') as SVGPolygonElement;
		const fSize = 15 * intensity;
		const pts = [
			`${x},${y}`,
			`${x + fSize},${y - fSize / 2}`,
			`${x + fSize / 2},${y + fSize / 2}`,
			`${x - fSize / 2},${y + fSize}`
		].join(' ');

		facet.setAttribute('points', pts);
		facet.setAttribute('fill', 'var(--primary)');
		facet.setAttribute('fill-opacity', '0.2');
		facet.setAttribute('stroke', 'var(--primary)');
		facet.setAttribute('stroke-width', '0.5');
		facet.setAttribute('opacity', '0');

		group.appendChild(facet);

		gsap.fromTo(
			facet,
			{ scale: 0, opacity: 0.6 },
			{ scale: 1.5, opacity: 0, duration: 0.4, ease: 'power4.out' }
		);

		svg.appendChild(group);
		gsap.delayedCall(2.0, () => group.remove());
	}

	// â”€â”€ Mount â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

	onMount(async () => {
		if (!browser || !heroTitle || !heroSubtitle || !heroButton || !bulletContainer || !heroSection)
			return;

		let isVisible = false;

		// Dynamic import Matter.js to avoid SSR issues
		const MatterModule = await import('matter-js');
		const Matter = MatterModule.default || MatterModule;
		const { Engine, Runner, Bodies, Composite, Events } = Matter;

		const subtitle = heroSubtitle;
		const button = heroButton;
		const bullets = bulletContainer;

		ctx = gsap.context(() => {
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

			// Ambient Floating Shards (Drift)
			gsap.to('.ambient-shard', {
				y: 'random(-40, 40)',
				x: 'random(-40, 40)',
				rotation: 'random(-180, 180)',
				duration: 'random(10, 20)',
				repeat: -1,
				yoyo: true,
				ease: 'none'
			});

			const section = heroSection;
			if (!section) return;

			// Mouse Spotlight Tracker
			const xSetter = gsap.quickSetter(section, '--mouse-x', 'px');
			const ySetter = gsap.quickSetter(section, '--mouse-y', 'px');

			let ticking = false;
			const handleMouseMove = (e: MouseEvent) => {
				if (!ticking) {
					requestAnimationFrame(() => {
						const rect = section.getBoundingClientRect();
						const x = Math.round(e.clientX - rect.left);
						const y = Math.round(e.clientY - rect.top);

						xSetter(x);
						ySetter(y);

						// Update coordinates via CSS variables
						section.style.setProperty('--coord-x', x.toString());
						section.style.setProperty('--coord-y', y.toString());
						ticking = false;
					});
					ticking = true;
				}
			};

			const handleTouchMove = (e: TouchEvent) => {
				if (e.touches[0]) {
					const touch = e.touches[0];
					if (!ticking) {
						requestAnimationFrame(() => {
							const rect = section.getBoundingClientRect();
							const x = Math.round(touch.clientX - rect.left);
							const y = Math.round(touch.clientY - rect.top);

							xSetter(x);
							ySetter(y);

							section.style.setProperty('--coord-x', x.toString());
							section.style.setProperty('--coord-y', y.toString());
							ticking = false;
						});
						ticking = true;
					}
				}
			};

			section.addEventListener('mousemove', handleMouseMove);
			section.addEventListener('touchmove', handleTouchMove, { passive: true });
			section.addEventListener('touchstart', handleTouchMove, { passive: true });
		});

		// --- Matter.js Logic (OPTIMIZED) ---
		// Check for reduced motion preference
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) {
			console.log('Reduced motion enabled: Skipping physics engine.');
			isVisible = false; // Prevents RAF update
			return;
		}

		engine = Engine.create({
			enableSleeping: true // Stop calculating for settled bodies
		});
		const world: Matter.World = engine.world;
		engine.gravity.y = 1.0;

		const titleRect: DOMRect = heroTitle.getBoundingClientRect();
		const wallOptions: IChamferableBodyDefinition = { isStatic: true, render: { visible: false } };

		const floorY = 160;
		const floor = Bodies.rectangle(
			titleRect.width / 2,
			floorY,
			titleRect.width * 2,
			20,
			wallOptions
		);
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
						chamfer: { radius: 2 },
						sleepThreshold: 30 // Make bodies sleep faster
					}
				);
				return { body, element: el, initialX, initialY };
			})
			.filter((v): v is LetterData => v !== null);

		// Map body IDs â†’ LetterData for collision lookup
		const bodyToLetter = new SvelteMap<number, LetterData>();
		letters.forEach((letter) => {
			bodyToLetter.set(letter.body.id, letter);
		});

		letters.forEach((letter, i) => {
			setTimeout(() => {
				if (world) Composite.add(world, letter.body);
			}, i * 30); // Lebih instan, tanpa delay 1000ms
		});

		// â”€â”€ Collision Impact Handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
		Events.on(engine, 'collisionStart', (event: Matter.IEventCollision<Matter.Engine>) => {
			for (const pair of event.pairs) {
				const { bodyA, bodyB } = pair;

				// Determine which is the letter body (non-static) hitting the floor (static)
				let letterBody: Matter.Body | null = null;
				if (bodyA.isStatic && !bodyB.isStatic) letterBody = bodyB;
				else if (bodyB.isStatic && !bodyA.isStatic) letterBody = bodyA;
				if (!letterBody) continue;

				// One-shot: only trigger once per letter
				if (impactedBodies.has(letterBody.id)) continue;
				impactedBodies.add(letterBody.id);

				const letterData = bodyToLetter.get(letterBody.id);
				if (!letterData) continue;

				// Impact velocity magnitude
				const vx = letterBody.velocity.x;
				const vy = letterBody.velocity.y;
				const velocity = Math.sqrt(vx * vx + vy * vy);

				// Skip very gentle collisions
				if (velocity < 1.5) continue;

				const impactX = letterBody.position.x;
				const impactY = floorY;

				// Layer 1: Dust particles
				if (impactLayer) {
					spawnDustParticles(impactX, impactY, velocity, impactLayer);
				}

				// Layer 2: Screen shake (only for higher-velocity impacts)
				if (velocity > 3 && heroTitle) {
					const titleContainer = heroTitle.closest('.relative') as HTMLElement | null;
					if (titleContainer) {
						triggerScreenShake(titleContainer, velocity);
					}
				}

				// Layer 3: Impact flash on the letter element
				triggerImpactFlash(letterData.element, velocity);

				// Layer 4: Floor crack SVG
				if (crackLayer && velocity > 2.5) {
					drawFloorCrack(crackLayer, impactX, impactY, velocity);
				}
			}
		});

		runner = Runner.create();

		observer = new IntersectionObserver((entries) => {
			const nowVisible = entries[0].isIntersecting;
			if (nowVisible && !isVisible) {
				// Resuming
				isVisible = true;
				Runner.run(runner, engine);
				rafId = requestAnimationFrame(update);
			} else if (!nowVisible && isVisible) {
				// Pausing
				isVisible = false;
				Runner.stop(runner);
				if (rafId) cancelAnimationFrame(rafId);
			}
		});

		if (heroSection) observer.observe(heroSection);

		function update() {
			if (isVisible) {
				for (const { body, element, initialX, initialY } of letters) {
					if (!body.isSleeping) {
						const { x, y } = body.position;
						element.style.transform = `translate(${x - initialX}px, ${y - initialY}px) rotate(${body.angle}rad)`;
					}
				}
				rafId = requestAnimationFrame(update);
			}
		}
		heroTitle.style.position = 'relative';
		heroTitle.style.overflow = 'visible';
	});

	onDestroy(() => {
		if (ctx) ctx.revert();
		if (observer) observer.disconnect();
		if (runner) {
			import('matter-js').then((Matter) => {
				const M = Matter.default || Matter;
				M.Runner.stop(runner);
				M.Engine.clear(engine);
			});
		}
		if (rafId) cancelAnimationFrame(rafId);
	});
</script>

<section
	id="hero"
	bind:this={heroSection}
	class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background pt-20 pb-10 text-center md:pt-24"
	style="--mouse-x: 50%; --mouse-y: 50%;"
>
	<!-- Grain Texture Overlay -->
	<div
		class="pointer-events-none absolute inset-0 z-50 opacity-[0.04] mix-blend-overlay contrast-150 grayscale"
		style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
	></div>

	<!-- Background Decorative Elements -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		<!-- Blueprint Grid -->
		<div class="blueprint-grid absolute inset-0"></div>

		<!-- Interactive Spotlight Overlay -->
		<div class="mouse-spotlight absolute inset-0"></div>

		<!-- Scanning Beam -->
		<div class="scanning-beam absolute left-0 w-full opacity-20"></div>

		<!-- Ambient Shards (Floating) - Reduced for mobile -->
		{#each Array(browser && window.innerWidth < 768 ? 3 : 6) as _, _i (_i)}
			<div
				class="ambient-shard absolute size-16 bg-primary/5 dark:bg-primary/10"
				style="
                    top: {Math.random() * 100}%; 
                    left: {Math.random() * 100}%; 
                    clip-path: polygon({Math.random() * 100}% 0%, 100% {Math.random() *
					100}%, {Math.random() * 100}% 100%, 0% {Math.random() * 100}%);
                    filter: blur({2 + Math.random() * 4}px);
                "
			></div>
		{/each}

		<div
			class="origami-shard absolute -top-24 -left-24 size-[500px] bg-primary/5 dark:bg-primary/10"
			style="clip-path: polygon(0 0, 100% 0, 80% 100%, 0 80%);"
		></div>
		<div
			class="origami-shard absolute -right-48 -bottom-48 size-[600px] bg-foreground/5"
			style="clip-path: polygon(20% 0, 100% 20%, 100% 100%, 0 100%);"
		></div>
	</div>

	<!-- Technical HUD Corners -->
	<div class="pointer-events-none absolute inset-0 z-20 overflow-hidden p-8">
		<div class="absolute top-8 left-8 size-16 border-t-2 border-l-2 border-primary/20"></div>
		<div class="absolute top-8 right-8 size-16 border-t-2 border-r-2 border-primary/20"></div>
		<div class="absolute bottom-8 left-8 size-16 border-b-2 border-l-2 border-primary/20"></div>
		<div class="absolute right-8 bottom-8 size-16 border-r-2 border-b-2 border-primary/20"></div>

		<!-- Coordinates Display -->
		<div
			class="coord-display absolute right-12 bottom-12 font-mono text-[8px] font-black tracking-widest text-primary/40"
		>
			REL_COORDS: [X_<span class="x-val"></span> : Y_<span class="y-val"></span>]
		</div>
	</div>

	<div class="relative z-10 container mx-auto px-6">
		<!-- Technical Metadata Header -->
		<div
			class="hero-stagger mb-6 flex flex-wrap items-center justify-center gap-6 border-b-2 border-foreground/10 pb-6"
		>
			<div
				class="flex items-center gap-2 font-mono text-[10px] font-black tracking-[0.2em] text-primary uppercase"
			>
				<Terminal class="size-3" /> CORE_IDENTIFIER: MIKEU_DEV_V5
			</div>
			<div
				class="hidden items-center gap-2 font-mono text-[10px] font-black tracking-[0.2em] text-foreground/40 uppercase md:flex"
			>
				<Hash class="size-3" /> ORIGIN_ID: RIKI_RUSWANDI
			</div>
			<div
				class="flex items-center gap-2 font-mono text-[10px] font-black tracking-[0.2em] text-foreground/40 uppercase"
			>
				<Cpu class="size-3" /> ARCH_TYPE: FULLSTACK_ARCHIVE
			</div>
			<div
				class="flex items-center gap-2 font-mono text-[10px] font-black tracking-[0.2em] text-primary uppercase"
			>
				<Activity class="size-3 animate-pulse" /> SYSTEM_STATUS: STABLE
			</div>
		</div>

		<!-- Title Container (Matter.js Target) -->
		<div class="relative mx-auto mb-6 inline-block" style="height: 160px;">
			<h1
				bind:this={heroTitle}
				class="flex flex-wrap justify-center text-foreground drop-shadow-2xl"
				aria-label="Mikeu Dev"
			>
				{#each titleChars as char, i (i)}
					<span
						bind:this={letterElements[i]}
						class="-mx-0.5 inline-block h-12 w-8 sm:-mx-1 sm:h-20 sm:w-14 md:-mx-1.5 md:h-28 md:w-18 lg:-mx-2 lg:h-36 lg:w-24"
					>
						<BrutalistGlyph {char} />
					</span>
				{/each}
			</h1>

			<!-- Impact FX Layers (positioned relative to title container) -->
			<div
				bind:this={impactLayer}
				class="pointer-events-none absolute inset-0 overflow-visible"
				aria-hidden="true"
			></div>
			<svg
				bind:this={crackLayer}
				class="pointer-events-none absolute inset-0 overflow-visible"
				aria-hidden="true"
				style="width: 100%; height: 100%;"
			></svg>
		</div>

		<!-- Subtitle & Content -->
		<div class="hero-stagger mt-8">
			<p
				bind:this={heroSubtitle}
				class="mx-auto max-w-2xl font-mono text-xs leading-relaxed tracking-widest text-muted-foreground uppercase sm:text-sm md:text-base"
			>
				// {m.hero_subtitle()} //
			</p>

			<!-- Industrial Skills List -->
			<div bind:this={bulletContainer} class="mt-6 flex flex-wrap justify-center gap-3">
				{#each skills as skill (skill)}
					<div
						class="group flex items-center gap-2 border-2 border-foreground/10 bg-foreground/2 px-4 py-2 transition-all hover:border-primary hover:bg-primary/5"
					>
						<Hash class="size-3 text-primary transition-transform group-hover:rotate-12" />
						<span class="font-mono text-[10px] font-black tracking-wider text-foreground uppercase">
							{skill}
						</span>
					</div>
				{/each}
			</div>

			<!-- Sharp Buttons -->
			<div bind:this={heroButton} class="mt-10 flex flex-wrap justify-center gap-6">
				<a
					href="#contact"
					class="group relative inline-flex h-16 items-center justify-center bg-primary px-10 text-primary-foreground transition-all duration-300 hover:-translate-x-2 hover:-translate-y-2 hover:shadow-[10px_10px_0_var(--foreground)]"
					style="clip-path: polygon(0 15%, 100% 0, 95% 100%, 5% 85%);"
				>
					<!-- Origami Shard -->
					<div
						class="absolute inset-0 translate-x-[-110%] bg-foreground transition-transform duration-500 ease-out group-hover:translate-x-0"
						style="clip-path: polygon(0 0, 100% 0, 70% 100%, 0% 100%);"
					></div>

					<div
						class="relative z-10 flex items-center gap-3 transition-colors group-hover:text-background"
					>
						<span class="font-poppins text-lg font-black tracking-tighter uppercase">
							{m.hero_button_text()}
						</span>
						<ArrowRight class="size-5 transition-transform group-hover:translate-x-1" />
					</div>
				</a>

				<a
					href="#work"
					class="group relative inline-flex h-16 items-center justify-center border-2 border-foreground bg-background px-10 text-foreground transition-all duration-300 hover:-translate-x-2 hover:-translate-y-2 hover:shadow-[10px_10px_0_var(--primary)]"
					style="clip-path: polygon(5% 0, 95% 15%, 100% 85%, 0 100%);"
				>
					<!-- Origami Shard -->
					<div
						class="absolute inset-0 translate-y-[110%] bg-foreground transition-transform duration-500 ease-out group-hover:translate-y-0"
						style="clip-path: polygon(0 20%, 100% 0, 100% 100%, 20% 100%);"
					></div>

					<span
						class="relative z-10 font-poppins text-lg font-black tracking-tighter uppercase transition-colors group-hover:text-background"
					>
						{m.hero_button_link()}
					</span>
				</a>
			</div>
		</div>

		<!-- Technical Footer ID -->
		<div
			class="hero-stagger mt-12 flex items-center justify-center gap-8 font-mono text-[8px] font-black tracking-[0.4em] text-foreground/20 uppercase"
		>
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
		will-change: transform;
	}

	/* â”€â”€ Origami Impact Shard Styling â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
	:global(.origami-impact-shard) {
		position: absolute;
		pointer-events: none;
		z-index: 20;
		filter: drop-shadow(0 0 2px var(--primary-foreground));
		will-change: transform, opacity;
	}

	/* â”€â”€ Background Aesthetics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
	.blueprint-grid {
		background-image: radial-gradient(var(--foreground) 0.5px, transparent 0.5px);
		background-size: 40px 40px;
		opacity: 0.08;
		mask-image: radial-gradient(
			circle 500px at var(--mouse-x) var(--mouse-y),
			black 0%,
			transparent 100%
		);
	}

	.mouse-spotlight {
		background: radial-gradient(
			circle 600px at var(--mouse-x) var(--mouse-y),
			rgba(var(--primary-rgb), 0.12),
			transparent 70%
		);
		mix-blend-mode: plus-lighter;
	}

	.scanning-beam {
		height: 1px;
		background: linear-gradient(
			to right,
			transparent,
			var(--primary) 20%,
			var(--primary) 80%,
			transparent
		);
		box-shadow: 0 0 15px var(--primary);
		animation: scan 8s linear infinite;
	}

	@keyframes scan {
		0% {
			top: -10%;
		}
		100% {
			top: 110%;
		}
	}

	.ambient-shard {
		pointer-events: none;
		will-change: transform, opacity;
	}

	/* â”€â”€ Coordinate HUD with CSS Counters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
	.coord-display {
		counter-reset: x var(--coord-x) y var(--coord-y);
	}

	.x-val::after {
		content: counter(x);
	}

	.y-val::after {
		content: counter(y);
	}
</style>
