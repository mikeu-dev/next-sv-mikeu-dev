<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { SvelteSet, SvelteMap } from 'svelte/reactivity';
	import { browser } from '$app/environment';
	import { gsap } from 'gsap';
	import { m } from '$lib/paraglide/messages';
	import BrutalistGlyph from '@/lib/components/ui/BrutalistGlyph.svelte';
	import type Matter from 'matter-js';
	import type { IChamferableBodyDefinition } from 'matter-js';

	let { skills }: { skills: string[] } = $props();
	const finalSkills = ['SvelteKit', 'TypeScript', 'Go', 'PostgreSQL', 'Docker', 'GIS'];

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

	// ── Impact FX Utilities ──────────────────────────────────────

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
		const shapes = ['▪', '◆', '▫', '◇', '▸', '▹'];

		for (let i = 0; i < count; i++) {
			const particle = document.createElement('span');
			particle.className = 'impact-particle';
			particle.textContent = shapes[Math.floor(Math.random() * shapes.length)];
			particle.style.left = `${x}px`;
			particle.style.top = `${y}px`;
			particle.style.fontSize = `${6 + Math.random() * 8}px`;
			container.appendChild(particle);

			const angle = -Math.PI * (0.1 + Math.random() * 0.8);
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

	/** Micro screen-shake on the title container */
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

	/** Create a random geometric shard */
	function createOrigamiShard(
		x: number,
		y: number,
		velocity: number,
		container: HTMLElement
	): void {
		const shard = document.createElement('div');
		const size = 8 + Math.random() * 12;
		const color = Math.random() > 0.5 ? 'rgba(255,255,255,0.6)' : 'rgba(200,200,200,0.4)';

		shard.className = 'origami-impact-shard';
		shard.style.width = `${size}px`;
		shard.style.height = `${size}px`;
		shard.style.left = `${x}px`;
		shard.style.top = `${y}px`;
		shard.style.backgroundColor = color;

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
		line.setAttribute('stroke', 'rgba(255,255,255,0.4)');
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

		const creaseCount = 3 + Math.floor(Math.random() * 2);
		for (let i = 0; i < creaseCount; i++) {
			const angle = i * (Math.PI / creaseCount) - Math.PI * 0.8;
			const len = (30 + Math.random() * 40) * intensity;
			drawOrigamiCrease(ns, group, x, y, angle, len, i * 0.03);
		}

		const shardCount = 5 + Math.floor(intensity * 4);
		const container = svg.parentElement;
		if (container) {
			for (let i = 0; i < shardCount; i++) {
				createOrigamiShard(x, y, velocity, container);
			}
		}

		const facet = document.createElementNS(ns, 'polygon') as SVGPolygonElement;
		const fSize = 15 * intensity;
		const pts = [
			`${x},${y}`,
			`${x + fSize},${y - fSize / 2}`,
			`${x + fSize / 2},${y + fSize / 2}`,
			`${x - fSize / 2},${y + fSize}`
		].join(' ');

		facet.setAttribute('points', pts);
		facet.setAttribute('fill', 'rgba(255,255,255,0.12)');
		facet.setAttribute('fill-opacity', '0.2');
		facet.setAttribute('stroke', 'rgba(255,255,255,0.25)');
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

	// ── Mount ────────────────────────────────────────────────────

	onMount(async () => {
		if (!browser || !heroTitle || !heroSubtitle || !heroButton || !bulletContainer || !heroSection)
			return;

		let isVisible = false;

		const MatterModule = await import('matter-js');
		const Matter = MatterModule.default || MatterModule;
		const { Engine, Runner, Bodies, Composite, Events } = Matter;

		const subtitle = heroSubtitle;
		const button = heroButton;
		const bullets = bulletContainer;

		ctx = gsap.context(() => {
			if (!subtitle || !button || !bullets) return;

			// Stagger-in animations
			gsap.from('.hero-stagger', {
				y: 30,
				opacity: 0,
				duration: 0.8,
				stagger: 0.1,
				ease: 'expo.out',
				delay: 1.2
			});

			// Blueprint annotations fade-in
			gsap.from('.blueprint-annotation', {
				opacity: 0,
				duration: 1.5,
				stagger: 0.15,
				ease: 'power2.out',
				delay: 0.8
			});

			// Dimension lines draw-in
			gsap.from('.dim-line', {
				scaleX: 0,
				scaleY: 0,
				opacity: 0,
				duration: 1.0,
				stagger: 0.1,
				ease: 'power3.out',
				delay: 1.0
			});

			// SVG Technical Lines drawing animation
			gsap.from('.technical-path', {
				strokeDashoffset: 1000,
				opacity: 0,
				duration: 2.2,
				ease: 'power2.out',
				delay: 0.5
			});

			// Ambient Floating Animations for Background Blueprint SVGs
			gsap.to('.blueprint-svg-right', {
				y: '+=12',
				rotation: '+=1.5',
				duration: 6,
				ease: 'sine.inOut',
				yoyo: true,
				repeat: -1
			});

			gsap.to('.blueprint-svg-left', {
				y: '-=10',
				rotation: '-=1.2',
				duration: 7,
				ease: 'sine.inOut',
				yoyo: true,
				repeat: -1
			});

			// Subtle pulsing for blueprint technical details/annotations
			gsap.to('.blueprint-annotation', {
				opacity: 0.65,
				duration: 3,
				stagger: 0.15,
				ease: 'sine.inOut',
				yoyo: true,
				repeat: -1
			});

			const section = heroSection;
			if (!section) return;

			// Mouse Spotlight Tracker & Parallax Setters
			const xSetter = gsap.quickSetter(section, '--mouse-x', 'px');
			const ySetter = gsap.quickSetter(section, '--mouse-y', 'px');
			const svgRightX = gsap.quickSetter('.blueprint-svg-right', 'x', 'px');
			const svgRightY = gsap.quickSetter('.blueprint-svg-right', 'y', 'px');
			const svgLeftX = gsap.quickSetter('.blueprint-svg-left', 'x', 'px');
			const svgLeftY = gsap.quickSetter('.blueprint-svg-left', 'y', 'px');

			let ticking = false;
			const handleMouseMove = (e: MouseEvent) => {
				if (!ticking) {
					requestAnimationFrame(() => {
						const rect = section.getBoundingClientRect();
						const x = Math.round(e.clientX - rect.left);
						const y = Math.round(e.clientY - rect.top);
						xSetter(x);
						ySetter(y);

						// Parallax shift based on mouse relative position (range ±25px)
						const relX = x / rect.width - 0.5;
						const relY = y / rect.height - 0.5;
						svgRightX(relX * -25);
						svgRightY(relY * -25);
						svgLeftX(relX * 20);
						svgLeftY(relY * 20);

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

							// Parallax shift for touch
							const relX = x / rect.width - 0.5;
							const relY = y / rect.height - 0.5;
							svgRightX(relX * -25);
							svgRightY(relY * -25);
							svgLeftX(relX * 20);
							svgLeftY(relY * 20);

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

		// --- Matter.js Logic ---
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) {
			isVisible = false;
			return;
		}

		engine = Engine.create({
			enableSleeping: false
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
			titleRect.height * 2,
			wallOptions
		);
		const wallRight = Bodies.rectangle(
			titleRect.width + 100,
			titleRect.height / 2,
			20,
			titleRect.height * 2,
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
						restitution: 0.55,
						friction: 0.1,
						frictionAir: 0.015,
						chamfer: { radius: 2 },
						inertia: Infinity, // Kunci rotasi agar huruf selalu tegak lurus
						collisionFilter: {
							group: -1 // Nonaktifkan tabrakan antar sesama huruf
						}
					}
				);
				return { body, element: el, initialX, initialY };
			})
			.filter((v): v is LetterData => v !== null);

		const bodyToLetter = new SvelteMap<number, LetterData>();
		letters.forEach((letter) => {
			bodyToLetter.set(letter.body.id, letter);
		});

		letters.forEach((letter, i) => {
			setTimeout(() => {
				if (world) Composite.add(world, letter.body);
			}, i * 30);
		});

		// ── Collision Impact Handler ──────────────────────────────
		Events.on(engine, 'collisionStart', (event: Matter.IEventCollision<Matter.Engine>) => {
			for (const pair of event.pairs) {
				const { bodyA, bodyB } = pair;

				let letterBody: Matter.Body | null = null;
				if (bodyA.isStatic && !bodyB.isStatic) letterBody = bodyB;
				else if (bodyB.isStatic && !bodyA.isStatic) letterBody = bodyA;
				if (!letterBody) continue;

				if (impactedBodies.has(letterBody.id)) continue;
				impactedBodies.add(letterBody.id);

				const letterData = bodyToLetter.get(letterBody.id);
				if (!letterData) continue;

				const vx = letterBody.velocity.x;
				const vy = letterBody.velocity.y;
				const velocity = Math.sqrt(vx * vx + vy * vy);

				if (velocity < 1.5) continue;

				const impactX = letterBody.position.x;
				const impactY = floorY;

				if (impactLayer) {
					spawnDustParticles(impactX, impactY, velocity, impactLayer);
				}

				if (velocity > 3 && heroTitle) {
					const titleContainer = heroTitle.closest('.relative') as HTMLElement | null;
					if (titleContainer) {
						triggerScreenShake(titleContainer, velocity);
					}
				}

				triggerImpactFlash(letterData.element, velocity);

				if (crackLayer && velocity > 2.5) {
					drawFloorCrack(crackLayer, impactX, impactY, velocity);
				}
			}
		});

		runner = Runner.create();

		observer = new IntersectionObserver((entries) => {
			const nowVisible = entries[0].isIntersecting;
			if (nowVisible && !isVisible) {
				isVisible = true;
				Runner.run(runner, engine);
				rafId = requestAnimationFrame(update);
			} else if (!nowVisible && isVisible) {
				isVisible = false;
				Runner.stop(runner);
				if (rafId) cancelAnimationFrame(rafId);
			}
		});

		if (heroSection) observer.observe(heroSection);

		function update() {
			if (isVisible) {
				for (const { body, element, initialX, initialY } of letters) {
					// Kunci koordinat X agar huruf hanya bergerak vertikal
					Matter.Body.setPosition(body, { x: initialX, y: body.position.y });
					const { x, y } = body.position;
					element.style.transform = `translate(${x - initialX}px, ${y - initialY}px) rotate(0rad)`;
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
	class="paper-hero relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-20 pb-10 text-center transition-colors duration-300 md:pt-24"
	style="--mouse-x: 50%; --mouse-y: 50%;"
>
	<!-- Adaptive Blueprint Background -->
	<div
		class="pointer-events-none absolute inset-0 bg-[#f3f3f6] transition-colors duration-300 dark:bg-[#111115]"
	></div>

	<!-- Blueprint Grid Pattern (1:1 subtle grid style) -->
	<div class="blueprint-grid pointer-events-none absolute inset-0"></div>

	<!-- Interactive Spotlight -->
	<div class="mouse-spotlight pointer-events-none absolute inset-0"></div>

	<!-- Fine Grain Overlay -->
	<div
		class="pointer-events-none absolute inset-0 z-50 opacity-[0.02] mix-blend-overlay"
		style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
	></div>

	<!-- ── SVG Blueprint Polyhedron (Kanan Atas - 3D Cardboard Box) ── -->
	<svg
		class="blueprint-svg-right pointer-events-none absolute top-[4%] right-[2%] h-[58%] w-[45%] opacity-[0.35] dark:opacity-[0.16]"
		viewBox="0 0 400 450"
		fill="none"
	>
		<!-- Garis Proyeksi/Konstruksi Latar Belakang (Dashed) -->
		<line
			x1="100"
			y1="0"
			x2="100"
			y2="450"
			class="technical-path stroke-zinc-400/20 dark:stroke-white/10"
			stroke-width="0.5"
			stroke-dasharray="4 4"
		/>
		<line
			x1="200"
			y1="0"
			x2="200"
			y2="450"
			class="technical-path stroke-zinc-400/20 dark:stroke-white/10"
			stroke-width="0.5"
			stroke-dasharray="4 4"
		/>
		<line
			x1="0"
			y1="220"
			x2="400"
			y2="220"
			class="technical-path stroke-zinc-400/20 dark:stroke-white/10"
			stroke-width="0.5"
			stroke-dasharray="4 4"
		/>

		<!-- Busur Sudut Putaran (Angle Arc) -->
		<path
			d="M 70,200 A 40,40 0 0,1 100,160"
			class="technical-path stroke-zinc-400/50 dark:stroke-white/30"
			stroke-width="0.8"
			stroke-dasharray="2 2"
		/>
		<path
			d="M 300,160 A 40,40 0 0,1 330,200"
			class="technical-path stroke-zinc-400/50 dark:stroke-white/30"
			stroke-width="0.8"
			stroke-dasharray="2 2"
		/>

		<!-- Bodi Dalam Kardus & Lipatan Dasar (Dashed) -->
		<path
			d="M200,240 L100,300 M200,240 L300,300 M200,240 L200,100"
			class="technical-path stroke-zinc-400/40 dark:stroke-white/30"
			stroke-width="0.6"
			stroke-dasharray="2 2"
		/>
		<path
			d="M100,160 L200,100 L300,160"
			class="technical-path stroke-zinc-400/40 dark:stroke-white/30"
			stroke-width="0.6"
			stroke-dasharray="2 2"
		/>

		<!-- Lipatan Flap Depan (Dashed) -->
		<line
			x1="100"
			y1="160"
			x2="200"
			y2="220"
			class="technical-path stroke-zinc-400/50 dark:stroke-white/40"
			stroke-width="0.6"
			stroke-dasharray="2 2"
		/>
		<line
			x1="200"
			y1="220"
			x2="300"
			y2="160"
			class="technical-path stroke-zinc-400/50 dark:stroke-white/40"
			stroke-width="0.6"
			stroke-dasharray="2 2"
		/>

		<!-- Garis Solid Bodi Utama Kardus -->
		<path
			d="M100,160 L100,300 L200,360 L300,300 L300,160"
			class="technical-path stroke-zinc-400 dark:stroke-white/70"
			stroke-width="0.8"
		/>
		<line
			x1="200"
			y1="220"
			x2="200"
			y2="360"
			class="technical-path stroke-zinc-400 dark:stroke-white/70"
			stroke-width="0.8"
		/>

		<!-- Flap Depan Kiri & Kanan (Solid Outer) -->
		<path
			d="M100,160 L40,230 L140,290 L200,220"
			class="technical-path stroke-zinc-400 dark:stroke-white/70"
			stroke-width="0.8"
		/>
		<path
			d="M200,220 L260,290 L360,230 L300,160"
			class="technical-path stroke-zinc-400 dark:stroke-white/70"
			stroke-width="0.8"
		/>

		<!-- Flap Belakang Kiri & Kanan dengan Tuck Tab (Solid Outer) -->
		<path
			d="M100,160 L70,95 L80,90 L145,25 L155,30 L200,100"
			class="technical-path stroke-zinc-400 dark:stroke-white/70"
			stroke-width="0.8"
		/>
		<path
			d="M200,100 L245,30 L255,25 L320,90 L330,95 L300,160"
			class="technical-path stroke-zinc-400 dark:stroke-white/70"
			stroke-width="0.8"
		/>
	</svg>

	<!-- ── SVG Blueprint Origami Box Template (Kiri Bawah - 2D Unfolded Box Net) ── -->
	<svg
		class="blueprint-svg-left pointer-events-none absolute bottom-[2%] left-[2%] h-[38%] w-[20%] opacity-[0.3] dark:opacity-[0.11]"
		viewBox="0 0 250 350"
		fill="none"
	>
		<!-- Garis Lipatan Kolom Utama (Dashed) -->
		<line
			x1="80"
			y1="150"
			x2="140"
			y2="150"
			class="technical-path stroke-zinc-400/60 dark:stroke-white/50"
			stroke-width="0.8"
			stroke-dasharray="2 2"
		/>
		<line
			x1="80"
			y1="220"
			x2="140"
			y2="220"
			class="technical-path stroke-zinc-400/60 dark:stroke-white/50"
			stroke-width="0.8"
			stroke-dasharray="2 2"
		/>
		<line
			x1="80"
			y1="80"
			x2="140"
			y2="80"
			class="technical-path stroke-zinc-400/60 dark:stroke-white/50"
			stroke-width="0.8"
			stroke-dasharray="2 2"
		/>
		<line
			x1="80"
			y1="290"
			x2="140"
			y2="290"
			class="technical-path stroke-zinc-400/60 dark:stroke-white/50"
			stroke-width="0.8"
			stroke-dasharray="2 2"
		/>

		<!-- Garis Lipatan Panel Samping Kiri & Kanan (Dashed) -->
		<line
			x1="80"
			y1="150"
			x2="80"
			y2="220"
			class="technical-path stroke-zinc-400/60 dark:stroke-white/50"
			stroke-width="0.8"
			stroke-dasharray="2 2"
		/>
		<line
			x1="140"
			y1="150"
			x2="140"
			y2="220"
			class="technical-path stroke-zinc-400/60 dark:stroke-white/50"
			stroke-width="0.8"
			stroke-dasharray="2 2"
		/>
		<line
			x1="190"
			y1="150"
			x2="190"
			y2="220"
			class="technical-path stroke-zinc-400/60 dark:stroke-white/50"
			stroke-width="0.8"
			stroke-dasharray="2 2"
		/>

		<!-- Pola Lipatan Origami Segitiga Flap Kiri (Dashed) -->
		<line
			x1="80"
			y1="150"
			x2="20"
			y2="220"
			class="technical-path stroke-zinc-400/50 dark:stroke-white/40"
			stroke-width="0.6"
			stroke-dasharray="2 2"
		/>
		<line
			x1="80"
			y1="220"
			x2="20"
			y2="170"
			class="technical-path stroke-zinc-400/50 dark:stroke-white/40"
			stroke-width="0.6"
			stroke-dasharray="2 2"
		/>

		<!-- Garis Potong Solid Batas Luar Die-cut Net -->
		<path
			class="technical-path stroke-zinc-400 dark:stroke-white/70"
			d="M80,80 L85,20 L135,20 L140,80 L140,150 L190,150 L205,165 L205,205 L190,220 L140,220 L140,290 L135,330 L85,330 L80,290 L80,220 L20,220 L20,170 L80,150 Z"
			stroke-width="0.8"
		/>
	</svg>

	<!-- ── Blueprint Annotations (Kiri Atas) ── -->
	<div
		class="blueprint-annotation pointer-events-none absolute top-[13%] left-[9%] z-10 hidden font-mono text-[9px] leading-relaxed tracking-wider text-zinc-500 uppercase lg:block dark:text-white/35"
	>
		<p>FOLD LINE X:1024</p>
		<p>ANGLE: 45°</p>
		<p>PAPER WEIGHT: 200GSM</p>
	</div>

	<!-- Penanda Sudut 45° - 56° (1:1) ── -->
	<div
		class="blueprint-annotation pointer-events-none absolute top-[14%] left-[25%] z-10 hidden w-[5.5%] lg:block"
	>
		<div
			class="flex justify-between pb-1 font-mono text-[8px] tracking-wider text-zinc-500 dark:text-white/30"
		>
			<span>45°</span>
			<span>56°</span>
		</div>
		<div class="relative h-[0.5px] w-full bg-zinc-300 dark:bg-white/15">
			<div class="absolute -top-0.5 left-0 h-1.5 w-[0.5px] bg-zinc-400 dark:bg-white/30"></div>
			<div class="absolute -top-0.5 right-0 h-1.5 w-[0.5px] bg-zinc-400 dark:bg-white/30"></div>
		</div>
	</div>

	<!-- Garis Dimensi Vertikal Kiri (1440) ── -->
	<div
		class="dim-line pointer-events-none absolute top-[18%] left-[7.5%] z-10 hidden h-[22%] w-[0.5px] bg-zinc-300 lg:block dark:bg-white/15"
	>
		<span
			class="absolute top-1/2 -left-7 -translate-y-1/2 font-mono text-[8px] tracking-wider text-zinc-500 dark:text-white/30"
			>1440</span
		>
		<div class="absolute top-0 -left-1 h-[0.5px] w-2 bg-zinc-400 dark:bg-white/25"></div>
		<div class="absolute bottom-0 -left-1 h-[0.5px] w-2 bg-zinc-400 dark:bg-white/25"></div>
	</div>

	<!-- Garis Dimensi Horizontal Bawah (1448) ── -->
	<div
		class="dim-line pointer-events-none absolute bottom-[40%] left-[9%] z-10 hidden h-[0.5px] w-[6%] bg-zinc-300 lg:block dark:bg-white/15"
	>
		<span
			class="absolute -bottom-4 left-1/2 -translate-x-1/2 font-mono text-[8px] tracking-wider text-zinc-500 dark:text-white/30"
			>1448</span
		>
		<div class="absolute top-[-2px] left-0 h-1.5 w-[0.5px] bg-zinc-400 dark:bg-white/25"></div>
		<div class="absolute top-[-2px] right-0 h-1.5 w-[0.5px] bg-zinc-400 dark:bg-white/25"></div>
	</div>

	<!-- Garis Dimensi Vertikal Kanan (900) ── -->
	<div
		class="dim-line pointer-events-none absolute top-[18%] right-[8%] z-10 hidden h-[22%] w-[0.5px] bg-zinc-300 lg:block dark:bg-white/15"
	>
		<span
			class="absolute top-1/2 -right-7 -translate-y-1/2 font-mono text-[8px] tracking-wider text-zinc-500 dark:text-white/30"
			>900</span
		>
		<div class="absolute top-0 -right-1 h-[0.5px] w-2 bg-zinc-400 dark:bg-white/25"></div>
		<div class="absolute -right-1 bottom-0 h-[0.5px] w-2 bg-zinc-400 dark:bg-white/25"></div>
	</div>

	<!-- ── Pojok Kanan Atas Metadata ── -->
	<div
		class="blueprint-annotation pointer-events-none absolute top-8 right-8 z-20 text-right font-mono text-[9px] leading-relaxed tracking-[0.2em] text-zinc-500 uppercase dark:text-white/35"
	>
		<p>ORIGIN: INDONESIA</p>
		<p>ARCHIVE: V.1.0.4</p>
	</div>

	<!-- ── Pojok Kiri Bawah Metadata ── -->
	<div
		class="blueprint-annotation pointer-events-none absolute bottom-8 left-8 z-20 font-mono text-[9px] leading-relaxed tracking-[0.2em] text-zinc-500 uppercase dark:text-white/35"
	>
		<p>PAPER WEIGHT: 280GSM</p>
		<p>DIMENSIONS: 1440x900</p>
	</div>

	<!-- ── Pojok Kanan Bawah Metadata ── -->
	<div
		class="blueprint-annotation pointer-events-none absolute right-8 bottom-8 z-20 text-right font-mono text-[9px] leading-relaxed tracking-[0.2em] text-zinc-500 uppercase dark:text-white/35"
	>
		<p>ORIGIN: INDONESIA</p>
		<p>ARCHIVE: V.1.0.4</p>
	</div>

	<!-- ══════════════ MAIN CONTENT ══════════════ -->
	<div class="relative z-10 container mx-auto px-6">
		<!-- Title Container (Matter.js Target) -->
		<div class="relative mx-auto mb-4 inline-block" style="height: 160px;">
			<h1
				bind:this={heroTitle}
				class="flex flex-wrap justify-center text-white drop-shadow-2xl"
				aria-label="Mikeu Dev"
			>
				{#each titleChars as char, i (i)}
					<span
						bind:this={letterElements[i]}
						class="-mx-0.5 inline-block h-12 w-8 sm:-mx-1 sm:h-20 sm:w-14 md:-mx-2 md:h-28 md:w-18 lg:-mx-3 lg:h-36 lg:w-24"
					>
						<BrutalistGlyph {char} />
					</span>
				{/each}
			</h1>

			<!-- Impact FX Layers -->
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

		<!-- Subtitle -->
		<div class="hero-stagger mt-6">
			<p
				bind:this={heroSubtitle}
				class="mx-auto max-w-2xl font-mono text-base font-medium tracking-[0.06em] text-neutral-800 transition-colors duration-300 sm:text-lg md:text-xl dark:text-neutral-200"
			>
				Fullstack Web Developer | Indonesia
			</p>

			<!-- ── Skills (Tape Label Style - 1:1) ── -->
			<div bind:this={bulletContainer} class="mt-8 flex flex-col items-center justify-center gap-3">
				<!-- Row 1: SvelteKit, TypeScript, Go, PostgreSQL -->
				<div class="flex flex-wrap justify-center gap-3">
					{#each finalSkills.slice(0, 4) as skill (skill)}
						<div class="tape-label">
							<span class="tape-label-text">{skill}</span>
							<div class="tape-fold"></div>
						</div>
					{/each}
				</div>
				<!-- Row 2: Docker, GIS -->
				{#if finalSkills.length > 4}
					<div class="mt-1 flex flex-wrap justify-center gap-3">
						{#each finalSkills.slice(4) as skill (skill)}
							<div class="tape-label">
								<span class="tape-label-text">{skill}</span>
								<div class="tape-fold"></div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- ── CTA Buttons (Paper Tape Style - 1:1) ── -->
			<div bind:this={heroButton} class="mt-10 flex flex-wrap justify-center gap-6">
				<a
					href="#contact"
					onclick={(e) => {
						e.preventDefault();
						document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
					}}
					class="tape-button tape-button-left group"
				>
					<span
						class="relative z-10 font-mono text-sm font-bold tracking-widest uppercase sm:text-base"
						>Contact Me</span
					>
				</a>

				<a
					href="#work"
					onclick={(e) => {
						e.preventDefault();
						document.querySelector('#work')?.scrollIntoView({ behavior: 'smooth' });
					}}
					class="tape-button tape-button-right group"
				>
					<span
						class="relative z-10 font-mono text-sm font-bold tracking-widest uppercase sm:text-base"
						>View Work</span
					>
				</a>
			</div>
		</div>
	</div>
</section>

<style lang="postcss">
	@reference "tailwindcss";

	/* ── Base Section ── */
	.paper-hero {
		perspective: 1500px;
	}

	.hero-stagger {
		transform: translateZ(50px);
	}

	/* CSS Variables for Light / Dark Theme Adaptation */
	:root {
		--grid-color: rgba(0, 0, 0, 0.06);
		--mouse-glow: rgba(0, 0, 0, 0.015);
		--tape-shadow: rgba(0, 0, 0, 0.08);
		--tape-shadow-hover: rgba(0, 0, 0, 0.12);
	}

	:global(.dark) {
		--grid-color: rgba(255, 255, 255, 0.015);
		--mouse-glow: rgba(255, 255, 255, 0.025);
		--tape-shadow: rgba(0, 0, 0, 0.35);
		--tape-shadow-hover: rgba(0, 0, 0, 0.45);
	}

	/* Title characters */
	span {
		user-select: none;
		will-change: transform;
	}

	/* ── Blueprint Grid ── */
	.blueprint-grid {
		background-image:
			linear-gradient(var(--grid-color) 1px, transparent 1px),
			linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
		background-size: 40px 40px;
	}

	/* ── Mouse Spotlight ── */
	.mouse-spotlight {
		background: radial-gradient(
			circle 450px at var(--mouse-x) var(--mouse-y),
			var(--mouse-glow),
			transparent 70%
		);
	}

	/* ── Tape Label (Skill Badge) ── */
	.tape-label {
		position: relative;
		display: inline-flex;
		align-items: center;
		padding: 8px 18px;
		background: #ffffff;
		color: #111115;
		clip-path: polygon(0% 0%, calc(100% - 10px) 0%, 100% 10px, 100% 100%, 0% 100%);
		transition: all 0.25s ease;
		box-shadow: 0 4px 10px var(--tape-shadow);
	}

	.tape-label:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 14px var(--tape-shadow-hover);
	}

	.tape-label-text {
		font-family: var(--font-inter);
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.02em;
	}

	@media (min-width: 640px) {
		.tape-label-text {
			font-size: 14px;
		}
	}

	/* The folded corner effect */
	.tape-fold {
		position: absolute;
		top: 0;
		right: 0;
		width: 10px;
		height: 10px;
		background: linear-gradient(135deg, transparent 50%, #c2c2c9 50%);
	}

	/* ── Tape CTA Buttons (1:1) ── */
	.tape-button {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 14px 36px;
		cursor: pointer;
		background: #ffffff;
		color: #111115;
		box-shadow: 0 8px 22px var(--tape-shadow);
		transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
		text-decoration: none;
	}

	.tape-button:hover {
		transform: translateY(-2.5px);
		box-shadow: 0 12px 28px var(--tape-shadow-hover);
	}

	.tape-button-left {
		clip-path: polygon(0% 12%, 100% 0%, 96% 100%, 4% 88%);
	}

	.tape-button-right {
		clip-path: polygon(4% 0%, 100% 12%, 96% 88%, 0% 100%);
	}

	/* ── Origami Impact Shard ── */
	:global(.origami-impact-shard) {
		position: absolute;
		pointer-events: none;
		z-index: 20;
		filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.25));
		will-change: transform, opacity;
	}

	/* ── Impact Particle ── */
	:global(.impact-particle) {
		position: absolute;
		pointer-events: none;
		z-index: 20;
		color: rgba(255, 255, 255, 0.55);
		will-change: transform, opacity;
	}
</style>
