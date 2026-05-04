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

	const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Body } = Matter;

	let engine: Matter.Engine;
	let runner: Matter.Runner;

	const categoryColors: Record<string, string> = {
		'Frontend': '#FF3E00', // Svelte Orange
		'Backend': '#3b82f6',  // Blue
		'GIS': '#10b981',      // Emerald
		'Tools': '#f59e0b'     // Amber
	};

	// Tetris shape definitions (relative coordinates)
	const shapes = {
		I: [[0, 0], [1, 0], [2, 0], [3, 0]],
		L: [[0, 0], [0, 1], [0, 2], [1, 2]],
		J: [[1, 0], [1, 1], [1, 2], [0, 2]],
		O: [[0, 0], [1, 0], [0, 1], [1, 1]],
		T: [[0, 0], [1, 0], [2, 0], [1, 1]],
		S: [[1, 0], [2, 0], [0, 1], [1, 1]],
		Z: [[0, 0], [1, 0], [1, 1], [2, 1]]
	};

	const shapeKeys = Object.keys(shapes) as Array<keyof typeof shapes>;

	// Group skills into Tetriminos
	const tetriminos = $derived.by(() => {
		const all: any[] = [];
		let currentSkillIndex = 0;
		
		// Flatten skills first
		const flatSkills = categories.flatMap(cat => 
			(cat.items || []).map(item => ({ ...item, color: categoryColors[cat.category] || '#ccc' }))
		);

		while (currentSkillIndex < flatSkills.length) {
			const shapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
			const shapeCoords = shapes[shapeKey];
			const pieceSkills: any[] = [];
			
			for (let i = 0; i < shapeCoords.length; i++) {
				if (currentSkillIndex < flatSkills.length) {
					pieceSkills.push({
						...flatSkills[currentSkillIndex],
						relX: shapeCoords[i][0],
						relY: shapeCoords[i][1]
					});
					currentSkillIndex++;
				}
			}
			
			if (pieceSkills.length > 0) {
				all.push({ shapeKey, skills: pieceSkills });
			}
		}
		return all;
	});

	onMount(() => {
		if (!container) return;

		const width = container.clientWidth;
		const height = 600;
		const blockSize = 45; // Size of each skill block

		engine = Engine.create();
		engine.gravity.y = 1.2;

		const world = engine.world;

		// Walls (Tetris Board Style)
		const wallOptions = { isStatic: true, render: { visible: false }, friction: 0.5 };
		const ground = Bodies.rectangle(width / 2, height + 25, width, 50, wallOptions);
		const leftWall = Bodies.rectangle(-25, height / 2, 50, height, wallOptions);
		const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height, wallOptions);
		
		Composite.add(world, [ground, leftWall, rightWall]);

		// Mouse interaction
		const mouse = Mouse.create(container);
		const mouseConstraint = MouseConstraint.create(engine, {
			mouse: mouse,
			constraint: { stiffness: 0.2, render: { visible: false } }
		});
		Composite.add(world, mouseConstraint);

		let runner_cleanup = () => {
			Runner.stop(runner);
			Engine.clear(engine);
		};

		// Create Tetrimino bodies
		setTimeout(() => {
			const pieceBodies = tetriminos.map((piece, pieceIdx) => {
				const startX = Math.random() * (width - 150) + 75;
				const startY = -200 - pieceIdx * 250;

				const parts = piece.skills.map((skill: any) => {
					return Bodies.rectangle(
						startX + skill.relX * blockSize,
						startY + skill.relY * blockSize,
						blockSize - 2, // Small gap
						blockSize - 2,
						{
							chamfer: { radius: 8 },
							render: { fillStyle: skill.color }
						}
					);
				});

				const body = Body.create({
					parts,
					restitution: 0.2,
					friction: 0.8,
					label: `piece-${pieceIdx}`
				});

				return { body, piece, id: pieceIdx };
			});

			pieceBodies.forEach(pb => Composite.add(world, pb.body));

			let rafId: number;
			function update() {
				pieceBodies.forEach((pb) => {
					pb.body.parts.slice(1).forEach((part, partIdx) => {
						const skillId = `${pb.id}-${partIdx}`;
						const element = document.getElementById(`skill-block-${skillId}`);
						if (element) {
							const { x, y } = part.position;
							element.style.transform = `translate(${x - (blockSize-2)/2}px, ${y - (blockSize-2)/2}px) rotate(${pb.body.angle}rad)`;
							element.style.opacity = '1';
						}
					});
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

		return () => runner_cleanup();
	});
</script>

<div class="relative mx-auto max-w-md">
	<!-- Board Header -->
	<div class="mb-4 flex items-center justify-between px-4">
		<div class="flex flex-col">
			<span class="text-[10px] font-black uppercase tracking-widest opacity-40">Skill Level</span>
			<span class="font-mono text-2xl font-black italic text-primary">LVL 99</span>
		</div>
		<div class="h-px flex-1 mx-4 bg-muted/30"></div>
		<div class="flex flex-col text-right">
			<span class="text-[10px] font-black uppercase tracking-widest opacity-40">Next Stack</span>
			<span class="font-mono text-xl font-black">NEXT GEN</span>
		</div>
	</div>

	<div 
		bind:this={container} 
		class="relative h-[600px] w-full overflow-hidden rounded-3xl border-4 border-muted bg-black/90 shadow-2xl cursor-grab active:cursor-grabbing"
	>
		<!-- Grid Overlay -->
		<div class="pointer-events-none absolute inset-0 opacity-10" 
			style="background-image: linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px); background-size: 45px 45px;">
		</div>

		<!-- Background Text -->
		<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
			<p class="text-4xl font-black uppercase italic tracking-tighter text-white/5 rotate-[-20deg]">
				Stack Your Skills
			</p>
		</div>

		{#each tetriminos as piece, pIdx}
			{#each piece.skills as skill, sIdx}
				<div
					id="skill-block-{pIdx}-{sIdx}"
					class="absolute left-0 top-0 flex items-center justify-center rounded-lg border-2 shadow-inner transition-opacity duration-300 group"
					style="width: 43px; height: 43px; background-color: {skill.color}22; border-color: {skill.color}; opacity: 0; pointer-events: none;"
					title={skill.name}
				>
					<div class="absolute inset-0 rounded-lg opacity-20" style="background-color: {skill.color}"></div>
					{#if skill.icon}
						<div class="z-10 scale-90 grayscale brightness-200 contrast-200">
							<Icon src={skill.icon} size={20} />
						</div>
					{:else}
						<span class="z-10 font-mono text-[8px] font-black text-white">{skill.name.slice(0,2)}</span>
					{/if}
					
					<!-- Tooltip on hover -->
					<div class="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 scale-0 rounded bg-white px-2 py-1 text-[10px] font-black text-black group-hover:scale-100 transition-transform whitespace-nowrap z-50">
						{skill.name}
					</div>
				</div>
			{/each}
		{/each}
	</div>

	<!-- Footer decoration -->
	<div class="mt-4 flex justify-center gap-1 opacity-20">
		{#each Array(10) as _}
			<div class="h-2 w-2 rounded-full bg-primary"></div>
		{/each}
	</div>
</div>

<style>
	/* Neon glow effect for active blocks */
	[id^="skill-block-"] {
		box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
	}
</style>
