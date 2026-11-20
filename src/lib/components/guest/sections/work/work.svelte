<script lang="ts">
	import type { Project } from '#lib/types.js';
	import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
	import { m } from '#lib/paraglide/messages.js';
	import { onMount } from 'svelte';
	import SectionHead from '../../map/section-head.svelte';
	import { toMapProjects } from '../../map/project-geo.js';

	let { projects = [] }: { projects?: Project[] } = $props();
	const locale = getLocale();

	let layerProjects = $derived.by(() => {
		const pinned = projects.filter((p) => p.pinned);
		return toMapProjects((pinned.length ? pinned : projects).slice(0, 6), locale, localizeHref);
	});

	let activeIndex = $state(0);
	let touring = $state(true);
	let active = $derived(layerProjects[Math.min(activeIndex, layerProjects.length - 1)]);

	const ZOOM = 1.6;
	// Fly to the active pin, clamped so the zoomed map never shows its edges.
	const clampPan = (v: number) => Math.min(0, Math.max(100 - 100 * ZOOM, v));
	let tx = $derived(active ? clampPan(50 - ZOOM * active.x) : 0);
	let ty = $derived(active ? clampPan(50 - ZOOM * active.y) : 0);
	const leaf = (i: number) => (i % 2 ? 'rounded-leaf-r' : 'rounded-leaf');
	const leafSm = (i: number) => (i % 2 ? 'rounded-leaf-sm-r' : 'rounded-leaf-sm');

	const dateFmt = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'id-ID', {
		month: 'long',
		year: 'numeric'
	});

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) touring = false;
		const id = setInterval(() => {
			if (touring && layerProjects.length > 1) {
				activeIndex = (activeIndex + 1) % layerProjects.length;
			}
		}, 4200);
		return () => clearInterval(id);
	});

	function pick(i: number) {
		activeIndex = i;
		touring = false;
	}
</script>

<section
	aria-labelledby="work-h"
	class="mx-auto box-border max-w-[1440px] px-[clamp(16px,4vw,56px)] py-[clamp(56px,7vw,100px)]"
>
	<SectionHead id="work-h" eyebrow={m.gis_work_eyebrow()} title={m.gis_work_title()} />

	{#if !active}
		<p
			class="m-0 rounded-[30px] bg-card p-10 text-center text-lg font-extrabold text-muted-foreground"
		>
			{m.gis_work_empty()}
		</p>
	{:else}
		<div class="map-reveal flex flex-wrap items-start gap-2.5">
			<!-- Layer list -->
			<div class="shard flex min-w-0 flex-[1_1_330px] flex-col">
				<div class="tab tab-r flex h-[62px] items-center gap-3.5 self-start px-6">
					<span class="text-lg font-black">{m.gis_work_layers()}</span>
					<span class="font-mono text-[13px] text-muted-foreground">
						{String(activeIndex + 1).padStart(2, '0')} / {String(layerProjects.length).padStart(
							2,
							'0'
						)}
					</span>
				</div>
				<div
					role="group"
					aria-label={m.gis_work_layers()}
					class="flex flex-col gap-2 rounded-[0_30px_30px_30px] bg-card p-3"
				>
					{#each layerProjects as p, i (p.project.id)}
						{@const on = i === activeIndex}
						<button
							type="button"
							onclick={() => pick(i)}
							aria-pressed={on}
							class="ms flex min-h-[72px] items-center gap-3.5 px-3.5 py-3 text-left text-foreground {leaf(
								i
							)} {on
								? 'bg-white shadow-[0_6px_16px_rgba(30,32,38,.12),inset_0_0_0_1.5px_var(--primary)] dark:bg-white/10'
								: 'hover:bg-white/60 dark:hover:bg-white/5'}"
						>
							<span
								class="ms flex size-[42px] flex-none items-center justify-center {on
									? `${leafSm(i + 1)} bg-primary text-primary-foreground`
									: `${leafSm(i)} bg-well text-route`}"
							>
								<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
									<path
										d={p.icon}
										fill="none"
										stroke="currentColor"
										stroke-width="2.2"
										stroke-linejoin="round"
										stroke-linecap="round"
									/>
								</svg>
							</span>
							<span class="flex min-w-0 flex-1 flex-col gap-0.5">
								<span class="text-[17px] font-extrabold">{p.title}</span>
								{#if p.category}
									<span class="truncate text-sm text-muted-foreground">{p.category}</span>
								{/if}
							</span>
							<span class="font-mono text-xs text-muted-foreground">{p.code}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Map + detail -->
			<div class="shard relative flex min-w-0 flex-[999_1_560px] flex-col">
				<div
					class="tab tab-r flex h-[62px] min-w-0 items-center gap-2.5 px-4 {layerProjects.length > 1
						? 'mr-[230px] max-sm:mr-[150px]'
						: 'self-start'}"
				>
					<span
						class="flex-none rounded-leaf-xs bg-primary px-2.5 py-[5px] font-mono text-xs font-semibold text-primary-foreground"
						>{active.code}</span
					>
					<span class="truncate text-base font-black">{active.title}</span>
				</div>
				{#if layerProjects.length > 1}
					<button
						type="button"
						onclick={() => (touring = !touring)}
						class="absolute top-0 right-0 flex h-[52px] w-[220px] items-center justify-center gap-2.5 rounded-leaf-r bg-card text-base font-extrabold text-foreground max-sm:w-[140px]"
					>
						<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
							{#if touring}
								<rect x="3" y="2" width="3.5" height="12" rx="1.5" fill="var(--route)" />
								<rect x="9.5" y="2" width="3.5" height="12" rx="1.5" fill="var(--route)" />
							{:else}
								<path
									d="M4 2.5l9 5.5-9 5.5z"
									fill="var(--route)"
									stroke="var(--route)"
									stroke-width="1.5"
									stroke-linejoin="round"
								/>
							{/if}
						</svg>
						{touring ? m.gis_work_tour_pause() : m.gis_work_tour_play()}
					</button>
				{/if}
				<div class="flex flex-col rounded-[0_30px_30px_30px] bg-card p-2.5">
					<div
						role="img"
						aria-label={m.gis_work_map_label()}
						class="relative aspect-[800/460] overflow-hidden rounded-[22px_12px_22px_12px] bg-secondary"
					>
						<div
							class="fly absolute inset-0 origin-top-left"
							style="transform: translate({tx}%, {ty}%) scale({ZOOM})"
						>
							<img
								src="/images/map/flat-basemap.svg"
								alt=""
								aria-hidden="true"
								class="map-art map-mute absolute inset-0 block size-full"
							/>
							{#each layerProjects as p, i (p.project.id)}
								{@const on = i === activeIndex}
								{@const pw = on ? 22 : 16}
								<div class="absolute size-0" style="left: {p.x}%; top: {p.y}%">
									{#if on}<span class="map-ring"></span><span class="map-ring r2"></span>{/if}
									<svg
										width={pw}
										height={Math.round((pw * 4) / 3)}
										viewBox="0 0 30 40"
										aria-hidden="true"
										class="absolute transition-all duration-400"
										style="left: {-pw / 2}px; top: {-Math.round((pw * 4) / 3)}px"
									>
										<path
											d="M15 1C7.3 1 1 7 1 14.6 1 24.8 15 39 15 39s14-14.2 14-24.4C29 7 22.7 1 15 1z"
											fill={on ? 'var(--primary)' : 'var(--pin-idle)'}
											stroke="#FFFFFF"
											stroke-width="2"
										/>
										<circle cx="15" cy="14.5" r="5.5" fill="#FFFFFF" />
									</svg>
								</div>
							{/each}
						</div>
						<div
							class="glass absolute right-3 bottom-3 rounded-leaf-xs px-3 py-1.5 font-mono text-xs text-ink-soft"
						>
							2D · ZOOM {ZOOM.toFixed(1)}×
						</div>
					</div>
					<div class="flex flex-wrap gap-x-9 gap-y-5 px-[18px] pt-6 pb-[18px]">
						<div class="flex flex-[2_1_320px] flex-col gap-2.5">
							<p class="m-0 font-mono text-[13px] font-semibold text-primary">
								{active.code}{active.category ? ` · ${active.category}` : ''}
							</p>
							<h3 class="m-0 text-[28px] font-black tracking-[-0.02em]">{active.title}</h3>
							<p class="m-0 line-clamp-5 text-[17px] leading-relaxed text-ink-soft">
								{active.description}
							</p>
						</div>
						<div class="flex flex-[1_1_220px] flex-col gap-3.5">
							<div class="flex flex-wrap gap-1.5">
								{#each active.tags.slice(0, 6) as t, i (t)}
									<span class="bg-well px-3.5 py-[7px] text-sm font-extrabold {leafSm(i + 1)}"
										>{t}</span
									>
								{/each}
							</div>
							{#if active.date}
								<p class="m-0 font-mono text-[13px] leading-[1.7] text-muted-foreground">
									{m.gis_work_released()}:
									<b class="text-foreground">{dateFmt.format(active.date)}</b>
								</p>
							{/if}
							<a
								href={active.href}
								class="flex min-h-11 items-center gap-2 text-base font-extrabold text-primary no-underline hover:text-foreground"
							>
								{m.gis_work_detail()}
								<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
									<path
										d="M4 9h10M10 5l4 4-4 4"
										fill="none"
										stroke="currentColor"
										stroke-width="2.2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</section>

<style>
	.fly {
		transition: transform 1.5s cubic-bezier(0.65, 0, 0.2, 1);
	}
	.ms {
		transition:
			background-color 0.62s cubic-bezier(0.34, 1.3, 0.5, 1),
			box-shadow 0.62s cubic-bezier(0.34, 1.3, 0.5, 1),
			border-radius 0.62s cubic-bezier(0.34, 1.3, 0.5, 1);
	}
	@media (prefers-reduced-motion: reduce) {
		.fly,
		.ms {
			transition: none;
		}
	}
</style>
