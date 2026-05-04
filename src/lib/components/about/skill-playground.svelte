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
	let activeCategory = $state<string | null>(null);

	const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Vector, Body } = Matter;

	let engine: Matter.Engine;
	let runner: Matter.Runner;
	let ground: Matter.Body;
	let rightWall: Matter.Body;

	const categories_list = ['Frontend', 'Backend', 'GIS', 'Tools'];

	// Flatten categories into items with category colors
	const categoryColors: Record<string, string> = {
		'Frontend': '#0d9488', // Teal
		'Backend': '#3b82f6',  // Blue
		'GIS': '#8b5cf6',      // Purple
		'Tools': '#64748b'     // Slate
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
		// Lower gravity for more "floaty" feel during sorting
		engine.gravity.y = 0.8;
		
		const world = engine.world;

		// Walls
		const wallOptions = { isStatic: true, render: { visible: false }, friction: 0.5 };
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
					frictionAir: 0.02,
					chamfer: { radius: elHeight / 2 },
					label: `skill-${i}`
				});

				return { body, skill, id: i, width: elWidth, height: elHeight };
			});

			skillBodies.forEach((sb) => {
				Composite.add(world, sb.body);
				const element = items[sb.id];
				if (element) element.style.opacity = '1';
			});

			let rafId: number;
			function update() {
				// Apply magnetic forces if a category is selected
				if (activeCategory) {
					const centerX = width / 2;
					const centerY = height / 2;
					
					skillBodies.forEach((sb) => {
						if (sb.skill.category === activeCategory) {
							// Pull to center
							const force = Vector.sub({ x: centerX, y: centerY }, sb.body.position);
							const distance = Vector.magnitude(force);
							if (distance > 10) {
								const normalizedForce = Vector.normalise(force);
								Body.applyForce(sb.body, sb.body.position, Vector.mult(normalizedForce, 0.005 * sb.body.mass));
							}
						} else {
							// Push others away slightly or just let them fall
							const force = Vector.sub(sb.body.position, { x: centerX, y: centerY });
							const distance = Vector.magnitude(force);
							if (distance < 200) {
								const normalizedForce = Vector.normalise(force);
								Body.applyForce(sb.body, sb.body.position, Vector.mult(normalizedForce, 0.002 * sb.body.mass));
							}
						}
					});
				}

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

			const originalCleanup = runner_cleanup;
			runner_cleanup = () => {
				originalCleanup();
				cancelAnimationFrame(rafId);
			};
		}, 100);

		runner = Runner.create();
		Runner.run(runner, engine);

		const handleResize = () => {
			if (!container) return;
			width = container.clientWidth;
			Matter.Body.setPosition(ground, { x: width / 2, y: height + 10 });
			Matter.Body.setPosition(rightWall, { x: width + 10, y: height / 2 });
		};
		window.addEventListener('resize', handleResize);

		return () => {
			runner_cleanup();
			window.removeEventListener('resize', handleResize);
		};
	});

	function toggleCategory(cat: string) {
		if (activeCategory === cat) {
			activeCategory = null;
		} else {
			activeCategory = cat;
			// Small jump effect when sorting starts
			Composite.allBodies(engine.world).forEach(body => {
				if (!body.isStatic) {
					Body.applyForce(body, body.position, { x: (Math.random() - 0.5) * 0.05, y: -0.05 });
				}
			});
		}
	}
</script>

<div class="space-y-6">
	<!-- Category Filters -->
	<div class="flex flex-wrap justify-end gap-2 px-4">
		<button 
			onclick={() => activeCategory = null}
			class="rounded-full px-6 py-2 text-xs font-black uppercase tracking-widest transition-all {activeCategory === null ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted hover:bg-muted/80'}"
		>
			All Stack
		</button>
		{#each categories_list as cat}
			<button 
				onclick={() => toggleCategory(cat)}
				class="rounded-full px-6 py-2 text-xs font-black uppercase tracking-widest transition-all {activeCategory === cat ? 'shadow-lg text-white' : 'bg-muted hover:bg-muted/80'}"
				style={activeCategory === cat ? `background-color: ${categoryColors[cat]}` : ''}
			>
				{cat}
			</button>
		{/each}
	</div>

	<div 
		bind:this={container} 
		class="relative h-[500px] w-full overflow-hidden rounded-[3rem] border bg-muted/10 backdrop-blur-md cursor-grab active:cursor-grabbing shadow-inner"
	>
		<!-- Instruction -->
		<div class="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20">
			<div class="text-center space-y-2">
				{#if activeCategory}
					<p class="text-3xl font-black uppercase italic tracking-tighter text-primary/30">
						Filtering {activeCategory}
					</p>
				{:else}
					<p class="text-sm font-black uppercase tracking-[0.3em]">
						Interactive Stack
					</p>
					<p class="text-xs font-medium uppercase tracking-widest">
						Drag & Toss to Explore
					</p>
				{/if}
			</div>
		</div>

		{#each allSkills as skill, i (i)}
			<div
				bind:this={items[i]}
				class="absolute left-0 top-0 flex items-center gap-3 rounded-full border bg-card px-5 py-3 shadow-md transition-all duration-300 hover:border-primary/50 group whitespace-nowrap"
				style="pointer-events: none; opacity: 0; {activeCategory && skill.category !== activeCategory ? 'filter: grayscale(1) opacity(0.3); scale: 0.9;' : ''}"
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
</div>

<style>
</style>
