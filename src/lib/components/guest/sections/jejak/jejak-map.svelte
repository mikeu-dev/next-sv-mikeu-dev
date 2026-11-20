<script lang="ts">
	import type { GeoNode } from '#lib/types.js';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { FRAME_PATH, GRATICULE_PATH, HEX_PATH } from './world-grid.js';
	import { PURWAKARTA, arcPath, distanceKm, hexDensity, landHexes, toPercent } from './hex-map.js';

	let {
		nodes = [],
		totalVisitors = 0,
		todayVisitors = 0
	}: { nodes?: GeoNode[]; totalVisitors?: number; todayVisitors?: number } = $props();

	const numberFmt = new Intl.NumberFormat(getLocale() === 'en' ? 'en-GB' : 'id-ID');

	type Mode = 'hex' | 'dot' | 'flow';
	let mode = $state<Mode>('hex');
	let selected = $state<string | null>(null);

	const MODES: { id: Mode; label: () => string; desc: () => string; icon: string }[] = [
		{
			id: 'hex',
			label: m.gis_mode_hex,
			desc: m.gis_mode_hex_desc,
			icon: 'M10 2l7 4v8l-7 4-7-4V6z'
		},
		{
			id: 'dot',
			label: m.gis_mode_dot,
			desc: m.gis_mode_dot_desc,
			icon: 'M10 2.5c-3 0-5.5 2.4-5.5 5.4C4.5 12 10 17.5 10 17.5s5.5-5.5 5.5-9.6c0-3-2.5-5.4-5.5-5.4z'
		},
		{
			id: 'flow',
			label: m.gis_mode_flow,
			desc: m.gis_mode_flow_desc,
			icon: 'M3 15c4-9 10-11 14-10M13 3l4 2-2 4'
		}
	];
	let modeIndex = $derived(MODES.findIndex((x) => x.id === mode));

	let density = $derived(hexDensity(nodes));
	let visitedHexes = $derived(density.reduce((n, c) => n + (c > 0 ? 1 : 0), 0));
	let stats = $derived<[string, number, string][]>([
		[m.world_hud_total(), totalVisitors, ''],
		[m.world_hud_today(), todayVisitors, 'text-primary'],
		[m.gis_world_hexes(), visitedHexes, '']
	]);

	/** Visitors grouped by place (city, else country), busiest first. */
	let places = $derived.by(() => {
		const byKey: Record<
			string,
			{ name: string; latitude: number; longitude: number; count: number }
		> = {};
		for (const n of nodes) {
			if (!Number.isFinite(n.latitude) || !Number.isFinite(n.longitude) || !(n.count > 0)) continue;
			const name = n.city || n.country;
			const key = `${name}|${n.country}`;
			const p = (byKey[key] ??= { name, latitude: 0, longitude: 0, count: 0 });
			// count-weighted centroid
			p.latitude = (p.latitude * p.count + n.latitude * n.count) / (p.count + n.count);
			p.longitude = (p.longitude * p.count + n.longitude * n.count) / (p.count + n.count);
			p.count += n.count;
		}
		const list = Object.values(byKey).sort((a, b) => b.count - a.count);
		const sum = list.reduce((s, p) => s + p.count, 0) || 1;
		return list.map((p, i) => ({
			...p,
			key: `${p.name}|${i}`,
			rank: i + 1,
			share: p.count / sum,
			pos: toPercent(p.latitude, p.longitude),
			arc: arcPath(p.latitude, p.longitude),
			km: distanceKm(PURWAKARTA, p)
		}));
	});
	let top = $derived(places.slice(0, 4));
	let shown = $derived(places.slice(0, 40));
	let sel = $derived(places.find((p) => p.key === selected));
	let base = toPercent(PURWAKARTA.latitude, PURWAKARTA.longitude);

	function dotSize(count: number, on: boolean) {
		const s = mode === 'dot' ? Math.round(10 + Math.sqrt(count / (top[0]?.count || 1)) * 20) : 9;
		return on ? Math.max(18, s + 6) : s;
	}
	const leaf = (i: number) => (i % 2 ? 'rounded-leaf-r' : 'rounded-leaf');
</script>

<section
	aria-labelledby="w-h"
	class="relative overflow-hidden bg-[#cdd2d8] lg:h-[max(100dvh,820px)] dark:bg-[#1c2128]"
>
	<!-- Map stage: a 1440×900 board scaled to cover the section -->
	<div class="stage relative h-[min(70dvh,560px)] w-full lg:absolute lg:inset-0 lg:h-auto">
		<div
			class="board mode-{mode} absolute top-1/2 left-1/2 aspect-[1440/900] -translate-x-1/2 -translate-y-1/2"
		>
			<svg
				viewBox="0 0 1440 900"
				role="img"
				aria-label={m.gis_world_map_label()}
				class="absolute inset-0 size-full"
			>
				<defs><path id="hx" d={HEX_PATH} /></defs>
				<path d={FRAME_PATH} class="frame" stroke="rgba(255,255,255,.7)" stroke-width="1.5" />
				<path
					class="grat"
					d={GRATICULE_PATH}
					fill="none"
					stroke="#FFFFFF"
					stroke-opacity=".55"
					stroke-width="1"
				/>
				<g class="hexes">
					{#each landHexes as h, i (i)}
						<use href="#hx" x={h.x} y={h.y} class="d{density[i]}" />
					{/each}
				</g>
				<g class="arcs" aria-hidden="true">
					{#each shown as p, i (p.key)}
						<path
							class="arc"
							style="animation-delay: {((i * 0.17) % 2).toFixed(2)}s"
							d={p.arc}
							stroke-width={(1 + Math.min(1, p.share * 4)).toFixed(1)}
						/>
					{/each}
				</g>
			</svg>

			{#if mode !== 'hex'}
				{#each shown as p (p.key)}
					{@const on = selected === p.key}
					{@const sz = dotSize(p.count, on)}
					<div
						class="absolute size-0"
						style="left: {p.pos.x}%; top: {p.pos.y}%; z-index: {on ? 7 : 5}"
					>
						<button
							type="button"
							onclick={() => (selected = on ? null : p.key)}
							aria-pressed={on}
							aria-label={m.gis_world_place_label({
								name: p.name,
								count: numberFmt.format(p.count)
							})}
							class="absolute -top-4 -left-4 size-8 p-0"
						>
							<span
								class="cdot absolute top-1/2 left-1/2 box-border border-2 border-white shadow-[0_2px_6px_rgba(30,32,38,.25)] {on
									? 'rounded-[7px_3px_7px_3px] bg-route'
									: 'rounded-full bg-primary'}"
								style="width: {sz}px; height: {sz}px; margin: {-sz / 2}px 0 0 {-sz / 2}px"
							></span>
						</button>
					</div>
				{/each}
			{/if}

			<!-- Purwakarta, home base -->
			<div aria-hidden="true" class="absolute z-[6] size-0" style="left: {base.x}%; top: {base.y}%">
				<span
					class="halo absolute -top-[22px] -left-[22px] size-11 rounded-leaf-sm border-2 border-route"
				></span>
				<svg width="30" height="40" viewBox="0 0 30 40" class="absolute -top-10 -left-[15px]">
					<path
						d="M15 1C7.3 1 1 7 1 14.6 1 24.8 15 39 15 39s14-14.2 14-24.4C29 7 22.7 1 15 1z"
						fill="var(--route)"
						stroke="#FFFFFF"
						stroke-width="2.5"
					/>
					<circle cx="15" cy="14.5" r="5.5" fill="#FFFFFF" />
				</svg>
				<span
					class="absolute -top-[30px] left-[18px] rounded-leaf-xs bg-[#25272b] px-2.5 py-1 font-mono text-[11px] whitespace-nowrap text-white"
					>{m.gis_world_base()}</span
				>
			</div>

			{#if sel && mode !== 'hex'}
				<div
					role="status"
					class="glass pop absolute z-[8] flex min-w-[200px] flex-col gap-1 rounded-leaf px-[18px] py-3.5"
					style="left: {sel.pos.x}%; top: {sel.pos
						.y}%; transform: translate(-50%, calc(-100% - 22px))"
				>
					<span class="font-mono text-[11px] font-semibold text-primary"
						>#{sel.rank} · {numberFmt.format(sel.km)} km</span
					>
					<span class="text-lg font-black">{sel.name}</span>
					<span class="font-mono text-xs text-ink-soft"
						>{m.gis_world_visits({ count: numberFmt.format(sel.count) })} · {(
							sel.share * 100
						).toFixed(1)}%</span
					>
				</div>
			{/if}
		</div>

		<div
			class="glass absolute top-[96px] right-4 hidden gap-3.5 rounded-leaf-sm px-3.5 py-2 font-mono text-[11px] text-ink-soft lg:top-[112px] lg:flex"
		>
			<span>EQUAL EARTH</span><span>EPSG:8857</span><span>{m.gis_world_center()}</span>
		</div>
	</div>

	<!-- Panels: floating on desktop, stacked under the map on phones -->
	<div
		class="relative flex flex-col gap-2.5 p-3 sm:p-4 lg:pointer-events-none lg:absolute lg:inset-x-0 lg:bottom-0 lg:flex-row lg:items-end lg:justify-between"
	>
		<section class="shard flex w-full flex-col lg:pointer-events-auto lg:w-[390px]">
			<p class="tab tab-r eyebrow flex h-11 items-center self-start px-5 text-[13px]">
				{m.gis_world_eyebrow()}
			</p>
			<div class="flex flex-col gap-3.5 rounded-[0_32px_32px_32px] bg-card p-6">
				<h1
					id="w-h"
					class="m-0 text-[clamp(36px,4vw,46px)] leading-none font-black tracking-[-0.03em]"
				>
					{m.gis_world_title()}
				</h1>
				<p class="m-0 text-base leading-[1.55] text-ink-soft">{m.gis_world_lead()}</p>
				<dl class="m-0 grid grid-cols-3 gap-1.5">
					{#each stats as [k, v, tone], i (k)}
						<div
							class="bg-well p-3 {i % 2
								? 'rounded-[10px_22px_10px_22px]'
								: 'rounded-[22px_10px_22px_10px]'}"
						>
							<dt class="font-mono text-[11px] text-ink-soft">{k}</dt>
							<dd class="m-0 mt-1 text-[23px] font-black {tone}">{numberFmt.format(v)}</dd>
						</div>
					{/each}
				</dl>
			</div>
		</section>

		<section
			aria-label={m.gis_world_mode()}
			class="shard flex w-full flex-col lg:pointer-events-auto lg:w-[380px]"
		>
			<span
				class="tab tab-l flex h-11 items-center self-end px-5 font-mono text-xs font-semibold text-ink-soft"
				>{m.gis_world_mode()}</span
			>
			<div class="flex flex-col gap-3 rounded-[30px_0_30px_30px] bg-card p-3.5">
				<div
					role="group"
					aria-label={m.gis_world_mode()}
					class="relative flex rounded-leaf bg-well p-1"
				>
					<span
						aria-hidden="true"
						class="thumb absolute top-1 bottom-1 bg-primary shadow-[0_4px_10px_rgba(30,32,38,.18)] {modeIndex %
						2
							? 'rounded-leaf-sm-r'
							: 'rounded-leaf-sm'}"
						style="left: calc(4px + {modeIndex} * (100% - 8px) / 3); width: calc((100% - 8px) / 3)"
					></span>
					{#each MODES as md (md.id)}
						<button
							type="button"
							onclick={() => (mode = md.id)}
							aria-pressed={mode === md.id}
							class="relative flex min-h-[46px] flex-1 items-center justify-center gap-1.5 text-[15px] font-extrabold transition-colors duration-300 {mode ===
							md.id
								? 'text-primary-foreground'
								: 'text-ink-soft'}"
						>
							<svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
								<path
									d={md.icon}
									fill="none"
									stroke="currentColor"
									stroke-width="1.9"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
							{md.label()}
						</button>
					{/each}
				</div>
				<p class="mx-1 my-0 text-sm leading-normal text-ink-soft">{MODES[modeIndex].desc()}</p>
				{#if mode === 'hex'}
					<div class="flex items-center gap-1 px-1" role="img" aria-label={m.gis_world_scale()}>
						<span class="mr-1 font-mono text-[10px] text-ink-soft">{m.gis_legend_few()}</span>
						{#each [1, 2, 3, 4, 5] as d (d)}
							<svg width="16" height="18" viewBox="-8 -9 16 18" aria-hidden="true"
								><use href="#hx" class="legend d{d}" /></svg
							>
						{/each}
						<span class="ml-1 font-mono text-[10px] text-ink-soft">{m.gis_legend_dense()}</span>
					</div>
				{/if}
				{#if top.length}
					<ol class="m-0 flex list-none flex-col gap-0.5 p-0">
						{#each top as p, i (p.key)}
							{@const on = selected === p.key}
							<li>
								<button
									type="button"
									onclick={() => {
										selected = on ? null : p.key;
										if (mode === 'hex') mode = 'dot';
									}}
									aria-pressed={on}
									class="flex min-h-11 w-full items-center gap-3 px-2.5 text-left {leaf(i)} {on
										? 'bg-white shadow-[inset_0_0_0_1.5px_var(--primary)] dark:bg-white/10'
										: 'hover:bg-white/60 dark:hover:bg-white/5'}"
								>
									<span class="w-5 font-mono text-xs text-ink-soft"
										>{String(i + 1).padStart(2, '0')}</span
									>
									<span class="min-w-0 flex-1 truncate font-extrabold">{p.name}</span>
									<span class="h-1.5 w-[90px] overflow-hidden rounded-full bg-well">
										<span
											class="block h-full rounded-full {i === 0 ? 'bg-route' : 'bg-primary'}"
											style="width: {Math.round((p.count / top[0].count) * 100)}%"
										></span>
									</span>
									<span class="w-12 text-right font-mono text-xs font-semibold"
										>{numberFmt.format(p.count)}</span
									>
								</button>
							</li>
						{/each}
					</ol>
				{:else}
					<p class="m-0 rounded-leaf bg-well px-4 py-3 text-sm text-ink-soft">
						{m.gis_world_empty()}
					</p>
				{/if}
			</div>
		</section>
	</div>
</section>

<style>
	.stage {
		container-type: size;
	}
	.board {
		width: max(100cqw, 160cqh);
	}
	.frame {
		fill: #d3d8de;
	}
	:global(.dark) .frame {
		fill: #262d36;
	}
	.hexes use,
	.legend {
		transition: fill 0.6s ease;
	}
	.d0 {
		fill: #e9e7e2;
	}
	:global(.dark) .d0 {
		fill: #353b44;
	}
	.d1 {
		fill: #cbd3dd;
	}
	.d2 {
		fill: #a3b0c3;
	}
	.d3 {
		fill: #7088aa;
	}
	.d4 {
		fill: var(--primary);
	}
	.d5 {
		fill: var(--route);
	}
	/* Dots and flow modes: the grid goes quiet so the points/arcs read. */
	.mode-dot .hexes use,
	.mode-flow .hexes use {
		fill: #e9e7e2;
	}
	:global(.dark) .mode-dot .hexes use,
	:global(.dark) .mode-flow .hexes use {
		fill: #353b44;
	}
	.arcs {
		opacity: 0;
		transition: opacity 0.4s ease;
	}
	.mode-flow .arcs {
		opacity: 1;
	}
	.arc {
		fill: none;
		stroke: var(--route);
		stroke-linecap: round;
		stroke-dasharray: 4 10;
		animation: flow 1.4s linear infinite;
	}
	.grat {
		stroke-dasharray: 3 6;
		animation: flow 6s linear infinite;
	}
	.cdot {
		transition:
			width 0.5s cubic-bezier(0.34, 1.3, 0.5, 1),
			height 0.5s cubic-bezier(0.34, 1.3, 0.5, 1),
			margin 0.5s cubic-bezier(0.34, 1.3, 0.5, 1),
			background-color 0.3s,
			border-radius 0.5s cubic-bezier(0.34, 1.3, 0.5, 1);
	}
	.thumb {
		transition:
			left 0.62s cubic-bezier(0.34, 1.3, 0.5, 1),
			border-radius 0.62s;
	}
	.halo {
		animation: halo 2.2s ease-out infinite;
	}
	.pop {
		animation: pop 0.45s cubic-bezier(0.34, 1.3, 0.5, 1) both;
	}
	@keyframes flow {
		to {
			stroke-dashoffset: -32;
		}
	}
	@keyframes halo {
		from {
			transform: scale(0.4);
			opacity: 0.9;
		}
		to {
			transform: scale(2.2);
			opacity: 0;
		}
	}
	@keyframes pop {
		from {
			opacity: 0;
			transform: translate(-50%, calc(-100% + 14px)) scale(0.9);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.arc,
		.grat,
		.halo,
		.pop {
			animation: none;
		}
		.hexes use,
		.cdot,
		.thumb {
			transition: none;
		}
	}
</style>
