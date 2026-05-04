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

	const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Body, Vector } = Matter;

	let engine: Matter.Engine;
	let runner: Matter.Runner;

	// Category Colors for Indicators
	const categoryColors: Record<string, string> = {
		'Frontend': '#FF3E00',
		'Backend': '#3b82f6',
		'GIS': '#10b981',
		'Tools': '#f59e0b'
	};

	// Official Tetris Colors (Neon Palette)
	const tetrisColors: Record<string, string> = {
		I: '#00f0f0', // Cyan
		L: '#f0a000', // Orange
		J: '#0000f0', // Blue
		O: '#f0f000', // Yellow
		T: '#a000f0', // Purple
		S: '#00f000', // Green
		Z: '#f00000'  // Red
	};

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

	const tetriminos = $derived.by(() => {
		const all: any[] = [];
		let currentSkillIndex = 0;
		const flatSkills = categories.flatMap(cat => 
			(cat.items || []).map(item => ({ ...item, catColor: categoryColors[cat.category] }))
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
			if (pieceSkills.length > 0) all.push({ shapeKey, color: tetrisColors[shapeKey], skills: pieceSkills });
		}
		return all;
	});

	onMount(() => {
		if (!container) return;

		const width = container.clientWidth;
		const height = 600;
		const blockSize = 45;

		engine = Engine.create();
		engine.gravity.y = 1.5; // Slightly faster fall for "solid" feel
		engine.enableSleeping = true;

		const world = engine.world;

		const wallOptions = { 
			isStatic: true, 
			friction: 0.8,
			restitution: 0.1,
			render: { visible: false } 
		};
		
		const ground = Bodies.rectangle(width / 2, height + 25, width, 50, wallOptions);
		const leftWall = Bodies.rectangle(-25, height / 2, 50, height, wallOptions);
		const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height, wallOptions);
		
		Composite.add(world, [ground, leftWall, rightWall]);

		const mouse = Mouse.create(container);
		const mouseConstraint = MouseConstraint.create(engine, {
			mouse: mouse,
			constraint: { stiffness: 0.1, render: { visible: false } }
		});
		Composite.add(world, mouseConstraint);

		let runner_cleanup = () => {
			Runner.stop(runner);
			Engine.clear(engine);
		};

		setTimeout(() => {
			const pieceBodies = tetriminos.map((piece, pieceIdx) => {
				const startX = Math.random() * (width - 200) + 100;
				const startY = -200 - pieceIdx * 280;

				const parts = piece.skills.map((skill: any) => {
					return Bodies.rectangle(
						startX + skill.relX * blockSize,
						startY + skill.relY * blockSize,
						blockSize - 1, // Minimize gaps
						blockSize - 1,
						{
							chamfer: { radius: 4 }, // Sharper corners for better stacking
							friction: 0.5,
							restitution: 0.1,
							density: 0.002
						}
					);
				});

				const body = Body.create({
					parts,
					frictionAir: 0.05, // More air resistance to prevent spinning
					angularDamping: 0.1,
					label: `piece-${pieceIdx}`
				});

				return { body, piece, id: pieceIdx };
			});

			pieceBodies.forEach(pb => Composite.add(world, pb.body));

			let rafId: number;
			function update() {
				pieceBodies.forEach((pb) => {
					// Start from 1 because index 0 is the parent composite body
					pb.body.parts.slice(1).forEach((part, partIdx) => {
						const skillId = `${pb.id}-${partIdx}`;
						const element = document.getElementById(`skill-block-${skillId}`);
						if (element) {
							const { x, y } = part.position;
							element.style.transform = `translate(${x - blockSize/2}px, ${y - blockSize/2}px) rotate(${pb.body.angle}rad)`;
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

<div class="relative mx-auto max-w-[450px]">
	<!-- Board Header -->
	<div class="mb-6 flex items-center justify-between px-2">
		<div class="flex flex-col">
			<span class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Power Level</span>
			<span class="font-mono text-3xl font-black italic text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]">S-RANK</span>
		</div>
		<div class="h-px flex-1 mx-6 bg-gradient-to-r from-transparent via-muted/50 to-transparent"></div>
		<div class="flex flex-col text-right">
			<span class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Tech System</span>
			<span class="font-mono text-xl font-black text-white/80">V2.0.4</span>
		</div>
	</div>

	<div 
		bind:this={container} 
		class="relative h-[650px] w-full overflow-hidden rounded-[2.5rem] border-8 border-muted/20 bg-[#050505] shadow-[0_0_50px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing"
	>
		<!-- Grid Overlay (Finer) -->
		<div class="pointer-events-none absolute inset-0 opacity-[0.15]" 
			style="background-image: linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px); background-size: 45px 45px;">
		</div>

		<!-- Scanline Effect -->
		<div class="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-20 opacity-30"></div>

		{#each tetriminos as piece, pIdx}
			{#each piece.skills as skill, sIdx}
				<div
					id="skill-block-{pIdx}-{sIdx}"
					class="absolute left-0 top-0 flex items-center justify-center rounded-sm border-[1px] shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] transition-opacity duration-300 group"
					style="width: 44.5px; height: 44.5px; background: linear-gradient(135deg, {piece.color}dd, {piece.color}aa); border-color: {piece.color}cc; opacity: 0; pointer-events: none;"
				>
					<!-- Category Indicator Dot -->
					<div class="absolute right-1 top-1 size-1.5 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.5)]" style="background-color: {skill.catColor}"></div>
					
					<div class="relative z-10 flex flex-col items-center justify-center p-1">
						{#if skill.icon}
							<div class="scale-[0.8] brightness-0 invert opacity-90 group-hover:scale-100 transition-transform">
								<Icon src={skill.icon} size={22} />
							</div>
						{:else}
							<span class="font-mono text-[7px] font-black text-white/90 leading-none text-center truncate w-full">{skill.name.slice(0,4)}</span>
						{/if}
					</div>
					
					<!-- Glow Effect -->
					<div class="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white,transparent)] group-hover:opacity-40 transition-opacity"></div>

					<!-- Tooltip -->
					<div class="pointer-events-none absolute bottom-[120%] left-1/2 mb-2 -translate-x-1/2 scale-0 rounded-md bg-black/90 border border-white/20 px-3 py-1.5 text-[10px] font-bold text-white shadow-2xl group-hover:scale-100 transition-transform whitespace-nowrap z-50">
						<span class="text-primary mr-1">[{skill.category}]</span> {skill.name}
					</div>
				</div>
			{/each}
		{/each}
	</div>

	<!-- Footer Indicators -->
	<div class="mt-6 flex justify-between px-8 opacity-30">
		{#each Array(4) as _, i}
			<div class="flex items-center gap-2">
				<div class="h-1.5 w-1.5 rounded-full" style="background-color: {Object.values(categoryColors)[i]}"></div>
				<span class="text-[8px] font-black uppercase tracking-widest">{Object.keys(categoryColors)[i]}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	/* Retro CRT-like flickering effect */
	@keyframes flicker {
		0% { opacity: 0.97; }
		5% { opacity: 0.95; }
		10% { opacity: 0.9; }
		15% { opacity: 0.95; }
		20% { opacity: 0.98; }
		100% { opacity: 1; }
	}
	
	[id^="skill-block-"] {
		box-shadow: inset 0 0 10px rgba(255,255,255,0.2), 0 0 5px rgba(0,0,0,0.3);
	}
</style>
