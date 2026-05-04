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

	interface Particle {
		id: string;
		x: number;
		y: number;
		vx: number;
		vy: number;
		color: string;
		life: number;
	}

	interface SkillItem extends Tag {
		relX: number;
		relY: number;
		catColor: string;
		category: string;
		// Reactive properties for rendering
		x: number;
		y: number;
		angle: number;
		opacity: number;
		scale: number;
		brightness: number;
	}

	interface Tetrimino {
		shape: keyof typeof shapes;
		skills: SkillItem[];
		color: string;
		isLight: boolean;
	}

	interface PieceBody {
		piece: Tetrimino;
		id: number;
	}

	let { categories }: { categories: LocalizedCategory[] } = $props();
	let container: HTMLElement;
	let canvasWidth = $state(0);
	let canvasHeight = $state(0);
	let lastW = 0;
	let lastH = 0;
	let activeFilter = $state<string | null>(null);
	let comboCount = $state(0);
	let nextPieceIdx = $state(1);
	let spawnedCount = $state(0);
	let isSpawning = false;
	let spawnTimeouts: number[] = [];
	let particles = $state<Particle[]>([]);
	
	// HUD Stats
	let sessionStart = Date.now();
	let uptime = $state(0);
	let integrity = $state(100);
	let kernelVersion = "0.24.5-STABLE";

	const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Body, Events } = Matter;
	let engine = $state.raw<Matter.Engine>();
	let runner = $state.raw<Matter.Runner>();

	const categoryColors: Record<string, string> = {
		Frontend: '#FF3E00',
		Backend: '#3b82f6',
		GIS: '#10b981',
		Tools: '#f59e0b'
	};

	const tetrisColors: Record<string, string> = {
		I: '#00f0f0',
		L: '#f0a000',
		J: '#0000f0',
		O: '#f0f000',
		T: '#a000f0',
		S: '#00f000',
		Z: '#f00000'
	};

	function isColorLight(hex: string) {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return (r * 299 + g * 587 + b * 114) / 1000 >= 128;
	}

	const shapes = {
		I: [
			[0, 0],
			[1, 0],
			[2, 0],
			[3, 0]
		],
		L: [
			[0, 0],
			[0, 1],
			[0, 2],
			[1, 2]
		],
		J: [
			[1, 0],
			[1, 1],
			[1, 2],
			[0, 2]
		],
		O: [
			[0, 0],
			[1, 0],
			[0, 1],
			[1, 1]
		],
		T: [
			[0, 0],
			[1, 0],
			[2, 0],
			[1, 1]
		],
		S: [
			[1, 0],
			[2, 0],
			[0, 1],
			[1, 1]
		],
		Z: [
			[0, 0],
			[1, 0],
			[1, 1],
			[2, 1]
		]
	};

	const shapeKeys = Object.keys(shapes) as Array<keyof typeof shapes>;

	const tetriminos = $derived.by(() => {
		const all: any[] = []; // Keep it simple, we'll make it reactive during spawn
		let currentSkillIndex = 0;
		const flatSkills = categories.flatMap((cat) =>
			(cat.items || []).map((item) => ({
				...item,
				category: cat.category,
				catColor: categoryColors[cat.category]
			}))
		);
		
		// Use a stable seed-like approach for shapes instead of Math.random
		while (currentSkillIndex < flatSkills.length) {
			const pseudoRandom = (currentSkillIndex * 1337) % shapeKeys.length;
			const shapeKey = shapeKeys[pseudoRandom];
			const shapeCoords = shapes[shapeKey];
			const pieceSkills: SkillItem[] = [];
			for (let i = 0; i < shapeCoords.length; i++) {
				if (currentSkillIndex < flatSkills.length) {
					pieceSkills.push({
						...flatSkills[currentSkillIndex],
						relX: shapeCoords[i][0],
						relY: shapeCoords[i][1],
						x: 0,
						y: -100,
						angle: 0,
						opacity: 0,
						scale: 1,
						brightness: 1
					});
					currentSkillIndex++;
				}
			}
			if (pieceSkills.length > 0) {
				const color = tetrisColors[shapeKey];
				all.push({
					shape: shapeKey,
					color,
					isLight: isColorLight(color),
					skills: pieceSkills
				});
			}
		}
		return all;
	});

	let pieceBodies = $state<PieceBody[]>([]);
	let physicsBodies: Matter.Body[] = []; // Non-reactive array for Matter.js bodies
	let nextId = 0;

	function rotatePiece(id: number) {
		const pb = pieceBodies.find((p) => p.id === id);
		const body = physicsBodies.find((b) => b.label === `piece-${id}`);
		if (pb && body) {
			Body.rotate(body, Math.PI / 2);
			comboCount++;
			createParticles(body.position.x, body.position.y, pb.piece.color, 12);
			
			// Pulse effect via state
			pb.piece.skills.forEach(s => {
				s.scale = 1.2;
				s.brightness = 1.5;
			});

			setTimeout(() => {
				if (comboCount > 0) comboCount--;
			}, 2000);
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
		pieceBodies.forEach((pb) => {
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
				id: Math.random().toString(36).substring(2) + Date.now(),
				x,
				y,
				vx: (Math.random() - 0.5) * 8,
				vy: (Math.random() - 0.5) * 8,
				life: 1.0,
				color
			});
		}
		if (particles.length > 30) particles = particles.slice(-30);
	}

	function initWalls() {
		if (!engine || canvasWidth === 0 || canvasHeight === 0) return;
		
		// Find and remove old walls
		const existingWalls = engine.world.bodies.filter(b => b.label === 'wall');
		Composite.remove(engine.world, existingWalls);

		const options = { 
			isStatic: true, 
			friction: 0.8, 
			restitution: 0.2, 
			label: 'wall',
			render: { visible: true, fillStyle: 'transparent' } 
		};

		const wallThickness = 100;
		Composite.add(engine.world, [
			// Floor
			Bodies.rectangle(canvasWidth / 2, canvasHeight + wallThickness / 2, canvasWidth, wallThickness, options),
			// Left Wall
			Bodies.rectangle(-wallThickness / 2, canvasHeight / 2, wallThickness, canvasHeight * 2, options),
			// Right Wall
			Bodies.rectangle(canvasWidth + wallThickness / 2, canvasHeight / 2, wallThickness, canvasHeight * 2, options)
		]);
	}

	function spawnSequentially() {
		if (canvasWidth === 0 || isSpawning) return;
		isSpawning = true;
		
		const blockSize = 45;
		pieceBodies = [];
		physicsBodies = [];
		if (engine) Composite.clear(engine.world, false);
		nextId = 0; 
		initWalls();
		
		// Clear any existing timeouts
		spawnTimeouts.forEach(clearTimeout);
		spawnTimeouts = [];

		tetriminos.forEach((piece, pieceIdx) => {
			const timeout = window.setTimeout(() => {
				// Calculate piece width to prevent spawning partially inside walls
				const maxX = Math.max(...piece.skills.map(s => s.relX));
				const pieceWidth = (maxX + 1) * blockSize;
				const startX = Math.random() * (canvasWidth - pieceWidth - 40) + 20;
				const parts = piece.skills.map((skill) =>
					Bodies.rectangle(
						startX + skill.relX * blockSize,
						50 + skill.relY * blockSize,
						blockSize - 1,
						blockSize - 1,
						{
							chamfer: { radius: 4 },
							friction: 0.5,
							restitution: 0.1,
							density: 0.002
						}
					)
				);
				const body = Body.create({
					parts,
					frictionAir: 0.05,
					label: `piece-${pieceIdx}`
				});

				// Pre-cache elements
				// Create reactive piece state for Svelte 5
				const currentPieceId = nextId++;
				const reactiveSkills = piece.skills.map(s => ({
					...s,
					x: startX + s.relX * blockSize,
					y: 50 + s.relY * blockSize,
					angle: 0,
					opacity: 1,
					scale: 1,
					brightness: 1
				}));

				const newPB = $state({ 
					piece: { ...piece, skills: reactiveSkills }, 
					id: currentPieceId
				});
				
				body.label = `piece-${currentPieceId}`;
				physicsBodies.push(body);
				pieceBodies = [...pieceBodies, newPB];
				
				if (engine) {
					Composite.add(engine.world, body);
					spawnedCount++;
					if (pieceIdx < tetriminos.length - 1) nextPieceIdx = pieceIdx + 1;
				}
				
				// If this was the last piece, we're done spawning
				if (pieceIdx === tetriminos.length - 1) {
					isSpawning = false;
				}
			}, pieceIdx * 800);
			spawnTimeouts.push(timeout);
		});
	}

	onMount(() => {
		if (!container) return;
		engine = Engine.create();
		engine.world.gravity.y = 1.0; // Correct: gravity is on the world
		engine.enableSleeping = false;
		const mc = MouseConstraint.create(engine, {
			mouse: Mouse.create(container),
			constraint: { stiffness: 0.1, render: { visible: false } }
		});
		Composite.add(engine.world, mc);
		Events.on(mc, 'mousedown', (e: Matter.IEvent<Matter.MouseConstraint>) => {
			if (e.source.body?.label?.startsWith('piece-'))
				rotatePiece(parseInt(e.source.body.label.split('-')[1]));
		});
		Events.on(engine, 'collisionStart', (e: { pairs: Matter.Pair[] }) => {
			e.pairs.forEach((p: Matter.Pair) => {
				if (p.collision.depth > 2) {
					const pos = p.collision.supports[0] || p.bodyA.position;
					createParticles(pos.x, pos.y, '#ffffff', 2);
					
					// Flash effect on high impact via state
					if (p.collision.depth > 5) {
						const body = p.bodyA.label?.startsWith('piece-') ? p.bodyA : (p.bodyB.label?.startsWith('piece-') ? p.bodyB : null);
						if (body) {
							const id = parseInt(body.label.split('-')[1]);
							const pb = pieceBodies.find(p => p.id === id);
							if (pb) pb.piece.skills.forEach(s => s.brightness = 2);
						}
					}
				}
			});
		});

		runner = Runner.create();
		Runner.run(runner, engine);
		update();

		let rafId: number;
		function update() {
			const now = Date.now();
			uptime = Math.min(100, Math.floor((now - sessionStart) / 1000));
			integrity = 99.5 + Math.random() * 0.5;

			particles = particles
				.map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.03, vy: p.vy + 0.2 }))
				.filter((p) => p.life > 0);

			for (let i = 0; i < pieceBodies.length; i++) {
				const pb = pieceBodies[i];
				const body = physicsBodies.find(b => b.label === `piece-${pb.id}`);
				if (!body) continue;

				const parts = body.parts;
				for (let j = 1; j < parts.length; j++) {
					const part = parts[j];
					const skill = pb.piece.skills[j - 1];
					
					if (skill) {
						// Update reactive positions via proxy
						skill.x = part.position.x;
						skill.y = part.position.y;
						skill.angle = body.angle;
						
						// Decay effects
						if (skill.scale > 1) skill.scale -= 0.02;
						if (skill.brightness > 1) skill.brightness -= 0.05;
					}
				}
			}
			rafId = requestAnimationFrame(update);
		}
		update();
		return () => {
			spawnTimeouts.forEach(clearTimeout);
			if (engine) Engine.clear(engine);
			cancelAnimationFrame(rafId);
		};
	});

	$effect(() => {
		if (engine && canvasWidth > 0 && canvasHeight > 0) {
			// Only re-init if size change is significant (> 5px) to prevent jitter/performance issues
			if (Math.abs(canvasWidth - lastW) > 5 || Math.abs(canvasHeight - lastH) > 5) {
				lastW = canvasWidth;
				lastH = canvasHeight;
				initWalls();
				if (tetriminos.length > 0 && spawnedCount === 0) {
					spawnSequentially();
				}
			}
		}
	});
</script>

<section class="mx-auto max-w-7xl px-6 py-24">
	<div class="mb-16 max-w-2xl">
		<div class="mb-4 flex items-center gap-3">
			<div class="h-px w-8 bg-primary"></div>
			<span class="text-[10px] font-black tracking-[0.5em] text-primary uppercase"
				>{m.skill_playground_ecosystem_label()}</span
			>
		</div>
		<h2 class="mb-6 text-4xl font-black tracking-tighter text-zinc-900 sm:text-5xl dark:text-white">
			{m.skill_playground_title()}
		</h2>
		<p class="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
			{m.skill_playground_desc()}
		</p>
	</div>

	<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
		<div class="flex flex-col gap-10">
			{#each categories as cat (cat.category)}
				<div class="flex flex-col gap-4">
					<div class="flex items-center gap-3">
						<div
							class="h-2 w-2 rounded-full"
							style="background-color: {categoryColors[cat.category]}"
						></div>
						<h3
							class="text-sm font-black tracking-widest text-zinc-900 uppercase dark:text-zinc-100"
						>
							{cat.category}
						</h3>
					</div>
					<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
						{#each cat.items as item (item.name)}
							{@const itemColor = item.color || categoryColors[cat.category]}
							<div
								class="group flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
								style="--hover-border: {itemColor}44;"
							>
								<div
									class="flex size-9 items-center justify-center rounded-lg transition-colors group-hover:bg-white dark:group-hover:bg-zinc-700"
									style="background-color: {itemColor}15;"
								>
									{#if item.icon}
										<Icon src={item.icon} size={20} style="color: {itemColor};" />
									{:else}
										<span class="text-[8px] font-bold" style="color: {itemColor};"
											>{item.name.slice(0, 2)}</span
										>
									{/if}
								</div>
								<span class="text-[11px] font-bold text-zinc-700 dark:text-zinc-300"
									>{item.name}</span
								>
							</div>
						{/each}
					</div>
				</div>
			{/each}

			<div
				class="mt-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900"
			>
				<span class="mb-2 block text-[10px] font-black tracking-widest text-zinc-400 uppercase"
					>{m.skill_playground_strategy_note()}</span
				>
				<p class="text-xs leading-relaxed text-zinc-500 italic dark:text-zinc-400">
					"{m.skill_playground_strategy_desc()}"
				</p>
			</div>
		</div>

		<div class="relative">
			<div class="sticky top-10">
				<div class="mb-8 flex items-end justify-between px-2">
					<div class="flex flex-col gap-1">
						<span
							class="text-[10px] font-black tracking-[0.4em] text-zinc-400 uppercase dark:text-zinc-500"
							>{m.skill_playground_simulation_status()}</span
						>
						<div class="flex items-baseline gap-2">
							<span class="font-mono text-3xl font-black text-zinc-900 italic dark:text-white"
								>{m.skill_playground_active()}</span
							>
							<div class="mb-1 flex gap-1.5">
								{#each Array(5) as _, i (i)}
									<div
										class="h-1.5 w-1.5 rounded-sm {i < comboCount
											? 'bg-yellow-500'
											: 'bg-zinc-200 dark:bg-zinc-800'} transition-all duration-500"
									></div>
								{/each}
							</div>
						</div>
					</div>

					<div class="flex flex-col items-end gap-2">
						<span
							class="text-[10px] font-black tracking-[0.4em] text-zinc-400 uppercase dark:text-zinc-500"
							>{m.skill_playground_next_module()}</span
						>
						<div
							class="relative h-12 w-16 overflow-hidden border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
						>
							<div class="animate-scanline absolute inset-x-0 z-10 h-[1px] bg-primary/30"></div>
							{#key nextPieceIdx}
								<div
									in:scale={{ start: 0.9, duration: 300 }}
									class="grid h-full place-content-center"
								>
									<div class="grid gap-1" style="grid-template-columns: repeat(4, 6px);">
										{#each Array(16) as _, i (i)}
											{@const isF = tetriminos[nextPieceIdx]?.skills.some(
												(s) => s.relX === i % 4 && s.relY === Math.floor(i / 4)
											)}
											<div
												class="rounded-full {isF
													? 'size-1.5'
													: 'size-0.5 bg-zinc-100 dark:bg-zinc-800'}"
												style="background-color: {isF ? tetriminos[nextPieceIdx].color : ''}"
											></div>
										{/each}
									</div>
								</div>
							{/key}
						</div>
					</div>
				</div>

				<div
					bind:this={container}
					bind:clientWidth={canvasWidth}
					bind:clientHeight={canvasHeight}
					class="relative h-[600px] w-full cursor-grab overflow-hidden rounded-[2.5rem] border-4 border-zinc-900/5 bg-[#010101] shadow-2xl active:cursor-grabbing"
				>
					<div
						class="pointer-events-none absolute inset-0 z-0 opacity-[0.25]"
						style="background-image: linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px); background-size: 45px 45px;"
					></div>
					<div
						class="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-[0.15]"
					>
						<div class="size-[200px] rounded-full border-2 border-white/40"></div>
					</div>
					<div
						class="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_150px_rgba(0,0,0,1)]"
					></div>
					<div
						class="pointer-events-none absolute inset-0 z-30 opacity-[0.1]"
						style="background-image: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.3) 50%), linear-gradient(90deg, rgba(255,0,0,0.08), rgba(0,255,0,0.02), rgba(0,0,255,0.08)); background-size: 100% 4px, 3px 100%;"
					></div>
					<div
						class="pointer-events-none absolute inset-0 z-20 opacity-[0.1]"
						style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
					></div>

					{#each particles as p (p.id)}
						<div
							class="pointer-events-none absolute z-10"
							style="left: {p.x}px; top: {p.y}px; width: 3px; height: 3px; background-color: {p.color}; opacity: {p.life}; transform: scale({p.life});"
						></div>
					{/each}

					<div
						class="pointer-events-none absolute inset-x-6 top-6 z-20 flex justify-between text-[8px] font-bold tracking-widest text-white/30 uppercase"
					>
						<div class="flex flex-col gap-1">
							<span>{m.skill_playground_integrity()}: {integrity.toFixed(1)}%</span><span
								>{m.skill_playground_uptime()}: {uptime}%</span
							>
						</div>
						<div class="flex flex-col gap-1 text-right">
							<span>{m.skill_playground_kernel()}: {kernelVersion}</span><span
								>{m.skill_playground_buffer()}: OPTIMIZED_V3</span
							>
						</div>
					</div>

					<div
						class="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center opacity-0 transition-opacity duration-1000 group-hover/board:opacity-20"
					>
						<span class="text-5xl font-black tracking-tighter text-white uppercase italic"
							>{m.skill_playground_sync_ready()}</span
						>
						<span class="text-[9px] font-black tracking-[0.5em] text-white"
							>{m.skill_playground_interact()}</span
						>
					</div>

					{#each pieceBodies as pb (pb.id)}
						{#each pb.piece.skills as skill, sIdx (pb.id + '-' + sIdx)}
							{@const piece = pb.piece}
							<div
								class="group absolute top-0 left-0 flex items-center justify-center rounded-sm border-[1px] transition-all duration-300"
								class:text-black={piece.isLight}
								class:text-white={!piece.isLight}
								class:filter-active={activeFilter && skill.category === activeFilter}
								style="width: 44.5px; height: 44.5px; background: {piece.color}dd; border-color: {piece.color}; 
									   transform: translate({skill.x - 22.5}px, {skill.y - 22.5}px) rotate({skill.angle}rad) scale({skill.scale}); 
									   opacity: {skill.opacity}; filter: brightness({skill.brightness}); pointer-events: none;"
							>
								<div
									class="absolute top-1 right-1 size-1 rounded-full"
									style="background-color: {skill.catColor}"
								></div>
								<div class="relative z-10 flex flex-col items-center justify-center p-1">
									{#if skill.icon}
										<div
											class="scale-[0.8] opacity-90 transition-transform group-hover:scale-105"
											class:brightness-0={piece.isLight}
											class:invert={!piece.isLight}
										>
											<Icon src={skill.icon} size={20} />
										</div>
									{:else}
										<span class="font-mono text-[7px] leading-none font-bold"
											>{skill.name.slice(0, 4)}</span
										>
									{/if}
								</div>
							</div>
						{/each}
					{/each}
				</div>

				<div class="mt-6 flex gap-3">
					<button
						onclick={resetBoard}
						class="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-[10px] font-black tracking-widest text-zinc-800 uppercase shadow-sm transition-all hover:bg-zinc-50 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path
								d="M3 3v5h5"
							/></svg
						>
						{m.skill_playground_reset()}
					</button>
					<button
						onclick={shakeBoard}
						class="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-[10px] font-black tracking-widest text-zinc-800 uppercase shadow-sm transition-all hover:bg-zinc-50 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="m21 16-4 4-4-4" /><path d="M17 20V4" /><path d="m3 8 4-4 4 4" /><path
								d="M7 4v16"
							/></svg
						>
						{m.skill_playground_shake()}
					</button>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	:global(.filter-active) {
		box-shadow: 0 0 15px rgba(255, 255, 255, 0.4) !important;
		z-index: 60 !important;
		filter: brightness(1.5) !important;
		scale: 1.1;
	}
	.group {
		transition: border-color 0.3s ease;
	}
	.group:hover {
		border-color: var(--hover-border) !important;
	}
	@keyframes scanline {
		0% {
			top: -10%;
		}
		100% {
			top: 110%;
		}
	}
	.animate-scanline {
		animation: scanline 2.5s linear infinite;
	}
</style>
