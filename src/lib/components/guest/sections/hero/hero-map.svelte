<script module lang="ts">
	export type LayerKey = 'buildings' | 'route' | 'buffer' | 'poly';
</script>

<script lang="ts">
	import basemapSvg from '#lib/assets/scenes/hero-basemap.svg?raw';

	/**
	 * The home hero's isometric city: basemap, vector tiles that load and fade,
	 * analysis layers (buffer rings, A→B route with a moving vehicle, a polygon
	 * being digitised) and 3D buildings rising in.
	 */
	let {
		layers,
		artScale = 1,
		fit = 'object-center',
		focusX = 50,
		rise = true
	}: {
		layers: Record<LayerKey, boolean>;
		artScale?: number;
		/** object-position utility for the raster layers */
		fit?: string;
		/** horizontal focus (%) of the cropped basemap, like object-position x */
		focusX?: number;
		/**
		 * Animate the 3D buildings rising in. Off for the phone hero: the
		 * buildings are the largest image there, so a delayed fade-in made them
		 * a late LCP.
		 */
		rise?: boolean;
	} = $props();

	// The basemap is inlined rather than an <img>: it then paints with the
	// HTML (no request, no image decode) and, not being an image, is no longer
	// the page's LCP element — on phones it was, with ~1.2 s of render delay.
	// Its one id gets a per-instance suffix (the hero renders two maps).
	const uid = $props.id();
	const basemap = basemapSvg
		// size attributes of the root <svg> only; the inner rects keep theirs
		.replace(/^<svg([^>]*?)\swidth="\d+"\sheight="\d+"/, '<svg$1')
		.replace('<svg ', '<svg preserveAspectRatio="xMidYMid slice" class="block size-full" ')
		.replaceAll('river3', `river3-${uid}`);

	// Vector tiles that "load" and fade out on first paint ----------------
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
</script>

<div
	aria-hidden="true"
	class="map-mute pointer-events-none absolute inset-0 transition-transform duration-700 ease-out"
	style="transform: scale({artScale}); transform-origin: 62% 55%"
>
	<!-- Cover-crop like object-fit: cover, focused at focusX%. -->
	<div
		class="map-art absolute inset-y-0 aspect-[1440/900] h-full min-w-full"
		style="left: {focusX}%; transform: translateX(-{focusX}%)"
	>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- static asset from the repo -->
		{@html basemap}
	</div>
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
					fill="#D9733A"
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
				loading={rise ? 'lazy' : 'eager'}
				decoding="async"
				fetchpriority={rise ? 'low' : 'high'}
				class="map-art {rise ? 'map-rise' : ''} absolute inset-0 block size-full object-cover {fit}"
				style={rise ? `animation-delay: ${0.7 + n * 0.3}s` : undefined}
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
