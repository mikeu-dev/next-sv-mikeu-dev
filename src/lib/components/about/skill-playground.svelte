<script lang="ts">
	import { onMount } from 'svelte';
	import Matter from 'matter-js';
	import type { Tag } from '$lib/types';
	import Icon from '@/lib/components/ui/icon.svelte';
	import { fade, scale, fly } from 'svelte/transition';

	interface LocalizedCategory {
		category: string;
		items: Tag[];
	}

	let { categories }: { categories: LocalizedCategory[] } = $props();

	let container: HTMLElement;
	let activeFilter = $state<string | null>(null);
	let comboCount = $state(0);
	let nextPieceIdx = $state(1);
	let spawnedCount = $state(0);
	
	// Particle system
	let particles = $state<any[]>([]);

	const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Body, Vector, Events } = Matter;

	let engine: Matter.Engine;
	let runner: Matter.Runner;

	const categoryColors: Record<string, string> = {
		'Frontend': '#FF3E00', 'Backend': '#3b82f6', 'GIS': '#10b981', 'Tools': '#f59e0b'
	};

	const tetrisColors: Record<string, string> = {
		I: '#00f0f0', L: '#f0a000', J: '#0000f0', O: '#f0f000', T: '#a000f0', S: '#00f000', Z: '#f00000'
	};

	function isColorLight(hex: string) {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		const yiq = (r * 299 + g * 587 + b * 114) / 1000;
		return yiq >= 128;
	}

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
			if (pieceSkills.length > 0) {
				const color = tetrisColors[shapeKey];
				all.push({ 
					shapeKey, color, isLight: isColorLight(color), skills: pieceSkills 
				});
			}
		}
		return all;
	});

	let pieceBodies: any[] = [];

	function rotatePiece(id: number) {
		const pb = pieceBodies.find(p => p.id === id);
		if (pb) {
			Body.rotate(pb.body, Math.PI / 2);
			comboCount++;
			createParticles(pb.body.position.x, pb.body.position.y, pb.piece.color, 8);
			setTimeout(() => { if (comboCount > 0) comboCount--; }, 2000);
		}
	}

	function resetBoard() {
		if (!engine) return;
		Composite.clear(engine.world, false, true);
		spawnedCount = 0;
		nextPieceIdx = 1;
		particles = [];
		initWalls();
		spawnSequentially();
	}

	function shakeBoard() {
		pieceBodies.forEach(pb => {
			Body.applyForce(pb.body, pb.body.position, { 
				x: (Math.random() - 0.5) * 0.1 * pb.body.mass, 
				y: -0.15 * pb.body.mass 
			});
		});
		comboCount = 0;
	}

	function createParticles(x: number, y: number, color: string, count = 5) {
		for (let i = 0; i < count; i++) {
			particles.push({
				id: Math.random(),
				x, y,
				vx: (Math.random() - 0.5) * 8,
				vy: (Math.random() - 0.5) * 8,
				life: 1.0,
				color
			});
		}
		if (particles.length > 40) particles = particles.slice(-40);
	}

	function initWalls() {
		if (!container) return;
		const width = container.clientWidth;
		const height = container.clientHeight;
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
				if (engine) {
					Composite.add(engine.world, body);
					spawnedCount++;
					if (pieceIdx < tetriminos.length - 1) nextPieceIdx = pieceIdx + 1;
				}
			}, pieceIdx * 800);
		});
	}

	onMount(() => {
		if (!container) return;
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
		Matter.Events.on(mouseConstraint, 'mousedown', (event) => {
			if (event.source.body) {
				const bodyLabel = event.source.body.label;
				if (bodyLabel?.startsWith('piece-')) {
					const id = parseInt(bodyLabel.split('-')[1]);
					rotatePiece(id);
				}
			}
		});
		Events.on(engine, 'collisionStart', (event) => {
			event.pairs.forEach((pair) => {
				if (pair.collision.depth > 2) {
					const pos = pair.collision.supports[0] || pair.bodyA.position;
					const pieceA = pieceBodies.find(p => p.body === pair.bodyA || p.body === pair.bodyA.parent);
					createParticles(pos.x, pos.y, pieceA?.piece.color || '#ffffff', 2);
				}
			});
		});
		spawnSequentially();
		let rafId: number;
		function update() {
			particles = particles.map(p => ({
				...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.03, vy: p.vy + 0.2
			})).filter(p => p.life > 0);
			pieceBodies.forEach((pb) => {
				pb.body.parts.slice(1).forEach((part, partIdx) => {
					const element = document.getElementById(`skill-block-${pb.id}-${partIdx}`);
					if (element) {
						const { x, y } = part.position;
						element.style.transform = `translate(${x - 22.5}px, ${y - 22.5}px) rotate(${pb.body.angle}rad)`;
						element.style.opacity = '1';
						if (activeFilter && pb.piece.skills[partIdx].category === activeFilter) {
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
	<!-- Board Header HUD -->
	<div class="mb-8 flex items-end justify-between px-2">
		<div class="flex flex-col gap-1">
			<div class="flex items-center gap-2">
				<div class="h-1 w-3 bg-primary rounded-full"></div>
				<span class="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80">Career Matrix</span>
			</div>
			<div class="flex items-baseline gap-2">
				<span class="font-mono text-4xl font-black italic text-white">S-RANK</span>
				<div class="flex gap-1.5 mb-1">
					{#each Array(5) as _, i}
						<div class="h-1.5 w-1.5 rounded-sm {i < comboCount ? 'bg-yellow-400' : 'bg-white/10'} transition-all duration-500"></div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Holographic Next Piece Preview -->
		<div class="flex flex-col items-end gap-2">
			<span class="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Next Module</span>
			<div class="relative group/next">
				<div class="absolute -left-1 -top-1 size-1.5 border-l border-t border-primary/40"></div>
				<div class="absolute -right-1 -top-1 size-1.5 border-r border-t border-primary/40"></div>
				<div class="absolute -left-1 -bottom-1 size-1.5 border-l border-b border-primary/40"></div>
				<div class="absolute -right-1 -bottom-1 size-1.5 border-r border-b border-primary/40"></div>
				
				<div class="h-14 w-20 bg-white/[0.02] backdrop-blur-sm flex items-center justify-center overflow-hidden border border-white/5">
					<div class="absolute inset-x-0 h-[1px] bg-primary/20 z-10 animate-scanline"></div>
					{#key nextPieceIdx}
						<div in:scale={{ start: 0.9, duration: 300 }} class="grid gap-1" style="grid-template-columns: repeat(4, 8px);">
							{#each Array(16) as _, i}
								{@const x = i % 4}
								{@const y = Math.floor(i / 4)}
								{@const isFilled = tetriminos[nextPieceIdx]?.skills.some(s => s.relX === x && s.relY === y)}
								{#if isFilled}
									<div class="rounded-[1px]" style="background-color: {tetriminos[nextPieceIdx].color}"></div>
								{:else}
									<div class="size-0.5 bg-white/10 rounded-full"></div>
								{/if}
							{/each}
						</div>
					{/key}
				</div>
			</div>
		</div>
	</div>

	<div 
		bind:this={container} 
		class="relative h-[650px] w-full overflow-hidden rounded-[2.5rem] border-4 border-white/5 bg-[#010101] shadow-xl cursor-grab active:cursor-grabbing group/board"
	>
		<!-- CRT / Scanline Overlays -->
		<div class="pointer-events-none absolute inset-0 opacity-[0.05] z-30" 
			style="background-image: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%), linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06)); background-size: 100% 4px, 3px 100%;"></div>
		
		<!-- Particles Layer -->
		{#each particles as p (p.id)}
			<div class="absolute pointer-events-none z-10"
				style="left: {p.x}px; top: {p.y}px; width: 3px; height: 3px; background-color: {p.color}; opacity: {p.life}; transform: scale({p.life});"
			></div>
		{/each}

		<!-- HUD Status Elements -->
		<div class="pointer-events-none absolute inset-x-6 top-6 flex justify-between z-20 text-[8px] font-bold uppercase tracking-widest text-white/30">
			<div class="flex flex-col gap-1">
				<span>Integrity: 100%</span>
				<span>Uptime: {Math.floor(spawnedCount / tetriminos.length * 100)}%</span>
			</div>
			<div class="text-right flex flex-col gap-1">
				<span>Kernel: V0.19</span>
				<span>Interface: Optimized</span>
			</div>
		</div>

		<!-- Interactive Hints -->
		<div class="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center opacity-0 group-hover/board:opacity-20 transition-opacity duration-1000">
			<span class="text-5xl font-black italic tracking-tighter text-white uppercase">Sync Ready</span>
			<span class="text-[9px] font-black tracking-[0.5em] text-white">INTERACT TO EXPLORE</span>
		</div>

		{#each tetriminos as piece, pIdx}
			{#each piece.skills as skill, sIdx}
				<div id="skill-block-{pIdx}-{sIdx}"
					class="absolute left-0 top-0 flex items-center justify-center rounded-sm border-[1px] transition-all duration-300 group"
					class:text-black={piece.isLight}
					class:text-white={!piece.isLight}
					style="width: 44.5px; height: 44.5px; background: {piece.color}dd; border-color: {piece.color}; opacity: 0; pointer-events: none;"
				>
					<div class="absolute right-1 top-1 size-1 rounded-full" style="background-color: {skill.catColor}"></div>
					<div class="relative z-10 flex flex-col items-center justify-center p-1">
						{#if skill.icon}
							<div class="scale-[0.8] opacity-90 group-hover:scale-105 transition-transform"
								class:brightness-0={piece.isLight}
								class:invert={!piece.isLight}
							>
								<Icon src={skill.icon} size={20} />
							</div>
						{:else}
							<span class="font-mono text-[7px] font-bold leading-none">{skill.name.slice(0,4)}</span>
						{/if}
					</div>
					<div class="absolute inset-0 opacity-0 bg-white group-hover:opacity-10 transition-opacity"></div>
				</div>
			{/each}
		{/each}
	</div>

	<!-- Sidebar Controls & Stats -->
	<div class="mt-8 flex flex-col sm:flex-row items-start justify-between gap-6 px-2">
		<div class="flex flex-col gap-5 w-full sm:w-auto">
			<div class="flex gap-2">
				<button onclick={resetBoard} class="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-all active:scale-95">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
					Reset
				</button>
				<button onclick={shakeBoard} class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/10 transition-all active:scale-95">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
					Shake
				</button>
			</div>
			<div class="flex flex-wrap gap-3">
				{#each Object.keys(categoryColors) as cat}
					<button onclick={() => activeFilter = activeFilter === cat ? null : cat}
						class="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all {activeFilter === cat ? 'bg-white/10 border-white/30 scale-105 shadow-md' : 'border-white/5 opacity-50 hover:opacity-100'}"
					>
						<div class="h-2 w-2 rounded-full" style="background-color: {categoryColors[cat]};"></div>
						<span class="text-[9px] font-black uppercase tracking-[0.2em] text-white">{cat}</span>
					</button>
				{/each}
			</div>
		</div>
		<div class="text-right flex flex-col gap-1.5 opacity-30">
			<span class="text-[9px] font-black uppercase tracking-widest">Stack Nodes: {categories.reduce((acc, cat) => acc + cat.items.length, 0)}</span>
			<span class="text-[9px] font-black uppercase tracking-widest">UX: Svelte-Runes</span>
		</div>
	</div>
</div>

<style>
	:global(.filter-active) {
		box-shadow: 0 0 15px rgba(255, 255, 255, 0.4) !important;
		z-index: 60 !important;
		filter: brightness(1.5) !important;
		scale: 1.1;
	}
	[id^="skill-block-"] { will-change: transform; }
	.group\/board { animation: subtle-pulse 12s infinite; }
	@keyframes subtle-pulse { 0%, 100% { background-color: #010101; } 50% { background-color: #050505; } }
	@keyframes scanline { 0% { top: -10%; } 100% { top: 110%; } }
	.animate-scanline { animation: scanline 2.5s linear infinite; }
</style>
