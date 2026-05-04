<script lang="ts">
	import { onMount } from 'svelte';
	import Matter from 'matter-js';
	import type { Tag } from '$lib/types';
	import Icon from '@/lib/components/ui/icon.svelte';

	interface LocalizedCategory {
		category: string;
		items: Tag[];
	}

	let { categories }: { categories: LocalizedCategory[] } = $props();

	let container: HTMLElement;
	let items: HTMLElement[] = $state([]);

	const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint } = Matter;

	let engine: Matter.Engine;
	let runner: Matter.Runner;
	let ground: Matter.Body;
	let rightWall: Matter.Body;

	// Flatten categories into items with category colors
	const categoryColors: Record<string, string> = {
		'Frontend': '#0d9488',
		'Backend': '#3b82f6',
		'GIS': '#8b5cf6',
		'Tools': '#64748b'
	};

	const allSkills = $derived(
		categories.flatMap((cat) => (cat.items || []).map((item: Tag) => ({ 
			...item, 
			category: cat.category,
			color: categoryColors[cat.category] || '#primary'
		})))
	);

	onMount(() => {
		if (!container) return;

		let width = container.clientWidth;
		let height = 500;

		engine = Engine.create();
		const world = engine.world;

		// Walls
		const wallOptions = { isStatic: true, render: { visible: false } };
		ground = Bodies.rectangle(width / 2, height + 10, width + 1000, 20, wallOptions);
		const leftWall = Bodies.rectangle(-10, height / 2, 20, height, wallOptions);
		rightWall = Bodies.rectangle(width + 10, height / 2, 20, height, wallOptions);
		const ceiling = Bodies.rectangle(width / 2, -500, width, 20, wallOptions);

		Composite.add(world, [ground, leftWall, rightWall, ceiling]);

		// Mouse interaction
		const mouse = Mouse.create(container);
		const mouseConstraint = MouseConstraint.create(engine, {
			mouse: mouse,
			constraint: {
				stiffness: 0.2,
				render: { visible: false }
			}
		});

		Composite.add(world, mouseConstraint);

		let runner_cleanup = () => {
			Runner.stop(runner);
			Engine.clear(engine);
		};

		// Create bodies after a short delay to ensure elements are rendered and measured
		setTimeout(() => {
			const skillBodies = allSkills.map((skill, i) => {
				const element = items[i];
				const elWidth = element ? element.offsetWidth : 120;
				const elHeight = element ? element.offsetHeight : 40;
				
				const x = Math.random() * width;
				const y = -100 - i * 40;
				
				const body = Bodies.rectangle(x, y, elWidth, elHeight, {
					restitution: 0.6,
					friction: 0.1,
					chamfer: { radius: elHeight / 2 },
					label: `skill-${i}`
				});

				return { body, skill, id: i, width: elWidth, height: elHeight };
			});

			skillBodies.forEach((sb) => {
				Composite.add(world, sb.body);
				// Make element visible now that physics takes over
				const element = items[sb.id];
				if (element) element.style.opacity = '1';
			});

			let rafId: number;
			function update() {
				skillBodies.forEach((sb) => {
					const element = items[sb.id];
					if (element) {
						const { x, y } = sb.body.position;
						element.style.transform = `translate(${x - sb.width / 2}px, ${y - sb.height / 2}px) rotate(${sb.body.angle}rad)`;
					}
				});
				rafId = requestAnimationFrame(update);
			}
			update();

			// Cleanup RAF on destroy (handled by the outer return)
			const originalCleanup = runner_cleanup;
			runner_cleanup = () => {
				originalCleanup();
				cancelAnimationFrame(rafId);
			};
		}, 100);

		runner = Runner.create();
		Runner.run(runner, engine);

		// Resize handler
		const handleResize = () => {
			if (!container) return;
			const newWidth = container.clientWidth;
			Matter.Body.setPosition(ground, { x: newWidth / 2, y: height + 10 });
			Matter.Body.setPosition(rightWall, { x: newWidth + 10, y: height / 2 });
		};
		window.addEventListener('resize', handleResize);

		return () => {
			runner_cleanup();
			window.removeEventListener('resize', handleResize);
		};
	});
</script>

<div 
	bind:this={container} 
	class="relative h-[500px] w-full overflow-hidden rounded-[3rem] border bg-muted/10 backdrop-blur-md cursor-grab active:cursor-grabbing shadow-inner"
>
	<!-- Instruction -->
	<div class="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20">
		<div class="text-center space-y-2">
			<p class="text-sm font-black uppercase tracking-[0.3em]">
				Interactive Stack
			</p>
			<p class="text-xs font-medium uppercase tracking-widest">
				Drag & Toss to Explore
			</p>
		</div>
	</div>

	{#each allSkills as skill, i (i)}
		<div
			bind:this={items[i]}
			class="absolute left-0 top-0 flex items-center gap-3 rounded-full border bg-card px-5 py-3 shadow-md transition-colors hover:border-primary/50 group whitespace-nowrap"
			style="pointer-events: none; opacity: 0;"
		>
			<div class="absolute inset-0 rounded-full opacity-0 group-hover:opacity-10 transition-opacity" style="background-color: {skill.color}"></div>
			{#if skill.icon}
				<Icon src={skill.icon} size={18} />
			{:else}
				<div class="size-2.5 rounded-full" style="background-color: {skill.color}"></div>
			{/if}
			<span class="text-xs font-black uppercase tracking-tight">
				{skill.name}
			</span>
		</div>
	{/each}
</div>

<style>
</style>
