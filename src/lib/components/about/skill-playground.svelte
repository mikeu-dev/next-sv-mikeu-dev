<script lang="ts">
	import { onMount } from 'svelte';
	import Matter from 'matter-js';
	import type { Tag } from '$lib/types';
	import Icon from '@/lib/components/ui/icon.svelte';
	import { scale } from 'svelte/transition';
	import * as m from '$lib/paraglide/messages';

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
	let particles = $state<any[]>([]);

	const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Body, Events } = Matter;
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
		return (r * 299 + g * 587 + b * 114) / 1000 >= 128;
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
				all.push({ shapeKey, color, isLight: isColorLight(color), skills: pieceSkills });
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
			particles.push({ id: Math.random(), x, y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 1.0, color });
		}
		if (particles.length > 30) particles = particles.slice(-30);
	}

	function initWalls() {
		if (!container) return;
		const w = container.clientWidth;
		const h = container.clientHeight;
		const options = { isStatic: true, friction: 0.8, restitution: 0.1, render: { visible: false } };
		Composite.add(engine.world, [
			Bodies.rectangle(w / 2, h + 25, w, 50, options),
			Bodies.rectangle(-25, h / 2, 50, h, options),
			Bodies.rectangle(w + 25, h / 2, 50, h, options)
		]);
	}

	function spawnSequentially() {
		const width = container.clientWidth;
		const blockSize = 45;
		pieceBodies = [];
		tetriminos.forEach((piece, pieceIdx) => {
			setTimeout(() => {
				const startX = Math.random() * (width - 200) + 100;
				const parts = piece.skills.map((skill: any) => 
					Bodies.rectangle(startX + skill.relX * blockSize, -100 + skill.relY * blockSize, blockSize - 1, blockSize - 1, {
						chamfer: { radius: 4 }, friction: 0.5, restitution: 0.1, density: 0.002
					})
				);
				const body = Body.create({ parts, frictionAir: 0.05, angularDamping: 0.1, label: `piece-${pieceIdx}` });
				pieceBodies.push({ body, piece, id: pieceIdx });
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
		engine = Engine.create({ gravity: { x: 0, y: 1.5 } });
		engine.enableSleeping = true;
		initWalls();
		const mc = MouseConstraint.create(engine, { mouse: Mouse.create(container), constraint: { stiffness: 0.1, render: { visible: false } } });
		Composite.add(engine.world, mc);
		Events.on(mc, 'mousedown', (e: any) => {
			if (e.source.body?.label?.startsWith('piece-')) rotatePiece(parseInt(e.source.body.label.split('-')[1]));
		});
		Events.on(engine, 'collisionStart', (e: any) => {
			e.pairs.forEach((p: any) => {
				if (p.collision.depth > 2) {
					const pos = p.collision.supports[0] || p.bodyA.position;
					const piece = pieceBodies.find(pb => pb.body === p.bodyA || pb.body === p.bodyA.parent);
					createParticles(pos.x, pos.y, piece?.piece.color || '#ffffff', 2);
				}
			});
		});
		spawnSequentially();
		let rafId: number;
		function update() {
			particles = particles.map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.03, vy: p.vy + 0.2 })).filter(p => p.life > 0);
			pieceBodies.forEach((pb) => {
				pb.body.parts.slice(1).forEach((part, i) => {
					const el = document.getElementById(`skill-block-${pb.id}-${i}`);
					if (el) {
						el.style.transform = `translate(${part.position.x - 22.5}px, ${part.position.y - 22.5}px) rotate(${pb.body.angle}rad)`;
						el.style.opacity = '1';
						if (activeFilter && pb.piece.skills[i].category === activeFilter) el.classList.add('filter-active');
						else el.classList.remove('filter-active');
					}
				});
			});
			rafId = requestAnimationFrame(update);
		}
		update();
		runner = Runner.create();
		Runner.run(runner, engine);
		return () => { Runner.stop(runner); Engine.clear(engine); cancelAnimationFrame(rafId); };
	});
</script>

<section class="mx-auto max-w-7xl px-6 py-24">
	<div class="mb-16 max-w-2xl">
		<div class="mb-4 flex items-center gap-3">
			<div class="h-px w-8 bg-primary"></div>
			<span class="text-[10px] font-black uppercase tracking-[0.5em] text-primary">{m.skill_playground_ecosystem_label()}</span>
		</div>
		<h2 class="mb-6 text-4xl font-black tracking-tighter text-zinc-900 dark:text-white sm:text-5xl">{m.skill_playground_title()}</h2>
		<p class="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
			{m.skill_playground_desc()}
		</p>
	</div>

	<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
		<!-- Left Side: Informative Tech Arsenal -->
		<div class="flex flex-col gap-10">
			{#each categories as cat}
				<div class="flex flex-col gap-4">
					<div class="flex items-center gap-3">
						<div class="h-2 w-2 rounded-full" style="background-color: {categoryColors[cat.category]}"></div>
						<h3 class="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">{cat.category}</h3>
					</div>
					<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
						{#each cat.items as item}
							<div class="group flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-3 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
								<div class="flex size-8 items-center justify-center rounded-lg bg-zinc-50 transition-colors group-hover:bg-white dark:bg-zinc-800 dark:group-hover:bg-zinc-700">
									{#if item.icon}
										<Icon src={item.icon} size={18} class="text-zinc-600 dark:text-zinc-400" />
									{:else}
										<span class="text-[8px] font-bold text-zinc-400">{item.name.slice(0,2)}</span>
									{/if}
								</div>
								<span class="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">{item.name}</span>
							</div>
						{/each}
					</div>
				</div>
			{/each}

			<div class="mt-4 rounded-2xl bg-zinc-50 p-6 border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
				<span class="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">{m.skill_playground_strategy_note()}</span>
				<p class="text-xs italic text-zinc-500 dark:text-zinc-400 leading-relaxed">
					"{m.skill_playground_strategy_desc()}"
				</p>
			</div>
		</div>

		<!-- Right Side: Interactive Simulator -->
		<div class="relative">
			<div class="sticky top-10">
				<div class="mb-8 flex items-end justify-between px-2">
					<div class="flex flex-col gap-1">
						<span class="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500">{m.skill_playground_simulation_status()}</span>
						<div class="flex items-baseline gap-2">
							<span class="font-mono text-3xl font-black italic text-zinc-900 dark:text-white">{m.skill_playground_active()}</span>
							<div class="flex gap-1.5 mb-1">
								{#each Array(5) as _, i}
									<div class="h-1.5 w-1.5 rounded-sm {i < comboCount ? 'bg-yellow-500' : 'bg-zinc-200 dark:bg-zinc-800'} transition-all duration-500"></div>
								{/each}
							</div>
						</div>
					</div>

					<div class="flex flex-col items-end gap-2">
						<span class="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500">{m.skill_playground_next_module()}</span>
						<div class="relative h-12 w-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
							<div class="absolute inset-x-0 h-[1px] bg-primary/30 z-10 animate-scanline"></div>
							{#key nextPieceIdx}
								<div in:scale={{ start: 0.9, duration: 300 }} class="grid place-content-center h-full">
									<div class="grid gap-1" style="grid-template-columns: repeat(4, 6px);">
										{#each Array(16) as _, i}
											{@const isF = tetriminos[nextPieceIdx]?.skills.some(s => s.relX === (i % 4) && s.relY === Math.floor(i / 4))}
											<div class="rounded-full {isF ? 'size-1.5' : 'size-0.5 bg-zinc-100 dark:bg-zinc-800'}" style="background-color: {isF ? tetriminos[nextPieceIdx].color : ''}"></div>
										{/each}
									</div>
								</div>
							{/key}
						</div>
					</div>
				</div>

				<div bind:this={container} class="relative h-[600px] w-full overflow-hidden rounded-[2.5rem] border-4 border-zinc-900/5 bg-[#010101] shadow-2xl cursor-grab active:cursor-grabbing">
					<div class="pointer-events-none absolute inset-0 opacity-[0.25] z-0" style="background-image: linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px); background-size: 45px 45px;"></div>
					<div class="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.15] z-0">
						<div class="size-[200px] rounded-full border-2 border-white/40"></div>
					</div>
					<div class="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_150px_rgba(0,0,0,1)]"></div>
					<div class="pointer-events-none absolute inset-0 opacity-[0.1] z-30" style="background-image: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.3) 50%), linear-gradient(90deg, rgba(255,0,0,0.08), rgba(0,255,0,0.02), rgba(0,0,255,0.08)); background-size: 100% 4px, 3px 100%;"></div>
					<div class="pointer-events-none absolute inset-0 opacity-[0.1] z-20" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"></div>
					
					{#each particles as p (p.id)}
						<div class="absolute pointer-events-none z-10" style="left: {p.x}px; top: {p.y}px; width: 3px; height: 3px; background-color: {p.color}; opacity: {p.life}; transform: scale({p.life});"></div>
					{/each}

					<div class="pointer-events-none absolute inset-x-6 top-6 flex justify-between z-20 text-[8px] font-bold uppercase tracking-widest text-white/30">
						<div class="flex flex-col gap-1"><span>{m.skill_playground_integrity()}: 100%</span><span>{m.skill_playground_uptime()}: {Math.floor(spawnedCount / tetriminos.length * 100)}%</span></div>
						<div class="text-right flex flex-col gap-1"><span>{m.skill_playground_kernel()}: V0.19</span><span>{m.skill_playground_buffer()}: Optimized</span></div>
					</div>

					<div class="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center opacity-0 group-hover/board:opacity-20 transition-opacity duration-1000">
						<span class="text-5xl font-black italic tracking-tighter text-white uppercase">{m.skill_playground_sync_ready()}</span>
						<span class="text-[9px] font-black tracking-[0.5em] text-white">{m.skill_playground_interact()}</span>
					</div>

					{#each tetriminos as piece, pIdx}
						{#each piece.skills as skill, sIdx}
							<div id="skill-block-{pIdx}-{sIdx}" class="absolute left-0 top-0 flex items-center justify-center rounded-sm border-[1px] transition-all duration-300 group" class:text-black={piece.isLight} class:text-white={!piece.isLight} style="width: 44.5px; height: 44.5px; background: {piece.color}dd; border-color: {piece.color}; opacity: 0; pointer-events: none;">
								<div class="absolute right-1 top-1 size-1 rounded-full" style="background-color: {skill.catColor}"></div>
								<div class="relative z-10 flex flex-col items-center justify-center p-1">
									{#if skill.icon}
										<div class="scale-[0.8] opacity-90 group-hover:scale-105 transition-transform" class:brightness-0={piece.isLight} class:invert={!piece.isLight}><Icon src={skill.icon} size={20} /></div>
									{:else}
										<span class="font-mono text-[7px] font-bold leading-none">{skill.name.slice(0,4)}</span>
									{/if}
								</div>
							</div>
						{/each}
					{/each}
				</div>

				<div class="mt-6 flex gap-3">
					<button onclick={resetBoard} class="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-800 hover:bg-zinc-50 transition-all active:scale-95 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
						{m.skill_playground_reset()}
					</button>
					<button onclick={shakeBoard} class="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-800 hover:bg-zinc-50 transition-all active:scale-95 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">
						<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
						{m.skill_playground_shake()}
					</button>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	:global(.filter-active) { box-shadow: 0 0 15px rgba(255, 255, 255, 0.4) !important; z-index: 60 !important; filter: brightness(1.5) !important; scale: 1.1; }
	@keyframes scanline { 0% { top: -10%; } 100% { top: 110%; } }
	.animate-scanline { animation: scanline 2.5s linear infinite; }
</style>
