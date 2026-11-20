<script lang="ts">
	/**
	 * A cropped, zoomed view of the flat basemap. `x`/`y` (0–100) is the point
	 * centred in the frame. `variant` adds either a pin with pulse rings or an
	 * animated A→B route, the two motifs used for project and post thumbnails.
	 */
	let {
		x = 50,
		y = 50,
		zoom = 2.6,
		variant = 'pin',
		seed = 0,
		class: className = ''
	}: {
		x?: number;
		y?: number;
		zoom?: number;
		variant?: 'pin' | 'route' | 'none';
		seed?: number;
		class?: string;
	} = $props();

	let left = $derived(50 - zoom * x);
	let top = $derived(50 - zoom * y);

	// Route geometry varies a little per item so a grid of cards doesn't repeat.
	let route = $derived.by(() => {
		const a = 14 + (seed % 5) * 1.5;
		const b = 62 + (seed % 3) * 4;
		const c = 40 + (seed % 4) * 3;
		const d = 24 + (seed % 5) * 3;
		const e = 70 + (seed % 3) * 5;
		const tone = ['var(--primary)', 'var(--success)', 'var(--route)'][seed % 3];
		return { path: `M${a} ${b} L${c} ${b} L${c} ${d} L${e} ${d}`, a, b, d, e, tone };
	});
</script>

<div aria-hidden="true" class="relative size-full overflow-hidden bg-secondary {className}">
	<img
		src="/images/map/flat-basemap.svg"
		alt=""
		class="map-art map-mute absolute max-w-none"
		style="width: {zoom * 100}%; height: {zoom * 100}%; left: {left}%; top: {top}%"
	/>
	{#if variant === 'pin'}
		<div class="absolute top-1/2 left-1/2 size-0">
			<span class="map-ring"></span>
			<svg width="26" height="35" viewBox="0 0 30 40" class="absolute -top-[35px] -left-[13px]">
				<path
					d="M15 1C7.3 1 1 7 1 14.6 1 24.8 15 39 15 39s14-14.2 14-24.4C29 7 22.7 1 15 1z"
					fill="var(--primary)"
					stroke="#FFFFFF"
					stroke-width="2"
				/>
				<circle cx="15" cy="14.5" r="5.5" fill="#FFFFFF" />
			</svg>
		</div>
	{:else if variant === 'route'}
		<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="absolute inset-0 size-full">
			<path
				d={route.path}
				fill="none"
				stroke="#FFFFFF"
				stroke-width="7"
				stroke-linejoin="round"
				stroke-linecap="round"
				vector-effect="non-scaling-stroke"
			/>
			<path
				class="map-dash"
				d={route.path}
				fill="none"
				stroke={route.tone}
				stroke-width="3.5"
				stroke-linejoin="round"
				stroke-linecap="round"
				vector-effect="non-scaling-stroke"
			/>
		</svg>
		<span
			class="absolute -mt-2 -ml-2 size-4 rounded-full border-[3px] border-white bg-route shadow-[0_2px_6px_rgba(23,33,43,.25)]"
			style="left: {route.a}%; top: {route.b}%"
		></span>
		<span
			class="absolute -mt-2.5 -ml-2.5 size-5 rounded-full border-[3px] border-white shadow-[0_2px_6px_rgba(23,33,43,.25)]"
			style="left: {route.e}%; top: {route.d}%; background: {route.tone}"
		></span>
	{/if}
</div>
