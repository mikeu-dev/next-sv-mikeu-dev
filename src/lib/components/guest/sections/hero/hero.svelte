<script lang="ts">
	import { onMount } from 'svelte';
	import Matter, { type IChamferableBodyDefinition } from 'matter-js';
	import Button from '@/lib/components/ui/button/button.svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import * as m from '@/lib/paraglide/messages';
	import { skills } from '@/lib/data/skills';
	const { Engine, Runner, Bodies, Composite } = Matter;

	let heroTitle: HTMLElement;
	let heroSubtitle: HTMLElement;
	let heroButton: HTMLElement;
	let bulletContainer: HTMLElement;
	let letterElements: HTMLElement[] = [];

	const titleText: string = m.hero_title();
	const titleChars: string[] = titleText.split('');

	interface LetterData {
		body: Matter.Body;
		element: HTMLElement;
		initialX: number;
		initialY: number;
	}

	onMount(() => {
		ScrollTrigger.refresh();
		gsap.from(heroSubtitle, { y: 20, opacity: 0, duration: 0.5, delay: 0.2 });
		gsap.from(heroButton, { y: 20, opacity: 0, duration: 0.5, delay: 0.3 });
		gsap.from(bulletContainer, { y: 20, opacity: 0, duration: 0.5, delay: 0.4, stagger: 0.1 });

		// --- Matter.js setup ---
		const engine = Engine.create();
		const world: Matter.World = engine.world;
		engine.gravity.y = 1.0;

		const titleRect: DOMRect = heroTitle.getBoundingClientRect();
		const subtitleRect: DOMRect = heroSubtitle.getBoundingClientRect();

		const wallOptions: IChamferableBodyDefinition = { isStatic: true, render: { visible: false } };

		// 🧱 Lantai di atas subtitle
		const floorY: number = subtitleRect.top - titleRect.top - 40;
		const floor: Matter.Body = Bodies.rectangle(
			titleRect.width / 2,
			floorY,
			titleRect.width,
			20,
			wallOptions
		);
		Composite.add(world, floor);

		// 🔤 Huruf-huruf fisik
		const letters: LetterData[] = letterElements
			.map((el: HTMLElement, i: number) => {
				if (titleChars[i] === ' ') return null;

				const rect: DOMRect = el.getBoundingClientRect();
				const initialX: number = rect.left - titleRect.left + rect.width / 2;
				const initialY: number = rect.top - titleRect.top + rect.height / 2;

				const body: Matter.Body = Bodies.rectangle(
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
			setTimeout(() => Composite.add(world, letter.body), i * 50);
		});

		const runner = Runner.create();
		Runner.run(runner, engine);

		function update(): void {
			requestAnimationFrame(update);
			for (const { body, element, initialX, initialY } of letters) {
				const { x, y } = body.position;
				const angle: number = body.angle;
				element.style.transform = `translate(${x - initialX}px, ${y - initialY}px) rotate(${angle}rad)`;
			}
		}
		update();

		heroTitle.style.position = 'relative';
		heroTitle.style.overflow = 'visible';

		return () => {
			Runner.stop(runner);
			Engine.clear(engine);
		};
	});
</script>

<section
	id="hero"
	class="relative flex min-h-screen flex-col items-center justify-start overflow-hidden bg-gradient-to-b from-gray-50 to-white pt-28 pb-20 text-center md:pt-40"
>
  <!-- SVG Clip -->
  <svg
    class="absolute top-0 left-0 w-full h-full pointer-events-none"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
  >
    <path
      d="
        M0,0
        V8
        A2,2 0 0 1 2,6
        H8
        V0
        Z
        M100,0
        V8
        A2,2 0 0 0 98,6
        H92
        V0
        Z
        M100,100
        H0
        V100
        Z
      "
      fill="white"
      vector-effect="non-scaling-stroke"
    />
  </svg>

  <!-- Background Partikel -->
  <canvas id="particles" class="pointer-events-none absolute inset-0 h-full w-full"></canvas>

  <!-- Konten hero -->
  <div class="relative mx-auto inline-block" style="height: 150px;">
    <h1
      bind:this={heroTitle}
      class="font-poppins mb-4 flex flex-wrap justify-center text-[3rem] leading-[1.1] font-extrabold md:text-[5rem]"
    >
      {#each titleChars as char, i}
        <span
          bind:this={letterElements[i]}
          class="inline-block drop-shadow-sm"
          style="white-space: pre;"
        >
          {char}
        </span>
      {/each}
    </h1>
  </div>

  <p
    bind:this={heroSubtitle}
    class="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
  >
    {m.hero_subtitle()}
  </p>

  <ul
    bind:this={bulletContainer}
    class="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground md:text-base"
  >
    {#each skills as skill}
      <li class="inline-flex items-center gap-2">
        <span class="h-2 w-2 rounded-full bg-blue-500"></span>
        {skill}
      </li>
    {/each}
  </ul>

  <div bind:this={heroButton} class="mt-8 flex justify-center gap-4">
    <Button href="#contact" size="lg">{m.hero_button_text()}</Button>
    <Button href="#work" variant="outline" size="lg">{m.hero_button_link()}</Button>
  </div>
</section>


