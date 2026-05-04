<script lang="ts">
	import { onMount } from 'svelte';
	import Matter from 'matter-js';
	import type { Tag } from '$lib/types';
	import Icon from '@/lib/components/ui/icon.svelte';
	import { fade, scale } from 'svelte/transition';

	interface LocalizedCategory {
		category: string;
		items: Tag[];
	}

	let { categories }: { categories: LocalizedCategory[] } = $props();

	let container: HTMLElement;
	let activeFilter = $state<string | null>(null);
	let comboCount = $state(0);

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
		I: '#00f0f0', L: '#f0a000', J: '#0000f0', O: '#f0f000', T: '#a000f0', S: '#00f000', Z: '#f00000'
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
			(cat.items || []).map(item => ({ ...item, category: cat.category, catColor: categoryColors[cat.category] }))
		);

		while (currentSkillIndex < flatSkills.length) {
			const shapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
			const shapeCoords = shapes[shapeKey];
			const pieceSkills: any[] = [];
			for (let i = 0; i < shapeCoords.length; i++) {
				if (currentSkillIndex < flatSkills.length) {
					pieceSkills.push({ ...flatSkills[currentSkillIndex], relX: shapeCoords[i][0], relY: shapeCoords[i][1] });
					currentSkillIndex++;
				}
			}
			if (pieceSkills.length > 0) all.push({ shapeKey, color: tetrisColors[shapeKey], skills: pieceSkills });
		}
		return all;
	});

	let pieceBodies: any[] = [];

	function rotatePiece(id: number) {
		const pb = pieceBodies.find(p => p.id === id);
		if (pb) {
			Body.rotate(pb.body, Math.PI / 2);
			comboCount++;
			setTimeout(() => { if (comboCount > 0) comboCount--; }, 2000);
		}
	}

	function resetBoard() {
		if (!engine) return;
		Composite.clear(engine.world, false, true);
		initWalls();
		spawnSequentially();
	}

	function initWalls() {
		const width = container.clientWidth;
		const height = 650;
		const wallOptions = { isStatic: true, friction: 0.8, restitution: 0.1, render: { visible: false } };
		const ground = Bodies.rectangle(width / 2, height + 25, width, 50, wallOptions);
		const leftWall = Bodies.rectangle(-25, height / 2, 50, height, wallOptions);
		const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height, wallOptions);
		Composite.add(engine.world, [ground, leftWall, rightWall]);
	}

	function spawnSequentially() {
		const width = container.clientWidth;
		const blockSize = 45;
		pieceBodies = [];

		tetriminos.forEach((piece, pieceIdx) => {
			setTimeout(() => {
				const startX = Math.random() * (width - 200) + 100;
				const startY = -100;
				const parts = piece.skills.map((skill: any) => 
					Bodies.rectangle(startX + skill.relX * blockSize, startY + skill.relY * blockSize, blockSize - 1, blockSize - 1, {
						chamfer: { radius: 4 }, friction: 0.5, restitution: 0.1, density: 0.002
					})
				);
				const body = Body.create({ parts, frictionAir: 0.05, angularDamping: 0.1, label: `piece-${pieceIdx}` });
				const pb = { body, piece, id: pieceIdx };
				pieceBodies.push(pb);
				Composite.add(engine.world, body);
			}, pieceIdx * 800); // Spawn every 800ms
		});
	}

	onMount(() => {
		if (!container) return;
		const width = container.clientWidth;
		const blockSize = 45;

		engine = Engine.create();
		engine.gravity.y = 1.5;
		engine.enableSleeping = true;

		initWalls();

		const mouse = Mouse.create(container);
		const mouseConstraint = MouseConstraint.create(engine, {
			mouse: mouse,
			constraint: { stiffness: 0.1, render: { visible: false } }
		});
		Composite.add(engine.world, mouseConstraint);

		// Handle Click to Rotate
		Matter.Events.on(mouseConstraint, 'mousedown', (event) => {
			if (event.source.body) {
				const bodyLabel = event.source.body.label;
				if (bodyLabel?.startsWith('piece-')) {
					const id = parseInt(bodyLabel.split('-')[1]);
					rotatePiece(id);
				}
			}
		});

		spawnSequentially();

		let rafId: number;
		function update() {
			pieceBodies.forEach((pb) => {
				pb.body.parts.slice(1).forEach((part, partIdx) => {
					const skillId = `${pb.id}-${partIdx}`;
					const element = document.getElementById(`skill-block-${skillId}`);
					if (element) {
						const { x, y } = part.position;
						element.style.transform = `translate(${x - blockSize/2}px, ${y - blockSize/2}px) rotate(${pb.body.angle}rad)`;
						element.style.opacity = '1';
						
						// Highlight logic
						const skill = pb.piece.skills[partIdx];
						if (activeFilter && skill.category === activeFilter) {
							element.classList.add('filter-active');
						} else {
							element.classList.remove('filter-active');
						}
					}
				});
			});
			rafId = requestAnimationFrame(update);
		}
		update();

		runner = Runner.create();
		Runner.run(runner, engine);
		return () => {
			Runner.stop(runner);
			Engine.clear(engine);
			cancelAnimationFrame(rafId);
		};
	});
</script>

<div class="relative mx-auto max-w-[450px]">
	<!-- Board Header -->
	<div class="mb-6 flex items-center justify-between px-2">
		<div class="flex flex-col">
			<span class="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Power Level</span>
			<div class="flex items-baseline gap-2">
				<span class="font-mono text-3xl font-black italic text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]">S-RANK</span>
				{#if comboCount > 2}
					<span in:scale class="text-xs font-black text-yellow-400 animate-bounce">X{comboCount} COMBO!</span>
				{/if}
			</div>
		</div>
		<button 
			onclick={resetBoard}
			class="group flex flex-col items-center gap-1 transition-opacity hover:opacity-100 opacity-60"
		>
			<div class="size-8 rounded-full border-2 border-primary flex items-center justify-center group-hover:rotate-180 transition-transform duration-500">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
			</div>
			<span class="text-[8px] font-black uppercase tracking-tighter">System Reset</span>
		</button>
	</div>

	<div 
		bind:this={container} 
		class="relative h-[650px] w-full overflow-hidden rounded-[2.5rem] border-8 border-muted/20 bg-[#050505] shadow-[0_0_50px_rgba(0,0,0,0.8)] cursor-grab active:cursor-grabbing group/board"
	>
		<!-- Grid Overlay -->
		<div class="pointer-events-none absolute inset-0 opacity-[0.1]" 
			style="background-image: linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px); background-size: 45px 45px;">
		</div>

		<!-- Interactive Hint -->
		<div class="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center opacity-0 group-hover/board:opacity-20 transition-opacity duration-700">
			<span class="text-4xl font-black italic tracking-tighter text-white uppercase">Tap to Rotate</span>
			<span class="text-[10px] font-black tracking-widest text-white">Drag to Arrange</span>
		</div>

		{#each tetriminos as piece, pIdx}
			{#each piece.skills as skill, sIdx}
				<div
					id="skill-block-{pIdx}-{sIdx}"
					class="absolute left-0 top-0 flex items-center justify-center rounded-sm border-[1px] shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300 group"
					style="width: 44.5px; height: 44.5px; background: linear-gradient(135deg, {piece.color}dd, {piece.color}aa); border-color: {piece.color}cc; opacity: 0; pointer-events: none;"
				>
					<div class="absolute right-1 top-1 size-1.5 rounded-full" style="background-color: {skill.catColor}"></div>
					<div class="relative z-10 flex flex-col items-center justify-center p-1">
						{#if skill.icon}
							<div class="scale-[0.85] brightness-0 invert opacity-90">
								<Icon src={skill.icon} size={22} />
							</div>
						{:else}
							<span class="font-mono text-[7px] font-black text-white/90 leading-none">{skill.name.slice(0,4)}</span>
						{/if}
					</div>
					<div class="absolute inset-0 opacity-0 bg-white group-hover:opacity-30 transition-opacity"></div>
				</div>
			{/each}
		{/each}
	</div>

	<!-- Interactive Footer Indicators -->
	<div class="mt-6 flex justify-between px-4 sm:px-8">
		{#each Object.keys(categoryColors) as cat}
			<button 
				onclick={() => activeFilter = activeFilter === cat ? null : cat}
				class="flex items-center gap-2 px-2 py-1 rounded-md transition-all {activeFilter === cat ? 'bg-white/10 scale-110 shadow-lg' : 'opacity-40 hover:opacity-70'}"
			>
				<div class="h-2 w-2 rounded-full shadow-[0_0_8px_currentcolor]" style="background-color: {categoryColors[cat]}; color: {categoryColors[cat]}"></div>
				<span class="text-[9px] font-black uppercase tracking-widest text-white">{cat}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.filter-active {
		box-shadow: 0 0 25px rgba(255, 255, 255, 0.6) !important;
		z-index: 40 !important;
		filter: brightness(1.5) !important;
		scale: 1.1;
	}

	[id^="skill-block-"] {
		will-change: transform;
	}
</style>
