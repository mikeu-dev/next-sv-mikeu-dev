<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';

	// --- Layer toggles -------------------------------------------------------
	type LayerKey = 'buildings' | 'route' | 'buffer' | 'poly';
	let layers = $state<Record<LayerKey, boolean>>({
		buildings: true,
		route: true,
		buffer: true,
		poly: true
	});
	const layerDefs: { key: LayerKey; label: () => string }[] = [
		{ key: 'buildings', label: m.gis_layer_buildings },
		{ key: 'route', label: m.gis_layer_route },
		{ key: 'buffer', label: m.gis_layer_buffer },
		{ key: 'poly', label: m.gis_layer_poly }
	];

	// --- Zoom / bearing ------------------------------------------------------
	let zoom = $state(16);
	let bearing = $state(20);
	let artScale = $derived(1 + (zoom - 16) * 0.12);

	// --- Cursor readout ------------------------------------------------------
	let mx = $state(0.7);
	let my = $state(0.42);
	let lat = $derived((6.548 + my * 0.018).toFixed(4) + '° S');
	let lon = $derived((107.432 + mx * 0.024).toFixed(4) + '° E');

	function onMove(e: PointerEvent) {
		if (e.pointerType !== 'mouse') return;
		const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
		mx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
		my = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
	}

	// --- Vector tiles that "load" and fade out on first paint ----------------
	// Pre-computed (deterministic) so SSR and hydration match.
	const tiles: { x: number; y: number; label: string; delay: number }[] = [];
	for (let col = 0; col < 8; col++) {
		for (let row = 0; row < 9; row++) {
			const x = col * 256;
			const y = row * 256;
			// Fan out from the map centre (≈ col 4, row 3).
			const d = Math.hypot(col - 4, row - 3.2);
			tiles.push({
				x,
				y,
				label: `16/${52326 + col}/${33966 + row}`,
				delay: +(0.1 + d * 0.16).toFixed(2)
			});
		}
	}

	const MAP_TRANSFORM = 'matrix(0.93969 -0.20521 0.34202 0.56382 -489.65 112.44)';
	const ROUTE = 'M723 1459 L999 1459 L999 1652 L1299 1652';
	const POLY = 'M1025 1335 L1183 1340 L1202 1462 L1041 1465Z';
	const POLY_VERTS = [
		[1025, 1335],
		[1183, 1340],
		[1202, 1462],
		[1041, 1465]
	];
	const BUILDINGS = [1, 2, 3, 4];
	const STACK_PREVIEW = ['Leaflet', 'OpenLayers', 'Laravel', 'SvelteKit'];
</script>

<section
	aria-label={m.gis_hero_label()}
	onpointermove={onMove}
	class="relative flex min-h-[760px] flex-col overflow-hidden bg-secondary pt-24 sm:min-h-[900px] sm:pt-28"
>
	<!-- Map canvas -->
	<div
		aria-hidden="true"
		class="pointer-events-none absolute inset-0 transition-transform duration-700 ease-out"
		style="transform: scale({artScale}); transform-origin: 62% 55%"
	>
		<img
			src="/images/map/hero-basemap.svg"
			alt=""
			class="map-art absolute inset-0 block size-full object-cover object-[70%_50%] md:object-center"
		/>
		<svg
			viewBox="0 0 1440 900"
			preserveAspectRatio="xMidYMid slice"
			class="map-art absolute inset-0 block size-full"
		>
			<g transform={MAP_TRANSFORM}>
				{#if layers.buffer}
					{#each [0, 1, 2] as i (i)}
						<circle
							class="map-buf"
							style="animation-delay: {i}s"
							cx="1617"
							cy="761"
							r="190"
							fill="var(--primary)"
							fill-opacity=".10"
							stroke="var(--primary)"
							stroke-width="3"
						/>
					{/each}
					<circle
						cx="1617"
						cy="761"
						r="70"
						fill="none"
						stroke="var(--primary)"
						stroke-width="3"
						stroke-dasharray="10 8"
					/>
					<circle cx="1617" cy="761" r="12" fill="var(--primary)" stroke="#fff" stroke-width="5" />
				{/if}
				{#if layers.route}
					<path
						d={ROUTE}
						fill="none"
						stroke="#fff"
						stroke-width="22"
						stroke-linejoin="round"
						stroke-linecap="round"
					/>
					<path
						d={ROUTE}
						fill="none"
						stroke="var(--route)"
						stroke-width="12"
						stroke-linejoin="round"
						stroke-linecap="round"
					/>
					<path
						class="map-flow-dots"
						d={ROUTE}
						fill="none"
						stroke="#fff"
						stroke-width="4"
						stroke-linecap="round"
					/>
					<circle
						class="hero-car"
						r="16"
						fill="var(--route)"
						stroke="#fff"
						stroke-width="6"
						style="offset-path: path('{ROUTE}')"
					/>
				{/if}
				{#if layers.poly}
					<path class="hero-pfill" d={POLY} fill="var(--primary)" fill-opacity=".18" />
					<path
						class="hero-pline"
						pathLength="1"
						d={POLY}
						fill="none"
						stroke="var(--primary)"
						stroke-width="5"
						stroke-linejoin="round"
					/>
					{#each POLY_VERTS as [cx, cy], i (i)}
						<circle
							class="hero-vtx"
							style="animation-delay: {i * 0.5}s"
							{cx}
							{cy}
							r="11"
							fill="#fff"
							stroke="var(--primary)"
							stroke-width="5"
						/>
					{/each}
				{/if}
				{#each tiles as t (t.label)}
					<g class="hero-tile" style="animation-delay: {t.delay}s">
						<rect x={t.x} y={t.y} width="256" height="256" fill="#F2EFE9" />
						<rect
							x={t.x + 2}
							y={t.y + 2}
							width="252"
							height="252"
							fill="none"
							stroke="#B9B0A0"
							stroke-dasharray="6 6"
						/>
						<text
							x={t.x + 14}
							y={t.y + 30}
							font-family="Red Hat Mono, monospace"
							font-size="17"
							fill="#8A7F6C">{t.label}</text
						>
					</g>
				{/each}
			</g>
		</svg>
		{#if layers.buildings}
			{#each BUILDINGS as n (n)}
				<img
					src="/images/map/hero-buildings-{n}.svg"
					alt=""
					class="map-art map-rise absolute inset-0 block size-full object-cover object-[70%_50%] md:object-center"
					style="animation-delay: {0.7 + n * 0.3}s"
				/>
			{/each}
		{/if}
		{#if layers.route}
			<svg
				viewBox="0 0 1440 900"
				preserveAspectRatio="xMidYMid slice"
				class="absolute inset-0 block size-full"
			>
				{#each [{ x: 672, y: 741, l: 'A', c: 'var(--route)' }, { x: 1279, y: 731, l: 'B', c: 'var(--primary)' }] as p (p.l)}
					<g transform="translate({p.x} {p.y})">
						<g class="map-drop" style="animation-delay: 2.4s">
							<path
								d="M17 1C8.2 1 1 7.9 1 16.6 1 28.2 17 45 17 45s16-16.8 16-28.4C33 7.9 25.8 1 17 1z"
								fill={p.c}
								stroke="#fff"
								stroke-width="2.5"
							/>
							<text
								x="17"
								y="22"
								text-anchor="middle"
								font-family="Nunito, sans-serif"
								font-size="15"
								font-weight="900"
								fill="#fff">{p.l}</text
							>
						</g>
					</g>
				{/each}
			</svg>
		{/if}
	</div>

	<!-- Cursor crosshair + coordinate label (mouse only) -->
	<div
		aria-hidden="true"
		class="pointer-events-none absolute -mt-[17px] -ml-[17px] hidden size-[34px] rounded-full border-2 border-primary bg-white/35 md:block"
		style="left: {mx * 100}%; top: {my * 100}%"
	></div>
	<div
		aria-hidden="true"
		class="pointer-events-none absolute mt-6 ml-5 hidden rounded-full bg-foreground px-2.5 py-1 font-mono text-[11px] whitespace-nowrap text-background md:block"
		style="left: {mx * 100}%; top: {my * 100}%; transform: translateX({mx > 0.78
			? 'calc(-100% - 40px)'
			: '0px'})"
	>
		{lat}, {lon}
	</div>

	<!-- Foreground UI -->
	<div
		class="pointer-events-none relative flex flex-1 flex-wrap items-end justify-between gap-6 px-4 pt-[min(38vh,320px)] pb-8 sm:px-[clamp(16px,3vw,40px)] sm:pt-10"
	>
		<div
			class="pointer-events-auto flex flex-[0_1_500px] flex-col gap-[18px] rounded-[32px] border border-border bg-card p-[clamp(22px,2.6vw,34px)] shadow-card"
		>
			<p
				class="m-0 inline-flex items-center gap-2 self-start rounded-full bg-accent px-3.5 py-[7px] font-mono text-[13px] font-semibold text-primary"
			>
				<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
					<circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" stroke-width="1.6" />
					<circle cx="7" cy="7" r="2.2" fill="currentColor" />
				</svg>
				Purwakarta · 6.5569° S, 107.4431° E
			</p>
			<p class="m-0 text-lg font-extrabold text-ink-soft">{m.gis_hero_hello()}</p>
			<h1 class="m-0 text-[clamp(38px,4.3vw,58px)] leading-[1.04] font-black tracking-[-0.03em]">
				{m.gis_hero_title_a()} <span class="text-primary">{m.gis_hero_title_em()}</span>
				{m.gis_hero_title_b()}
			</h1>
			<p class="m-0 text-[17px] leading-relaxed text-ink-soft">{m.gis_hero_lead()}</p>
			<div class="flex flex-wrap gap-1.5">
				{#each STACK_PREVIEW as s (s)}
					<span class="rounded-full bg-secondary px-2.5 py-1.5 font-mono text-xs font-semibold"
						>{s}</span
					>
				{/each}
			</div>
			<div class="flex flex-wrap gap-2.5">
				<a href="#work" class="btn-pill-solid min-h-[52px] px-[26px]">
					{m.hero_button_link()}
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
				<a href={localizeHref('/contact')} class="btn-pill-line min-h-[52px]">
					{m.hero_button_text()}
				</a>
			</div>
		</div>

		<div class="pointer-events-auto hidden flex-col items-end gap-3 md:flex">
			<div
				class="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-float"
			>
				<button
					type="button"
					aria-label={m.gis_hero_zoom_in()}
					disabled={zoom >= 18}
					onclick={() => (zoom = Math.min(18, zoom + 1))}
					class="flex size-12 items-center justify-center border-b border-border text-foreground hover:bg-secondary disabled:opacity-40"
				>
					<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
						<path
							d="M9 3v12M3 9h12"
							stroke="currentColor"
							stroke-width="2.2"
							stroke-linecap="round"
						/>
					</svg>
				</button>
				<button
					type="button"
					aria-label={m.gis_hero_zoom_out()}
					disabled={zoom <= 16}
					onclick={() => (zoom = Math.max(16, zoom - 1))}
					class="flex size-12 items-center justify-center border-b border-border text-foreground hover:bg-secondary disabled:opacity-40"
				>
					<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
						<path d="M3 9h12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
					</svg>
				</button>
				<button
					type="button"
					aria-label={m.gis_hero_north()}
					onclick={() => (bearing = 0)}
					class="flex size-12 items-center justify-center hover:bg-secondary"
				>
					<svg
						class={bearing ? 'map-wob' : ''}
						width="24"
						height="24"
						viewBox="0 0 24 24"
						aria-hidden="true"
						style="transition: transform .4s ease"
					>
						<path d="M12 2l4 10h-8z" fill="#E5484D" />
						<path d="M12 22l-4-10h8z" fill="#B5AC9C" />
					</svg>
				</button>
			</div>
			<div
				role="group"
				aria-label={m.gis_layers_label()}
				class="flex min-w-[220px] flex-col gap-2 rounded-[22px] border border-border bg-card p-3.5 shadow-float"
			>
				<span class="px-1 font-mono text-xs font-semibold text-muted-foreground"
					>{m.gis_layers()}</span
				>
				{#each layerDefs as l (l.key)}
					{@const on = layers[l.key]}
					<button
						type="button"
						aria-pressed={on}
						onclick={() => (layers[l.key] = !on)}
						class="flex min-h-11 items-center gap-2.5 rounded-full border-[1.5px] py-0 pr-3.5 pl-2.5 text-left text-[15px] font-bold text-foreground transition-colors hover:border-foreground {on
							? 'border-primary bg-accent'
							: 'border-border bg-card'}"
					>
						<span
							class="relative h-5 w-[34px] flex-none rounded-full transition-colors {on
								? 'bg-primary'
								: 'bg-line-strong'}"
						>
							<span
								class="absolute top-[3px] size-3.5 rounded-full bg-white transition-[left] duration-200"
								style="left: {on ? 17 : 3}px"
							></span>
						</span>
						{l.label()}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Scale bar / map readout -->
	<div
		class="relative mx-4 mb-5 flex flex-wrap items-center gap-x-[18px] gap-y-2 self-start rounded-[22px] border border-border bg-card px-[18px] py-2.5 font-mono text-xs text-muted-foreground sm:mx-[clamp(16px,3vw,40px)] sm:rounded-full"
	>
		<span class="flex items-center gap-2">
			<span class="flex h-2 w-[120px] border-[1.5px] border-t-0 border-foreground">
				<span class="flex-1 border-r-[1.5px] border-foreground"></span>
				<span class="flex-1"></span>
			</span>
			{Math.round(200 / 2 ** (zoom - 16))} m
		</span>
		<span>PITCH <b class="text-foreground">53°</b></span>
		<span>BEARING <b class="text-foreground">{bearing}°</b></span>
		<span>ZOOM <b class="text-foreground">{zoom}</b></span>
		<span class="hidden sm:inline">LAT <b class="text-foreground">{lat}</b></span>
		<span class="hidden sm:inline">LON <b class="text-foreground">{lon}</b></span>
	</div>
</section>

<style>
	.hero-tile {
		animation: tileout 0.7s ease both;
	}
	.hero-car {
		offset-rotate: 0deg;
		animation: car 10s ease-in-out infinite alternate;
	}
	.hero-pline {
		stroke-dasharray: 1;
		stroke-dashoffset: 1;
		animation: pline 7s ease infinite;
	}
	.hero-pfill {
		animation: pfill 7s ease infinite;
	}
	.hero-vtx {
		transform-box: fill-box;
		transform-origin: center;
		animation: vtx 7s ease infinite both;
	}
	@keyframes tileout {
		0%,
		35% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			visibility: hidden;
		}
	}
	@keyframes car {
		from {
			offset-distance: 0%;
		}
		to {
			offset-distance: 100%;
		}
	}
	@keyframes pline {
		0% {
			stroke-dashoffset: 1;
			opacity: 1;
		}
		40%,
		88% {
			stroke-dashoffset: 0;
			opacity: 1;
		}
		100% {
			stroke-dashoffset: 0;
			opacity: 0;
		}
	}
	@keyframes pfill {
		0%,
		40% {
			opacity: 0;
		}
		52%,
		88% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}
	@keyframes vtx {
		0% {
			transform: scale(0);
		}
		6%,
		88% {
			transform: scale(1);
		}
		100% {
			transform: scale(0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.hero-tile {
			display: none;
		}
		.hero-car,
		.hero-pline,
		.hero-pfill,
		.hero-vtx {
			animation: none;
		}
		.hero-car {
			offset-distance: 45%;
		}
		.hero-pline {
			stroke-dashoffset: 0;
		}
	}
</style>
