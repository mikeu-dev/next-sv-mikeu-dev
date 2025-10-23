<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Matter from 'matter-js';
	import Button from '@/lib/components/ui/button/button.svelte';

	let heroTitle: HTMLElement;
	let heroSubtitle: HTMLElement;
	let heroButton: HTMLElement;
	let letterElements: HTMLElement[] = [];

	const titleText = 'Riki Ruswandi (Mikeu)';
	const titleChars = titleText.split('');

	onMount(() => {
		// Animate subtitle and buttons
		gsap.from(heroSubtitle, { y: 20, opacity: 0, duration: 0.5, delay: 0.2 });
		gsap.from(heroButton, { y: 20, opacity: 0, duration: 0.5, delay: 0.3 });

		// --- Matter.js Physics for Hero Title ---
		const { Engine, Runner, Bodies, Composite } = Matter;

		const engine = Engine.create();
		const world = engine.world;
		engine.gravity.y = 1;

		const titleRect = heroTitle.getBoundingClientRect();
		const wallOptions = { isStatic: true, render: { visible: false } };

		// Add floor for letters to land on
		Composite.add(world, [
			Bodies.rectangle(titleRect.width / 2, titleRect.height + 10, titleRect.width, 20, wallOptions)
		]);

		const letterData = letterElements
			.map((el, i) => {
				if (titleChars[i] === ' ') {
					return null; // Don't create a body for spaces
				}
				const rect = el.getBoundingClientRect();
				const initialX = rect.left - titleRect.left + rect.width / 2;
				const initialY = rect.top - titleRect.top + rect.height / 2;

				return {
					body: Bodies.rectangle(
						initialX + (Math.random() - 0.5) * 20, // Randomize start X
						-50, // Start above the view
						rect.width,
						rect.height,
						{
							restitution: 0.4,
							friction: 0.5
						}
					),
					element: el,
					initialX,
					initialY
				};
			})
			.filter(Boolean) as {
			body: Matter.Body;
			element: HTMLElement;
			initialX: number;
			initialY: number;
		}[];

		// Add bodies to the world with a delay for a staggered effect
		letterData.forEach((letter, i) => {
			setTimeout(() => {
				Composite.add(world, letter.body);
			}, i * 50); // 50ms delay between each letter
		});

		const runner = Runner.create();
		Runner.run(runner, engine);

		(function update() {
			requestAnimationFrame(update);
			letterData.forEach(({ body, element, initialX, initialY }) => {
				const { x, y } = body.position;
				const angle = body.angle;
				element.style.transform = `translate(${x - initialX}px, ${y - initialY}px) rotate(${angle}rad)`;
			});
		})();

		return () => {
			Runner.stop(runner);
			Engine.clear(engine);
		};
	});
</script>

<section class="py-16 text-center md:py-24">
	<h1
		bind:this={heroTitle}
		class="font-poppins mb-4 flex flex-wrap justify-center text-4xl font-bold md:text-6xl"
	>
		{#each titleChars as char, i}
			<span bind:this={letterElements[i]} class="inline-block" style="white-space: pre;"
				>{char}</span
			>
		{/each}
	</h1>
	<p
		bind:this={heroSubtitle}
		class="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
	>
		A Passionate Web & GIS Developer from Indonesia. I enjoy learning new things — especially in
		programming, web development, and geospatial technology.
	</p>
	<div bind:this={heroButton} class="mt-8 flex justify-center gap-4">
		<Button href="#contact" size="lg">Contact Me</Button>
		<Button href="#work" variant="outline" size="lg">View My Work</Button>
	</div>
</section>
