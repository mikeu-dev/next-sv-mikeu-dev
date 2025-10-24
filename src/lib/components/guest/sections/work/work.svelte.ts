import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Matter from 'matter-js';
import { toast } from 'svelte-sonner';
import { initGsap } from '@/lib/utils';
import { onMount } from 'svelte';
import { writable, get } from 'svelte/store';

// ✅ Hanya destructure yang dipakai sebagai nilai
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

		initGsap();
		gsap.registerPlugin(ScrollTrigger);
		ScrollTrigger.refresh();

		// Animasi muncul saat scroll
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

		// Setup Matter.js
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

		const mouse = Mouse.create(section);
		const mouseConstraint = MouseConstraint.create(engine, {
			mouse,
			constraint: { stiffness: 0.1, render: { visible: false } }
		});
		Composite.add(world, mouseConstraint);

		// ✅ Solusi Definitif: Dengarkan mouseup di level window.
		// Ini akan menangkap event pelepasan mouse di mana pun kursor berada.
		function handleMouseUp() {
			isDragging.set(false);
			// Set body pada mouseConstraint ke null untuk melepaskan ikatan.
			// Ini adalah cara yang paling andal.
			// @ts-expect-error - Ini adalah cara yang benar untuk melepaskan body di Matter.js
			mouseConstraint.body = null;
		}

		// Event saat mulai menyeret
		Matter.Events.on(mouseConstraint, 'startdrag', () => {
			isDragging.set(true);
		});

		Matter.Events.on(mouseConstraint, 'enddrag', () => {
			isDragging.set(false);
		});

		// Tambahkan event listener ke window
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
			// Jangan lupa hapus event listener dari window saat komponen di-unmount
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
