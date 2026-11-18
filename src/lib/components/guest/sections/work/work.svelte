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
	let tx = $derived(active ? 50 - ZOOM * active.x : 0);
	let ty = $derived(active ? 50 - ZOOM * active.y : 0);

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
	class="mx-auto box-border max-w-[1440px] px-[clamp(16px,4vw,56px)] py-[clamp(72px,9vw,120px)]"
>
	<SectionHead id="work-h" eyebrow={m.gis_work_eyebrow()} title={m.gis_work_title()}>
		{#if layerProjects.length > 1}
			<button
				type="button"
				onclick={() => (touring = !touring)}
				class="btn-pill-line min-h-[50px] px-[22px] text-base"
			>
				<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
					{#if touring}
						<rect x="3" y="2" width="3.5" height="12" rx="1.5" fill="currentColor" />
						<rect x="9.5" y="2" width="3.5" height="12" rx="1.5" fill="currentColor" />
					{:else}
						<path
							d="M4 2.5l9 5.5-9 5.5z"
							fill="currentColor"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linejoin="round"
						/>
					{/if}
				</svg>
				{touring ? m.gis_work_tour_pause() : m.gis_work_tour_play()}
			</button>
		{/if}
	</SectionHead>

	{#if !active}
		<p
			class="rounded-[28px] border-[1.5px] border-dashed border-line-strong bg-card p-10 text-center text-lg font-extrabold text-muted-foreground"
		>
			{m.gis_work_empty()}
		</p>
	{:else}
		<div class="map-reveal flex flex-wrap items-start gap-5">
			<div
				role="group"
				aria-label={m.gis_work_layers()}
				class="map-card flex flex-[1_1_330px] flex-col gap-1.5 p-3"
			>
				<div class="flex items-center justify-between px-3 pt-2 pb-2.5">
					<span class="text-lg font-black">{m.gis_work_layers()}</span>
					<span class="font-mono text-[13px] text-muted-foreground">
						{String(activeIndex + 1).padStart(2, '0')} / {String(layerProjects.length).padStart(
							2,
							'0'
						)}
					</span>
				</div>
				{#each layerProjects as p, i (p.project.id)}
					{@const on = i === activeIndex}
					<button
						type="button"
						onclick={() => pick(i)}
						aria-pressed={on}
						class="flex min-h-[72px] items-center gap-3.5 rounded-[20px] border-[1.5px] p-3.5 text-left text-foreground transition-colors {on
							? 'border-primary bg-accent'
							: 'border-transparent bg-card hover:bg-secondary'}"
					>
						<span
							class="flex size-[42px] flex-none items-center justify-center rounded-[14px] {on
								? 'bg-primary'
								: 'bg-secondary'}"
						>
							<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
								<path
									d={p.icon}
									fill="none"
									stroke={on ? '#FFFFFF' : 'var(--muted-foreground)'}
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

			<div class="map-card flex min-w-0 flex-[999_1_560px] flex-col overflow-hidden">
				<div
					role="img"
					aria-label={m.gis_work_map_label()}
					class="relative aspect-[800/480] overflow-hidden bg-secondary"
				>
					<div
						class="fly absolute inset-0 origin-top-left"
						style="transform: translate({tx}%, {ty}%) scale({ZOOM})"
					>
						<img
							src="/images/map/flat-basemap.svg"
							alt=""
							aria-hidden="true"
							class="map-art absolute inset-0 block size-full"
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
						class="absolute top-4 left-4 flex max-w-[calc(100%-32px)] items-center gap-2.5 rounded-full border border-border bg-card py-2 pr-3.5 pl-2 shadow-float"
					>
						<span
							class="rounded-full bg-primary px-2.5 py-1 font-mono text-xs font-semibold text-primary-foreground"
							>{active.code}</span
						>
						<span class="truncate text-[15px] font-extrabold">{active.title}</span>
					</div>
					<div
						class="absolute right-4 bottom-4 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground"
					>
						2D · ZOOM {ZOOM.toFixed(1)}×
					</div>
				</div>
				<div class="flex flex-wrap gap-x-9 gap-y-5 px-7 pt-[26px] pb-7">
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
						<div class="flex flex-wrap gap-2">
							{#each active.tags.slice(0, 6) as t (t)}
								<span class="chip-tag">{t}</span>
							{/each}
						</div>
						{#if active.date}
							<p class="m-0 font-mono text-[13px] text-muted-foreground">
								{m.gis_work_released()}:
								<b class="text-foreground">{dateFmt.format(active.date)}</b>
							</p>
						{/if}
						<a
							href={active.href}
							class="flex min-h-11 items-center gap-2 text-base font-extrabold text-primary hover:text-foreground"
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
	{/if}
</section>

<style>
	.fly {
		transition: transform 1.5s cubic-bezier(0.65, 0, 0.2, 1);
	}
	@media (prefers-reduced-motion: reduce) {
		.fly {
			transition: none;
		}
	}
</style>
