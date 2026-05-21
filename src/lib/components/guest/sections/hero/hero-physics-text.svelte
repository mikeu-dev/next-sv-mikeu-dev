<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { SvelteSet, SvelteMap } from 'svelte/reactivity';
	import { browser } from '$app/environment';
	import { gsap } from 'gsap';
	import BrutalistGlyph from '@/lib/components/ui/BrutalistGlyph.svelte';
	import type Matter from 'matter-js';
	import type { IChamferableBodyDefinition } from 'matter-js';

	let { titleChars }: { titleChars: string[] } = $props();

	let heroTitle = $state<HTMLElement>();
	let impactLayer = $state<HTMLElement>();
	let crackLayer = $state<SVGSVGElement>();
	let letterElements = $state<HTMLElement[]>([]);

	interface LetterData {
		body: Matter.Body;
		element: HTMLElement;
		initialX: number;
		initialY: number;
	}

	let engine: Matter.Engine;
	let runner: Matter.Runner;
	let observer: IntersectionObserver;

	const impactedBodies = new SvelteSet<number>();

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

	let updatePhysicsFn: (time: number, deltaTime: number, frame: number) => void;

	onMount(async () => {
		if (!browser || !heroTitle) return;

		let isVisible = false;

		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) return;

		const MatterModule = await import('matter-js');
		const Matter = MatterModule.default || MatterModule;
		const { Engine, Runner, Bodies, Composite, Events, Mouse, MouseConstraint } = Matter;

		engine = Engine.create({ enableSleeping: true });
		const world = engine.world;
		engine.gravity.y = 1.0;

		const titleRect = heroTitle.getBoundingClientRect();
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
						sleepThreshold: 30
					}
				);
				return { body, element: el, initialX, initialY };
			})
			.filter((v): v is LetterData => v !== null);

		const bodyToLetter = new SvelteMap<number, LetterData>();
		letters.forEach((letter) => bodyToLetter.set(letter.body.id, letter));

		letters.forEach((letter, i) => {
			setTimeout(() => {
				if (world) Composite.add(world, letter.body);
			}, i * 30);
		});

		// Interaction constraint: Repel on mouse move
		const parentSection = document.getElementById('hero');
		if (parentSection) {
			parentSection.addEventListener('mousemove', (e) => {
				if (!isVisible) return;
				const rect = heroTitle!.getBoundingClientRect();
				const mouseX = e.clientX - rect.left;
				const mouseY = e.clientY - rect.top;

				letters.forEach((letter) => {
					const dx = letter.body.position.x - mouseX;
					const dy = letter.body.position.y - mouseY;
					const dist = Math.sqrt(dx * dx + dy * dy);

					if (dist < 100 && !letter.body.isStatic) {
						// Wake up the body
						Matter.Sleeping.set(letter.body, false);
						const force = (100 - dist) / 10000;
						Matter.Body.applyForce(letter.body, letter.body.position, {
							x: (dx / dist) * force,
							y: (dy / dist) * force - 0.005 // little updraft
						});
					}
				});
			});
		}

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

				if (impactLayer) spawnDustParticles(impactX, impactY, velocity, impactLayer);
				if (velocity > 3 && heroTitle) {
					const titleContainer = heroTitle.closest('.relative') as HTMLElement | null;
					if (titleContainer) triggerScreenShake(titleContainer, velocity);
				}
				triggerImpactFlash(letterData.element, velocity);
				if (crackLayer && velocity > 2.5) drawFloorCrack(crackLayer, impactX, impactY, velocity);
			}
		});

		observer = new IntersectionObserver((entries) => {
			isVisible = entries[0].isIntersecting;
		});

		if (heroTitle) observer.observe(heroTitle);

		// Synchronize Matter.js engine with GSAP ticker
		updatePhysicsFn = (time: number, deltaTime: number, frame: number) => {
			if (isVisible && engine) {
				Engine.update(engine, deltaTime);
				for (const { body, element, initialX, initialY } of letters) {
					if (!body.isSleeping) {
						const { x, y } = body.position;
						element.style.transform = `translate(${x - initialX}px, ${y - initialY}px) rotate(${body.angle}rad)`;
					}
				}
			}
		};
		gsap.ticker.add(updatePhysicsFn);
	});

	onDestroy(() => {
		if (observer) observer.disconnect();
		if (engine) {
			import('matter-js').then((Matter) => {
				const M = Matter.default || Matter;
				M.Engine.clear(engine);
			});
		}
		if (updatePhysicsFn) gsap.ticker.remove(updatePhysicsFn);
	});
</script>

<div class="relative mx-auto mb-6 inline-block" style="height: 160px;">
	<h1
		bind:this={heroTitle}
		class="flex flex-wrap justify-center text-foreground drop-shadow-2xl"
		aria-label="Mikeu Dev"
		style="position: relative; overflow: visible;"
	>
		{#each titleChars as char, i (i)}
			<span
				bind:this={letterElements[i]}
				class="physics-letter -mx-0.5 inline-block h-12 w-8 sm:-mx-1 sm:h-20 sm:w-14 md:-mx-1.5 md:h-28 md:w-18 lg:-mx-2 lg:h-36 lg:w-24"
			>
				<BrutalistGlyph {char} />
			</span>
		{/each}
	</h1>

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

<style lang="postcss">
	.physics-letter {
		user-select: none;
		will-change: transform;
	}

	:global(.origami-impact-shard) {
		position: absolute;
		pointer-events: none;
		z-index: 20;
		filter: drop-shadow(0 0 2px var(--primary-foreground));
		will-change: transform, opacity;
	}
	:global(.impact-particle) {
		position: absolute;
		pointer-events: none;
		z-index: 20;
	}
</style>
