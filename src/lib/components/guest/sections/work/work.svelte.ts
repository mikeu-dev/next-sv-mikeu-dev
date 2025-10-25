import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Matter from 'matter-js';
import { toast } from 'svelte-sonner';
import { onMount } from 'svelte';
import { writable, get } from 'svelte/store';

// ✅ Destructure yang dipakai
const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint } = Matter;

export function useWorkSection() {
	const workSection = writable<HTMLElement | null>(null);
	const projectCardElements = writable<HTMLElement[]>([]);
	const tooltipOpen = writable(false);
	const virtualAnchor = writable<{ getBoundingClientRect: () => DOMRect } | null>(null);
	const isDragging = writable(false);

	let hoverTimeout: ReturnType<typeof setTimeout> | null = null;
	const TOOLTIP_DELAY = 500;
	let notificationCooldown = false;
	const VELOCITY_THRESHOLD = 15;
	const NOTIFICATION_COOLDOWN_MS = 3000;

	function createVirtualAnchor(x: number, y: number) {
		return {
			getBoundingClientRect: () => new DOMRect(x, y, 1, 1)
		};
	}

	onMount(() => {
		const section = get(workSection);
		const elements = get(projectCardElements);
		if (!section) return;

		gsap.registerPlugin(ScrollTrigger);
		ScrollTrigger.refresh();

		// Animasi masuk saat scroll
		gsap.from(section, {
			y: 50,
			opacity: 0,
			duration: 0.6,
			ease: 'power2.out',
			scrollTrigger: {
				trigger: section,
				start: 'top 85%',
				toggleActions: 'play none none none'
			}
		});

		// Setup Matter.js (aman untuk scroll)
		const engine = Engine.create();
		const world = engine.world;
		engine.gravity.y = 0.6;

		const rect = section.getBoundingClientRect();
		const wallOptions = { isStatic: true, render: { visible: false } };

		Composite.add(world, [
			Bodies.rectangle(rect.width / 2, rect.height - 10, rect.width, 20, wallOptions),
			Bodies.rectangle(-50, rect.height / 2, 100, rect.height, wallOptions),
			Bodies.rectangle(rect.width + 50, rect.height / 2, 100, rect.height, wallOptions)
		]);

		// ✅ Buat body untuk tiap kartu
		const cardBodies = elements.map((el) => {
			const elRect = el.getBoundingClientRect();
			const initialX = elRect.left - rect.left + elRect.width / 2;
			const spawnY = -150;
			const targetY = elRect.top - rect.top + elRect.height / 2;

			return {
				body: Bodies.rectangle(initialX, spawnY, elRect.width, elRect.height, {
					restitution: 0.5,
					friction: 0.3,
					frictionAir: 0.02,
					angle: Math.random() * 0.4 - 0.2
				}),
				element: el,
				initialX,
				initialY: targetY
			};
		});

		Composite.add(
			world,
			cardBodies.map((c) => c.body)
		);

		// ✅ Buat mouse + constraint aman untuk scroll
		const mouse = Mouse.create(section);

		mouse.element.addEventListener(
			'touchmove',
			(e) => {
				// Jika tidak sedang drag, biarkan scroll normal
				if (!get(isDragging)) return;
				e.preventDefault();
			},
			{ passive: false }
		);

		mouse.element.addEventListener('touchmove', (e) => e.stopPropagation(), { passive: true });

		const mouseConstraint = MouseConstraint.create(engine, {
			mouse,
			constraint: { stiffness: 0.1, render: { visible: false } }
		});
		Composite.add(world, mouseConstraint);

		// ✅ Tangani pelepasan mouse global
		function handleMouseUp() {
			isDragging.set(false);
			// @ts-expect-error Matter.js tidak expose properti ini di tipe
			mouseConstraint.body = null;
		}

		Matter.Events.on(mouseConstraint, 'startdrag', () => isDragging.set(true));
		Matter.Events.on(mouseConstraint, 'enddrag', () => isDragging.set(false));

		window.addEventListener('mouseup', handleMouseUp);

		const runner = Runner.create();
		Runner.run(runner, engine);

		function update() {
			if (engine.world.bodies.length === 0) return;
			requestAnimationFrame(update);

			cardBodies.forEach(({ body, element, initialX, initialY }) => {
				const { x, y } = body.position;
				const angle = body.angle;
				element.style.transform = `translate(${x - initialX}px, ${y - initialY}px) rotate(${angle}rad)`;

				const velocity = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
				if (velocity > VELOCITY_THRESHOLD && !notificationCooldown) {
					notificationCooldown = true;
					toast.warning('Hey, pelan-pelan dong boss qu!', {
						description: 'Rusak nanti layarnya kalo main keras-keras amat 😅'
					});
					setTimeout(() => (notificationCooldown = false), NOTIFICATION_COOLDOWN_MS);
				}
			});
		}
		update();

		// Tooltip behavior
		function handleMouseEnter() {
			if (hoverTimeout) clearTimeout(hoverTimeout);
			hoverTimeout = setTimeout(() => tooltipOpen.set(true), TOOLTIP_DELAY);
		}
		function handleMouseLeave() {
			if (hoverTimeout) clearTimeout(hoverTimeout);
			tooltipOpen.set(false);
			virtualAnchor.set(null);
		}
		function handleMouseMove(event: MouseEvent) {
			virtualAnchor.set(createVirtualAnchor(event.clientX, event.clientY));
			if (!get(tooltipOpen)) {
				if (hoverTimeout) clearTimeout(hoverTimeout);
				hoverTimeout = setTimeout(() => tooltipOpen.set(true), TOOLTIP_DELAY);
			}
		}

		section.addEventListener('mouseenter', handleMouseEnter);
		section.addEventListener('mouseleave', handleMouseLeave);
		section.addEventListener('mousemove', handleMouseMove);

		return () => {
			Runner.stop(runner);
			Engine.clear(engine);
			section.removeEventListener('mouseenter', handleMouseEnter);
			section.removeEventListener('mouseleave', handleMouseLeave);
			section.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		};
	});

	return {
		workSection,
		projectCardElements,
		tooltipOpen,
		virtualAnchor,
		isDragging
	};
}
