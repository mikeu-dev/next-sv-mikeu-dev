<script lang="ts">
	import { onMount } from 'svelte';
	import Matter, { type IChamferableBodyDefinition } from 'matter-js';
	import Button from '@/lib/components/ui/button/button.svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import * as m from '@/lib/paraglide/messages';
	import { skills } from '@/lib/data/skills';
	import { getLocale } from '@/lib/paraglide/runtime';

	let locale = $state<string>(getLocale());
	let skillsData = $derived(skills[locale]||skills['en']);

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

		ScrollTrigger.refresh();
		gsap.from(heroSubtitle, { y: 20, opacity: 0, duration: 0.5, delay: 1.5 });
		gsap.from(heroButton, { y: 20, opacity: 0, duration: 0.5, delay: 1.7 });
		gsap.from(bulletContainer, { y: 20, opacity: 0, duration: 0.5, delay: 1.8, stagger: 0.1 });

		const engine = Engine.create();
		const world: Matter.World = engine.world;
		engine.gravity.y = 1.0;

		const titleRect: DOMRect = heroTitle.getBoundingClientRect();
		const subtitleRect: DOMRect = heroSubtitle.getBoundingClientRect();

		const wallOptions: IChamferableBodyDefinition = { isStatic: true, render: { visible: false } };

		const floorY = subtitleRect.top - titleRect.top - 40;
		const floor = Bodies.rectangle(titleRect.width / 2, floorY, titleRect.width, 20, wallOptions);
		const wallLeft = Bodies.rectangle(
			-50, 
			titleRect.height / 2,
			20, 
			titleRect.height + 100, 
			{ isStatic: true, render: { visible: false } }
		);

		const wallRight = Bodies.rectangle(
			titleRect.width + 50, 
			titleRect.height / 2,
			20,
			titleRect.height + 100,
			{ isStatic: true, render: { visible: false } }
		);

		Composite.add(world, [floor, wallLeft, wallRight]);

		const letters: LetterData[] = letterElements
			.map((el, i) => {
				if (titleChars[i] === ' ') return null;

				const rect = el.getBoundingClientRect();
				const initialX = rect.left - titleRect.left + rect.width / 2;
				const initialY = rect.top - titleRect.top + rect.height / 2;

				const body = Bodies.rectangle(
					initialX,
					initialY - 150 - Math.random() * 50,
					rect.width,
					rect.height,
					{
						restitution: 0.5,
						friction: 0.5,
						frictionAir: 0.015
					}
				);

				return { body, element: el, initialX, initialY };
			})
			.filter((v): v is LetterData => v !== null);

		letters.forEach((letter, i) => {
			setTimeout(() => Composite.add(world, letter.body), i * 80);
		});

		const runner = Runner.create();
		Runner.run(runner, engine);

		function update() {
			requestAnimationFrame(update);
			for (const { body, element, initialX, initialY } of letters) {
				const { x, y } = body.position;
				const angle = body.angle;
				element.style.transform = `translate(${x - initialX}px, ${y - initialY}px) rotate(${angle}rad)`;
			}
		}
		update();

		heroTitle.style.position = 'relative';
		heroTitle.style.overflow = 'visible';

		const heroSection = heroTitle.closest('section');
		if (heroSection) {
			gsap.fromTo(
				heroSection,
				{ backgroundColor: '#0d9488' }, 
				{ backgroundColor: '', duration: 2, delay: 0.5 }
			);
		}

		return () => {
			Runner.stop(runner);
			Engine.clear(engine);
		};
	});
</script>

<section
	id="hero"
	class="relative flex min-h-screen flex-col items-center justify-start overflow-hidden
    rounded-t-4xl bg-gradient-to-b from-gray-50 to-white pt-28 pb-20 text-center
    transition-colors duration-300 md:pt-40 dark:from-gray-900 dark:to-background mt-20"
>
	<canvas id="particles" class="pointer-events-none absolute inset-0 h-full w-full"></canvas>

	<div class="relative mx-auto inline-block" style="height: 150px;">
		<h1
			bind:this={heroTitle}
			class="font-poppins mb-4 flex flex-wrap justify-center
        text-[3rem] leading-[1.1] font-extrabold text-gray-900
        drop-shadow-sm md:text-[5rem] dark:text-gray-100"
		>
			{#each titleChars as char, i}
				<span bind:this={letterElements[i]} class="inline-block" style="white-space: pre;">
					{char}
				</span>
			{/each}
		</h1>
	</div>

	<p
		bind:this={heroSubtitle}
		class="mx-auto max-w-2xl text-lg leading-relaxed
        text-gray-600 transition-colors duration-300 md:text-xl dark:text-gray-300"
	>
		{m.hero_subtitle()}
	</p>

	<ul
		bind:this={bulletContainer}
		class="mt-6 flex flex-wrap justify-center gap-4 text-sm
        text-gray-600 transition-colors duration-300 md:text-base dark:text-gray-300"
	>
		{#each skillsData as skill}
			<li class="inline-flex items-center gap-2">
				<span class="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400"></span>
				{skill}
			</li>
		{/each}
	</ul>

	<div bind:this={heroButton} class="mt-8 flex justify-center gap-4">
		<Button
			href="#contact"
			size="lg"
			class="dark:bg-teal-500 dark:text-white dark:hover:bg-teal-400"
		>
			{m.hero_button_text()}
		</Button>
		<Button
			href="#work"
			variant="outline"
			size="lg"
			class="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
		>
			{m.hero_button_link()}
		</Button>
	</div>
</section>
