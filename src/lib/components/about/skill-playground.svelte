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
	let kernelVersion = '0.24.5-STABLE';

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
		I: '#22d3ee', // Cyan
		L: '#fb923c', // Orange
		J: '#3b82f6', // Blue
		O: '#facc15', // Yellow
		T: '#c084fc', // Purple
		S: '#4ade80', // Green
		Z: '#f87171', // Red
		P: '#f472b6', // Rose
		D: '#94a3b8', // Slate
		V: '#2dd4bf', // Teal
		U: '#818cf8', // Indigo
		B: '#a78bfa', // Violet
		X: '#fb7185' // Rose
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
		],
		P: [
			[1, 0],
			[0, 1],
			[1, 1],
			[2, 1],
			[1, 2]
		], // Plus
		D: [[0, 0]], // Dot
		V: [
			[0, 0],
			[0, 1],
			[1, 1]
		], // Small Corner
		U: [
			[0, 0],
			[2, 0],
			[0, 1],
			[1, 1],
			[2, 1]
		], // U-Shape
		B: [
			[0, 0],
			[1, 0]
		], // Short Stick
		X: [
			[0, 0],
			[2, 0],
			[1, 1],
			[0, 2],
			[2, 2]
		] // X-Shape
	};

	const defaultUrls: Record<string, string> = {
		Svelte: 'https://svelte.dev',
		SvelteKit: 'https://kit.svelte.dev',
		TailwindCSS: 'https://tailwindcss.com',
		TypeScript: 'https://www.typescriptlang.org',
		GSAP: 'https://gsap.com',
		'Matter.js': 'https://brm.io/matter-js/',
		Firebase: 'https://firebase.google.com',
		Vite: 'https://vitejs.dev',
		React: 'https://react.dev',
		'Node.js': 'https://nodejs.org',
		'Next.js': 'https://nextjs.org',
		Prisma: 'https://www.prisma.io',
		Drizzle: 'https://orm.drizzle.team',
		PostgreSQL: 'https://www.postgresql.org',
		Supabase: 'https://supabase.com',
		Lucide: 'https://lucide.dev',
		Storybook: 'https://storybook.js.org',
		Playwright: 'https://playwright.dev',
		Vitest: 'https://vitest.dev',
		ESLint: 'https://eslint.org',
		Prettier: 'https://prettier.io',
		Docker: 'https://www.docker.com',
		Git: 'https://git-scm.com',
		GitHub: 'https://github.com'
	};

	const shapeKeys = Object.keys(shapes) as Array<keyof typeof shapes>;

	const tetriminos = $derived.by(() => {
		const all: Tetrimino[] = [];
		let currentSkillIndex = 0;
		const flatSkills = categories.flatMap((cat) =>
			(cat.items || []).map((item) => ({
				...item,
				category: cat.category,
				catColor: categoryColors[cat.category]
			}))
		);

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
	let physicsBodies: Matter.Body[] = [];
	let nextId = 0;

	function rotatePiece(id: number) {
		const pb = pieceBodies.find((p) => p.id === id);
		const body = physicsBodies.find((b) => b.label === `piece-${id}`);
		if (pb && body) {
			// Reset velocity and add a strong upward "pop" to clear the area
			Body.setVelocity(body, { x: 0, y: -6 });
			Body.rotate(body, Math.PI / 2);
			Body.setAngularVelocity(body, 0);

			// Radial Push: Gently push neighbors away to prevent "+" merging during the sweep
			physicsBodies.forEach((other) => {
				if (other === body || !other.label.startsWith('piece-')) return;
				const diff = Matter.Vector.sub(other.position, body.position);
				const dist = Matter.Vector.magnitude(diff);
				if (dist < 120) {
					const pushForce = Matter.Vector.mult(Matter.Vector.normalise(diff), 0.05 * other.mass);
					Body.applyForce(other, other.position, pushForce);
				}
			});

			comboCount++;
			createParticles(body.position.x, body.position.y, pb.piece.color, 12);

			pb.piece.skills.forEach((s) => {
				s.scale = 1.1;
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
		if (pieceBodies.length > 0) {
			pieceBodies.forEach((pb) => {
				const body = physicsBodies.find((b) => b.label === `piece-${pb.id}`);
				if (body) {
					Body.applyForce(body, body.position, {
						x: (Math.random() - 0.5) * 0.1 * body.mass,
						y: -0.15 * body.mass
					});
				}
			});
		}
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

		const existingWalls = engine.world.bodies.filter((b) => b.label === 'wall');
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
			Bodies.rectangle(
				canvasWidth / 2,
				canvasHeight + wallThickness / 2,
				canvasWidth,
				wallThickness,
				options
			),
			Bodies.rectangle(
				-wallThickness / 2,
				canvasHeight / 2,
				wallThickness,
				canvasHeight * 2,
				options
			),
			Bodies.rectangle(
				canvasWidth + wallThickness / 2,
				canvasHeight / 2,
				wallThickness,
				canvasHeight * 2,
				options
			)
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

		spawnTimeouts.forEach(clearTimeout);
		spawnTimeouts = [];

		tetriminos.forEach((piece, pieceIdx) => {
			const timeout = window.setTimeout(() => {
				const maxX = Math.max(...piece.skills.map((s: SkillItem) => s.relX));
				const pieceWidth = (maxX + 1) * blockSize;
				const startX = Math.random() * (canvasWidth - pieceWidth - 40) + 20;
				const parts = piece.skills.map((skill: SkillItem) =>
					Bodies.rectangle(
						startX + skill.relX * blockSize,
						50 + skill.relY * blockSize,
						blockSize - 0.8,
						blockSize - 0.8,
						{
							friction: 0.3,
							restitution: 0.05,
							density: 0.001,
							slop: 0.05
						}
					)
				);
				const body = Body.create({
					parts,
					frictionAir: 0.05,
					label: `piece-${pieceIdx}`
				});

				const currentPieceId = nextId++;
				const reactiveSkills = piece.skills.map((s: SkillItem) => ({
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

				if (pieceIdx === tetriminos.length - 1) {
					isSpawning = false;
				}
			}, pieceIdx * 800);
			spawnTimeouts.push(timeout);
		});
	}

	onMount(() => {
		if (!container) return;
		let rafId: number;
		engine = Engine.create();
		engine.world.gravity.y = 1.0;
		engine.enableSleeping = false;
		engine.positionIterations = 30;
		engine.velocityIterations = 30;
		engine.constraintIterations = 10;
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

					if (p.collision.depth > 5) {
						const body = p.bodyA.label?.startsWith('piece-')
							? p.bodyA
							: p.bodyB.label?.startsWith('piece-')
								? p.bodyB
								: null;
						if (body) {
							const id = parseInt(body.label.split('-')[1]);
							const pb = pieceBodies.find((p) => p.id === id);
							if (pb) pb.piece.skills.forEach((s) => (s.brightness = 2));
						}
					}
				}
			});
		});

		runner = Runner.create();
		Runner.run(runner, engine);
		function update() {
			const now = Date.now();
			uptime = Math.min(100, Math.floor((now - sessionStart) / 1000));
			integrity = 99.5 + Math.random() * 0.5;

			particles = particles
				.map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.03, vy: p.vy + 0.2 }))
				.filter((p) => p.life > 0);

			for (let i = 0; i < pieceBodies.length; i++) {
				const pb = pieceBodies[i];
				const body = physicsBodies.find((b) => b.label === `piece-${pb.id}`);
				if (!body) continue;

				const parts = body.parts;
				for (let j = 1; j < parts.length; j++) {
					const part = parts[j];
					const skill = pb.piece.skills[j - 1];

					if (skill) {
						skill.x = part.position.x;
						skill.y = part.position.y;
						skill.angle = body.angle;

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

<section class="mx-auto max-w-7xl px-6 py-32">
	<!-- Industrial Header -->
	<div class="mb-20 max-w-2xl border-l-4 border-primary pl-8">
		<div class="mb-4 flex items-center gap-3">
			<span class="font-mono text-[10px] font-black tracking-[0.5em] text-primary uppercase"
				>[ECOSYSTEM_MODULE_v1.0]</span
			>
		</div>
		<h2
			class="mb-6 font-poppins text-5xl font-black tracking-tighter text-zinc-900 md:text-7xl dark:text-white"
		>
			{m.skill_playground_title()}<span class="text-primary">_</span>
		</h2>
		<p
			class="font-mono text-xs leading-relaxed tracking-wider text-zinc-600 uppercase dark:text-zinc-400"
		>
			// {m.skill_playground_desc()}
		</p>
	</div>

	<div class="grid grid-cols-1 gap-16 lg:grid-cols-2">
		<!-- Categories List -->
		<div class="flex flex-col gap-12">
			{#each categories as cat (cat.category)}
				<div class="flex flex-col gap-6">
					<div class="flex items-center gap-3 border-b border-zinc-100 pb-2 dark:border-zinc-800">
						<div class="size-3" style="background-color: {categoryColors[cat.category]}"></div>
						<h3
							class="font-mono text-xs font-black tracking-widest text-zinc-900 uppercase dark:text-zinc-100"
						>
							[CAT_{cat.category.toUpperCase()}]
						</h3>
					</div>
					<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
						{#each cat.items as item (item.name)}
							{@const itemColor = item.color || categoryColors[cat.category]}
							<svelte:element
								this={item.url || defaultUrls[item.name] ? 'a' : 'div'}
								href={item.url || defaultUrls[item.name]}
								target={item.url || defaultUrls[item.name] ? '_blank' : undefined}
								rel={item.url || defaultUrls[item.name] ? 'noopener noreferrer' : undefined}
								class="group relative flex items-center gap-3 border-2 border-zinc-100 bg-white p-4 transition-all hover:-translate-x-1 hover:-translate-y-1 hover:border-foreground hover:shadow-[4px_4px_0_var(--foreground)] dark:border-zinc-800 dark:bg-zinc-900 {item.url ||
								defaultUrls[item.name]
									? 'cursor-alias'
									: ''}"
							>
								<div
									class="flex size-10 items-center justify-center transition-colors group-hover:bg-foreground group-hover:text-background"
									style="background-color: {itemColor}15;"
								>
									{#if item.icon}
										<Icon src={item.icon} size={22} style="color: {itemColor};" />
									{:else}
										<span class="font-mono text-[9px] font-black" style="color: {itemColor};"
											>{item.name.slice(0, 2)}</span
										>
									{/if}
								</div>
								<div class="flex flex-col">
									<span
										class="font-mono text-[10px] font-black tracking-tighter text-zinc-700 uppercase dark:text-zinc-300"
										>{item.name}</span
									>
									{#if item.url || defaultUrls[item.name]}
										<span
											class="font-mono text-[8px] font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100"
										>
											[VIEW_SOURCE]
										</span>
									{/if}
								</div>

								{#if item.url || defaultUrls[item.name]}
									<div class="absolute top-2 right-2 opacity-0 transition-all group-hover:opacity-100">
										<Icon iconName="ExternalLink" size={10} class="text-zinc-400" />
									</div>
								{/if}
							</svelte:element>
						{/each}
					</div>
				</div>
			{/each}

			<!-- Technical Note -->
			<div
				class="mt-4 border-2 border-dashed border-zinc-200 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900"
			>
				<span
					class="mb-4 block font-mono text-[10px] font-black tracking-widest text-zinc-400 uppercase"
					>[STRATEGY_PROTOCOL]</span
				>
				<p class="font-mono text-[10px] leading-relaxed text-zinc-500 italic dark:text-zinc-400">
					"{m.skill_playground_strategy_desc()}"
				</p>
			</div>
		</div>

		<!-- Simulation Section -->
		<div class="relative">
			<div class="sticky top-24">
				<!-- Simulation HUD -->
				<div class="mb-10 flex items-end justify-between border-b-2 border-foreground pb-6">
					<div class="flex flex-col gap-2">
						<span
							class="font-mono text-[10px] font-black tracking-[0.4em] text-zinc-400 uppercase dark:text-zinc-500"
							>[STATUS_MONITOR]</span
						>
						<div class="flex items-baseline gap-4">
							<span class="font-mono text-4xl font-black text-zinc-900 italic dark:text-white"
								>{m.skill_playground_active()}</span
							>
							<div class="mb-1 flex gap-2">
								{#each Array(5) as _, i (i)}
									<div
										class="size-2 {i < comboCount
											? 'bg-primary'
											: 'bg-zinc-200 dark:bg-zinc-800'} transition-all duration-500"
									></div>
								{/each}
							</div>
						</div>
					</div>

					<div class="flex flex-col items-end gap-2">
						<span
							class="font-mono text-[10px] font-black tracking-[0.4em] text-zinc-400 uppercase dark:text-zinc-500"
							>[NEXT_MODULE]</span
						>
						<div class="relative h-14 w-20 border-2 border-foreground bg-card">
							<div class="animate-scanline absolute inset-x-0 z-10 h-[1px] bg-primary/40"></div>
							{#key nextPieceIdx}
								<div
									in:scale={{ start: 0.9, duration: 300 }}
									class="grid h-full place-content-center"
								>
									<div class="grid gap-1.5" style="grid-template-columns: repeat(4, 6px);">
										{#each Array(16) as _, i (i)}
											{@const isF = tetriminos[nextPieceIdx]?.skills.some(
												(s: SkillItem) => s.relX === i % 4 && s.relY === Math.floor(i / 4)
											)}
											<div
												class={isF ? 'size-1.5' : 'size-0.5 bg-zinc-200 dark:bg-zinc-800'}
												style="background-color: {isF ? tetriminos[nextPieceIdx].color : ''}"
											></div>
										{/each}
									</div>
								</div>
							{/key}
						</div>
					</div>
				</div>

				<!-- Simulation Board -->
				<div
					bind:this={container}
					bind:clientWidth={canvasWidth}
					bind:clientHeight={canvasHeight}
					class="relative h-[650px] w-full cursor-grab overflow-hidden border-4 border-foreground bg-[#0a0a0a] active:cursor-grabbing"
				>
					<!-- Grid Lines -->
					<div
						class="pointer-events-none absolute inset-0 z-0 opacity-[0.15]"
						style="background-image: linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px); background-size: 45px 45px;"
					></div>

					<!-- Industrial Overlays -->
					<div
						class="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"
					></div>
					<div
						class="pointer-events-none absolute inset-0 z-30 opacity-[0.05]"
						style="background-image: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.3) 50%), linear-gradient(90deg, rgba(255,0,0,0.08), rgba(0,255,0,0.02), rgba(0,0,255,0.08)); background-size: 100% 4px, 3px 100%;"
					></div>

					<!-- Particles -->
					{#each particles as p (p.id)}
						<div
							class="pointer-events-none absolute z-10"
							style="left: {p.x}px; top: {p.y}px; width: 4px; height: 4px; background-color: {p.color}; opacity: {p.life}; transform: scale({p.life});"
						></div>
					{/each}

					<!-- System Stats -->
					<div
						class="pointer-events-none absolute inset-x-8 top-8 z-20 flex justify-between font-mono text-[9px] font-black tracking-widest text-white/30 uppercase"
					>
						<div class="flex flex-col gap-1">
							<span>[INTEGRITY: {integrity.toFixed(1)}%]</span>
							<span>[UPTIME: {uptime}S]</span>
						</div>
						<div class="flex flex-col gap-1 text-right">
							<span>[KERNEL: {kernelVersion}]</span>
							<span>[PROCESS: SYNC_V3]</span>
						</div>
					</div>

					<!-- Interaction Hint -->
					<div
						class="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center opacity-0 transition-opacity duration-1000 group-hover:opacity-20"
					>
						<span
							class="font-poppins text-6xl font-black tracking-tighter text-white uppercase italic"
							>[SYNC_ESTABLISHED]</span
						>
						<span class="font-mono text-[10px] font-black tracking-[0.5em] text-white"
							>INITIATE_INTERACTION_PROTOCOL</span
						>
					</div>

					<!-- Physics Pieces -->
					{#each pieceBodies as pb (pb.id)}
						{#each pb.piece.skills as skill, sIdx (pb.id + '-' + sIdx)}
							{@const piece = pb.piece}
							<div
								class="group absolute top-0 left-0 flex items-center justify-center border-2"
								class:text-black={piece.isLight}
								class:text-white={!piece.isLight}
								class:filter-active={activeFilter && skill.category === activeFilter}
								style="width: 44.2px; height: 44.2px; background: {piece.color}ee; border-color: {piece.color}; 
									   transform: translate({skill.x - 22.1}px, {skill.y -
									22.1}px) rotate({skill.angle}rad) scale({skill.scale}); 
									   opacity: {skill.opacity}; filter: brightness({skill.brightness}); pointer-events: none;"
							>
								<div
									class="absolute top-1 right-1 size-1.5"
									style="background-color: {skill.catColor}"
								></div>
								<div class="relative z-10 flex flex-col items-center justify-center p-1">
									{#if skill.icon}
										<div
											class="scale-[0.85] opacity-90 transition-transform group-hover:scale-110"
											class:brightness-0={piece.isLight}
											class:invert={!piece.isLight}
										>
											<Icon src={skill.icon} size={22} />
										</div>
									{:else}
										<span class="font-mono text-[8px] leading-none font-black"
											>{skill.name.slice(0, 4).toUpperCase()}</span
										>
									{/if}
								</div>
							</div>
						{/each}
					{/each}
				</div>

				<!-- Simulation Controls -->
				<div class="mt-8 flex gap-4">
					<button
						onclick={resetBoard}
						class="flex flex-1 items-center justify-center gap-3 border-2 border-foreground bg-card px-8 py-4 font-mono text-[10px] font-black tracking-widest text-zinc-800 uppercase transition-all hover:-translate-x-1 hover:-translate-y-1 hover:bg-primary hover:text-white hover:shadow-[4px_4px_0_var(--foreground)] active:translate-x-0 active:translate-y-0 active:shadow-none dark:text-zinc-300"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
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
						[RESET_ENGINE]
					</button>
					<button
						onclick={shakeBoard}
						class="flex flex-1 items-center justify-center gap-3 border-2 border-foreground bg-card px-8 py-4 font-mono text-[10px] font-black tracking-widest text-zinc-800 uppercase transition-all hover:-translate-x-1 hover:-translate-y-1 hover:bg-zinc-100 hover:shadow-[4px_4px_0_var(--foreground)] active:translate-x-0 active:translate-y-0 active:shadow-none dark:text-zinc-300 dark:hover:bg-zinc-800"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
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
						[INIT_SHAKE]
					</button>
				</div>
			</div>
		</div>
	</div>
</section>

<style lang="postcss">
	@reference "tailwindcss";

	:global(.filter-active) {
		box-shadow: 0 0 20px rgba(255, 255, 255, 0.5) !important;
		z-index: 60 !important;
		filter: brightness(1.8) !important;
		transform: scale(1.15) !important;
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

	button {
		@apply cursor-pointer;
	}
</style>
