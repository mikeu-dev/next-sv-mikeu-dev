<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import Matter from 'matter-js';
	import { toast } from 'svelte-sonner';
	import * as Tooltip from '@/lib/components/ui/tooltip';
	import ProjectCard from '@/lib/components/ProjectCard.svelte';
	import type { Project } from '$lib/types';
	import { initGsap } from '@/lib/utils';

	export let projects: Project[];

	let workSection: HTMLElement;
	let projectCardElements: HTMLElement[] = [];

	// Tooltip state
	let tooltipOpen = false;
	let virtualAnchor: { getBoundingClientRect: () => DOMRect } | null = null;
	let hoverTimeout: ReturnType<typeof setTimeout> | null = null;
	const TOOLTIP_DELAY = 500;

	// Notification state
	let notificationCooldown = false;
	const VELOCITY_THRESHOLD = 15;
	const NOTIFICATION_COOLDOWN_MS = 3000;

	function createVirtualAnchor(x: number, y: number): { getBoundingClientRect: () => DOMRect } {
		return {
			getBoundingClientRect: () => new DOMRect(x, y, 1, 1)
		};
	}

	onMount(() => {
		initGsap();
		ScrollTrigger.refresh();

		// Animate section scroll-in
		gsap.from(workSection, {
			y: 50,
			opacity: 0,
			duration: 0.6,
			ease: 'power2.out',
			scrollTrigger: {
				trigger: workSection,
				start: 'top 85%',
				toggleActions: 'play none none none'
			}
		});

		// --- Matter.js Physics ---
		const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint } = Matter;
		const engine = Engine.create();
		const world = engine.world;
		engine.gravity.y = 0.6;

		const workRect = workSection.getBoundingClientRect();
		const wallOptions = { isStatic: true, render: { visible: false } };

		Composite.add(world, [
			Bodies.rectangle(workRect.width / 2, workRect.height - 10, workRect.width, 20, wallOptions), // Floor
			Bodies.rectangle(-50, workRect.height / 2, 100, workRect.height, wallOptions), // Left wall
			Bodies.rectangle(workRect.width + 50, workRect.height / 2, 100, workRect.height, wallOptions) // Right wall
		]);

		const cardBodies = projectCardElements.map((el) => {
			const rect = el.getBoundingClientRect();
			const initialX = rect.left - workRect.left + rect.width / 2;
			const spawnY = -150;
			const targetY = rect.top - workRect.top + rect.height / 2;

			return {
				body: Bodies.rectangle(initialX, spawnY, rect.width, rect.height, {
					restitution: 0.5,
					friction: 0.3,
					frictionAir: 0.02,
					angle: Math.random() * 0.4 - 0.2
				}),
				element: el,
				initialX,
				initialY: targetY,
				width: rect.width,
				height: rect.height
			};
		});

		Composite.add(
			world,
			cardBodies.map((c) => c.body)
		);

		const mouse = Mouse.create(workSection);
		const mouseConstraint = MouseConstraint.create(engine, {
			mouse: mouse,
			constraint: { stiffness: 0.1, render: { visible: false } }
		});
		Composite.add(world, mouseConstraint);

		const runner = Runner.create();
		Runner.run(runner, engine);

		(function update() {
			if (engine.world.bodies.length === 0) return;
			requestAnimationFrame(update);
			cardBodies.forEach(({ body, element, initialX, initialY }) => {
				const { x, y } = body.position;
				const angle = body.angle;
				element.style.transform = `translate(${x - initialX}px, ${y - initialY}px) rotate(${angle}rad)`;

				const velocity = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
				if (velocity > VELOCITY_THRESHOLD && !notificationCooldown) {
					notificationCooldown = true;
					toast.warning('Hey, pelan pelan dong boss qu!', {
						description: 'Rusak nanti layarnya kalo main keras-keras amat 😅'
					});
					setTimeout(() => {
						notificationCooldown = false;
					}, NOTIFICATION_COOLDOWN_MS);
				}
			});
		})();

		// --- Tooltip Handlers ---
		const handleMouseEnter = () => {
			if (hoverTimeout) clearTimeout(hoverTimeout);
			hoverTimeout = setTimeout(() => (tooltipOpen = true), TOOLTIP_DELAY);
		};
		const handleMouseLeave = () => {
			if (hoverTimeout) clearTimeout(hoverTimeout);
			tooltipOpen = false;
			virtualAnchor = null;
		};
		const handleMouseMove = (event: MouseEvent) => {
			virtualAnchor = createVirtualAnchor(event.clientX, event.clientY);
			if (!tooltipOpen && hoverTimeout) {
				clearTimeout(hoverTimeout);
				hoverTimeout = setTimeout(() => (tooltipOpen = true), TOOLTIP_DELAY);
			}
		};

		workSection.addEventListener('mouseenter', handleMouseEnter);
		workSection.addEventListener('mouseleave', handleMouseLeave);
		workSection.addEventListener('mousemove', handleMouseMove);

		return () => {
			Runner.stop(runner);
			Engine.clear(engine);
			workSection.removeEventListener('mouseenter', handleMouseEnter);
			workSection.removeEventListener('mouseleave', handleMouseLeave);
			workSection.removeEventListener('mousemove', handleMouseMove);
		};
	});
</script>

<Tooltip.Provider>
	<Tooltip.Root bind:open={tooltipOpen}>
		<section
			bind:this={workSection}
			id="work"
			class="relative mb-0! overflow-hidden pt-16 pb-0! md:pt-24"
		>
			<div class="mb-16 text-center">
				<h2 class="font-poppins text-3xl font-bold tracking-tight">Featured Projects</h2>
				<p class="mx-auto mt-2 max-w-2xl text-lg text-muted-foreground">
					A selection of projects that I'm proud of.
				</p>
			</div>

			<div class="projects-grid grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each projects as project, i (project.id)}
					<div bind:this={projectCardElements[i]}><ProjectCard {project} /></div>
				{/each}
			</div>
		</section>
		<Tooltip.Content customAnchor={virtualAnchor}>
			<p>Click and drag the cards to play!</p>
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
