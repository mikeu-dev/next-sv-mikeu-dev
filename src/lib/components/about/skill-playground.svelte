<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { scale } from 'svelte/transition';
	import * as m from '$lib/paraglide/messages';
	import Icon from '@/lib/components/ui/icon.svelte';
	import { SkillEngine } from './skill-playground-engine.svelte';
	import { 
		categoryColors, 
		defaultUrls, 
		type LocalizedCategory,
		type SkillItem
	} from './skill-playground.types';

	let { categories }: { categories: LocalizedCategory[] } = $props();
	
	const engine = new SkillEngine(categories);
	let container: HTMLElement;
	let lastW = 0;
	let lastH = 0;

	onMount(() => {
		if (container) {
			engine.init(container);
		}
	});

	onDestroy(() => {
		engine.destroy();
	});

	$effect(() => {
		if (engine.engine && engine.canvasWidth > 0 && engine.canvasHeight > 0) {
			if (Math.abs(engine.canvasWidth - lastW) > 5 || Math.abs(engine.canvasHeight - lastH) > 5) {
				lastW = engine.canvasWidth;
				lastH = engine.canvasHeight;
				engine.initWalls();
				if (engine.tetriminos.length > 0 && engine.spawnedCount === 0) {
					engine.spawnSequentially();
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
										class="size-2 {i < engine.comboCount
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
							{#key engine.nextPieceIdx}
								<div
									in:scale={{ start: 0.9, duration: 300 }}
									class="grid h-full place-content-center"
								>
									<div class="grid gap-1.5" style="grid-template-columns: repeat(4, 6px);">
										{#each Array(16) as _, i (i)}
											{@const isF = engine.tetriminos[engine.nextPieceIdx]?.skills.some(
												(s: SkillItem) => s.relX === i % 4 && s.relY === Math.floor(i / 4)
											)}
											<div
												class={isF ? 'size-1.5' : 'size-0.5 bg-zinc-200 dark:bg-zinc-800'}
												style="background-color: {isF ? engine.tetriminos[engine.nextPieceIdx].color : ''}"
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
					bind:clientWidth={engine.canvasWidth}
					bind:clientHeight={engine.canvasHeight}
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
					{#each engine.particles as p (p.id)}
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
							<span>[INTEGRITY: {engine.integrity.toFixed(1)}%]</span>
							<span>[UPTIME: {engine.uptime}S]</span>
						</div>
						<div class="flex flex-col gap-1 text-right">
							<span>[KERNEL: 0.24.5-STABLE]</span>
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
					{#each engine.pieceBodies as pb (pb.id)}
						{#each pb.piece.skills as skill, sIdx (pb.id + '-' + sIdx)}
							{@const piece = pb.piece}
							<div
								class="group absolute top-0 left-0 flex items-center justify-center border-2"
								class:text-black={piece.isLight}
								class:text-white={!piece.isLight}
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
						onclick={() => engine.resetBoard()}
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
						onclick={() => engine.shakeBoard()}
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
