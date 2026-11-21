<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { PUBLIC_CONTACT_EMAIL } from '$app/env/public';
	import HeroMap, { type LayerKey } from './hero-map.svelte';
	import { onMount } from 'svelte';
	import { H, heroLayout, introPills } from './hero-shapes.js';

	const email = PUBLIC_CONTACT_EMAIL || 'rikiruswandi28@gmail.com';

	// --- Layers --------------------------------------------------------------
	let layers = $state<Record<LayerKey, boolean>>({
		buildings: true,
		route: true,
		buffer: true,
		poly: true
	});
	const LAYER_DEFS: { key: LayerKey; label: () => string; icon: string }[] = [
		{
			key: 'buildings',
			label: m.gis_layer_buildings,
			icon: 'M3 17h14M5 17V8l5-3 5 3v9M8 17v-4h4v4'
		},
		{ key: 'route', label: m.gis_layer_route, icon: 'M3 15l4-7 4 4 6-8' },
		{
			key: 'buffer',
			label: m.gis_layer_buffer,
			icon: 'M10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM10 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z'
		},
		{ key: 'poly', label: m.gis_layer_poly, icon: 'M4 7l6-4 6 4-2 9H6z' }
	];
	const STACK_PREVIEW = ['Leaflet', 'OpenLayers', 'Laravel', 'SvelteKit'];

	// --- Panels --------------------------------------------------------------
	let width = $state(1440);
	let leftOpen = $state(true);
	let rightOpen = $state(true);
	let askOpen = $state(false);
	let L = $derived(heroLayout(width, leftOpen, rightOpen));
	let P = $derived(introPills(width));
	let shapes = $derived([
		[L.leftD, P.leftD],
		[L.headD, P.headD],
		[L.rightD, P.rightD]
	]);

	// --- Intro: loading pills that morph into the shards ----------------------
	// An inline script in app.html adds `intro` to <html> before first paint on
	// a first desktop visit (skipped for reduced motion, bots and repeat visits
	// in the same session). While it is set, CSS draws the shards as three
	// loading pills, hides the hero's content and zooms the camera out; removing
	// it morphs pills → shards and staggers the content in.
	const INTRO_MIN_MS = 2400;
	const INTRO_MAX_MS = 6000;
	const MAP_IMAGES = [
		'/images/map/hero-basemap.svg',
		...[1, 2, 3, 4].map((n) => `/images/map/hero-buildings-${n}.svg`)
	];
	let introProgress = $state(0);
	let introLoaded = $state(false);
	let introEase = $derived(1 - (1 - introProgress) ** 2);
	let introZoom = $derived(12 + 4 * introEase);
	let introTile = $derived.by(() => {
		const z = Math.floor(introZoom);
		const shift = 2 ** (16 - z);
		return `${z}/${Math.floor(52326 / shift)}/${Math.floor(33966 / shift)}`;
	});
	let finishIntro = () => {};

	onMount(() => {
		const root = document.documentElement;
		if (!root.classList.contains('intro')) return;

		let loaded = 0;
		for (const src of MAP_IMAGES) {
			const img = new Image();
			img.onload = img.onerror = () => loaded++;
			img.src = src;
		}

		const start = performance.now();
		let raf = 0;
		let done = false;
		const timers: ReturnType<typeof setTimeout>[] = [];
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') end();
		};
		function end() {
			if (done) return;
			done = true;
			cancelAnimationFrame(raf);
			window.removeEventListener('keydown', onKey);
			introProgress = 1;
			introLoaded = true;
			try {
				sessionStorage.setItem('mikeu-intro', '1');
			} catch {
				/* storage may be unavailable */
			}
			// 1) fade the pills' text, 2) morph pills → shards while the hero's
			// content staggers in, 3) drop the stagger delays once it has played.
			root.classList.add('intro-out');
			timers.push(
				setTimeout(() => {
					root.classList.remove('intro', 'intro-out');
					root.classList.add('intro-done');
					window.dispatchEvent(new Event('mikeu:intro-done'));
				}, 260),
				setTimeout(() => root.classList.remove('intro-done'), 2600)
			);
		}
		finishIntro = end;
		window.addEventListener('keydown', onKey);

		const tick = (now: number) => {
			const t = Math.max(0, now - start);
			const byTime = Math.min(1, t / INTRO_MIN_MS);
			const byLoad = loaded / MAP_IMAGES.length;
			// time drives the bar; it waits at 90% for images that are still loading
			introProgress = t > INTRO_MAX_MS ? 1 : Math.min(byTime, Math.max(byLoad, 0.9));
			if (introProgress >= 1 && !introLoaded) {
				introLoaded = true;
				timers.push(setTimeout(end, 700)); // let "3D buildings loaded" read
			}
			if (!done) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(raf);
			timers.forEach(clearTimeout);
			window.removeEventListener('keydown', onKey);
			if (!done) window.dispatchEvent(new Event('mikeu:intro-done'));
			root.classList.remove('intro', 'intro-out', 'intro-done');
		};
	});

	// --- Map controls --------------------------------------------------------
	let zoom = $state(16);
	let bearing = $state(20);
	let artScale = $derived(1 + (zoom - 16) * 0.12);

	// --- Cursor readout ------------------------------------------------------
	let mx = $state(0.62);
	let my = $state(0.46);
	let lat = $derived((6.548 + my * 0.018).toFixed(4) + '° S');
	let lon = $derived((107.432 + mx * 0.024).toFixed(4) + '° E');
	let cursorVisible = $derived(!L.overPanel(mx * width, my * H, askOpen));

	function onMove(e: PointerEvent) {
		if (e.pointerType !== 'mouse') return;
		const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
		mx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
		my = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
	}

	/** Staggered reveal for the profile's lines as the panel opens/closes. */
	function reveal(i: number) {
		return leftOpen
			? `opacity:1;transform:none;filter:blur(0);transition-delay:${(0.24 + i * 0.055).toFixed(3)}s`
			: `opacity:0;transform:translate(-28px,0) scale(.94);filter:blur(8px);transition-delay:${((4 - i) * 0.025).toFixed(3)}s`;
	}
	const leaf = (i: number) => (i % 2 ? 'rounded-leaf-r' : 'rounded-leaf');
	const leafSm = (i: number) => (i % 2 ? 'rounded-leaf-sm-r' : 'rounded-leaf-sm');

	const SOCIAL = [
		{ href: 'https://github.com/mikeu-dev', label: 'GitHub' },
		{ href: 'https://www.linkedin.com/in/rikiruswandi/', label: 'LinkedIn' },
		{ href: 'https://www.instagram.com/reekey.rushonethe/', label: 'Instagram' }
	];
</script>

<!-- ================= Desktop: map framed by glass shards ================= -->
<section
	aria-label={m.gis_hero_label()}
	onpointermove={onMove}
	bind:clientWidth={width}
	class="relative hidden h-[900px] overflow-hidden bg-background lg:block"
>
	<div class="intro-cam absolute inset-0" style="--cam: {(0.62 + 0.38 * introEase).toFixed(4)}">
		<HeroMap {layers} {artScale} />
	</div>

	<!-- Cursor box + coordinates (hidden over the panels) -->
	<div
		aria-hidden="true"
		class="intro-hide pointer-events-none absolute -mt-[17px] -ml-[17px] size-[34px] rounded-[12px_6px_12px_6px] border-2 border-primary bg-white/35 transition-opacity duration-200"
		style="left: {mx * 100}%; top: {my * 100}%; opacity: {cursorVisible ? 1 : 0}"
	></div>
	<div
		aria-hidden="true"
		class="intro-hide pointer-events-none absolute mt-6 ml-5 rounded-[12px_6px_12px_6px] bg-[#25272b] px-2.5 py-1 font-mono text-[11px] whitespace-nowrap text-white transition-opacity duration-200"
		style="left: {mx * 100}%; top: {my * 100}%; opacity: {cursorVisible
			? 1
			: 0}; transform: translateX({mx > 0.7 ? 'calc(-100% - 40px)' : '0px'})"
	>
		{lat}, {lon}
	</div>

	<!-- The three shards: soft shadow, frosted fill, white edge -->
	<svg
		class="shard pointer-events-none absolute top-0 left-0"
		width="100%"
		height={H}
		viewBox="0 0 {width} {H}"
		aria-hidden="true"
	>
		{#each shapes as [d, pill], i (i)}
			<path
				class="morph"
				style="--shape: path('{d}'); --pill: path('{pill}'); --i: {i}"
				fill="var(--card)"
				fill-opacity=".7"
			/>
		{/each}
	</svg>
	{#each shapes as [d, pill], i (i)}
		<div
			aria-hidden="true"
			class="hero-glass clip pointer-events-none absolute inset-0"
			style="--shape: path('{d}'); --pill: path('{pill}'); --i: {i}"
		></div>
	{/each}
	<svg
		class="pointer-events-none absolute top-0 left-0"
		width="100%"
		height={H}
		viewBox="0 0 {width} {H}"
		aria-hidden="true"
	>
		{#each shapes as [d, pill], i (i)}
			<path
				class="morph"
				style="--shape: path('{d}'); --pill: path('{pill}'); --i: {i}"
				fill="none"
				stroke="var(--panel-edge)"
				stroke-width="1.5"
			/>
		{/each}
	</svg>

	<!-- Intro: the loading pills' content (only while html.intro is set) -->
	<div class="intro-only pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="absolute top-8 left-8 flex h-11 w-[360px] items-center gap-3 px-3">
			<span class="flex size-7 items-center justify-center rounded-leaf-sm bg-primary">
				<span class="size-2.5 rounded-full bg-white"></span>
			</span>
			<span class="text-[17px] font-black tracking-[-0.01em]"
				>mikeu<span class="text-primary">.gis</span></span
			>
			<span class="ml-auto font-mono text-xs text-muted-foreground">{m.gis_intro_loading()}</span>
		</div>
		<div
			class="absolute top-8 flex h-11 w-[280px] items-center justify-between px-5 font-mono text-xs text-ink-soft"
			style="left: {Math.max(1024, width) - 312}px"
		>
			<span>ZOOM <b class="text-foreground">{introZoom.toFixed(1)}</b></span>
			<span>TILE {introTile}</span>
		</div>
	</div>
	<div
		role="status"
		aria-live="polite"
		class="intro-only absolute right-8 left-8 flex h-[46px] items-center gap-4 px-5"
		style="top: 822px"
	>
		<span
			class="font-mono text-xs font-semibold whitespace-nowrap {introLoaded
				? 'text-primary'
				: 'text-ink-soft'}"
		>
			{introLoaded ? m.gis_intro_loaded() : m.gis_intro_fetching()}
		</span>
		<span class="relative h-1.5 flex-1 overflow-hidden rounded-full bg-well">
			<span
				class="absolute inset-y-0 left-0 rounded-full bg-primary"
				style="width: {(introProgress * 100).toFixed(1)}%"
			></span>
		</span>
		<span class="w-10 text-right font-mono text-xs text-ink-soft tabular-nums"
			>{Math.round(introProgress * 100)}%</span
		>
		<button
			type="button"
			onclick={() => finishIntro()}
			class="pointer-events-auto -mr-2 min-h-9 rounded-leaf-sm px-3 text-sm font-extrabold text-primary hover:bg-white/70"
			>{m.gis_intro_skip()}</button
		>
	</div>

	<!-- Left: profile -->
	<section
		aria-label={m.gis_hero_profile()}
		class="intro-hide mm absolute top-[102px] bottom-[102px] left-4 overflow-hidden [--in:550ms]"
		style="width: {L.leftW}px"
	>
		<div
			class="absolute inset-y-0 left-0 box-border flex flex-col justify-center gap-4 px-[34px] pt-5 pb-[26px]"
			style="width: {L.leftOpenW}px; pointer-events: {leftOpen ? 'auto' : 'none'}"
			inert={!leftOpen}
		>
			<div class="flex items-center pr-[52px]">
				<p
					class="mph m-0 inline-flex items-center gap-2 rounded-leaf-sm bg-primary/12 px-3 py-[7px] font-mono text-xs font-semibold text-primary"
					style={reveal(0)}
				>
					<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
						<circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" stroke-width="1.6" />
						<circle cx="7" cy="7" r="2.2" fill="currentColor" />
					</svg>
					Purwakarta · 6.5569° S, 107.4431° E
				</p>
			</div>
			<p class="mph m-0 text-lg font-extrabold text-muted-foreground" style={reveal(1)}>
				{m.gis_hero_hello()}
			</p>
			<h1
				class="mph m-0 leading-[1.04] font-black tracking-[-0.03em]"
				style="{reveal(2)}; font-size: {L.h1Size}px"
			>
				{m.gis_hero_title_a()} <span class="text-primary">{m.gis_hero_title_em()}</span>
				{m.gis_hero_title_b()}
			</h1>
			<p class="mph m-0 text-[17px] leading-relaxed text-ink-soft" style={reveal(3)}>
				{m.gis_hero_lead()}
			</p>
			<div class="mph flex flex-wrap gap-1.5" style={reveal(4)}>
				{#each STACK_PREVIEW as s, i (s)}
					<span
						class="bg-white/70 px-2.5 py-1.5 font-mono text-xs font-semibold dark:bg-white/10 {i % 2
							? 'rounded-[6px_12px_6px_12px]'
							: 'rounded-leaf-xs'}">{s}</span
					>
				{/each}
			</div>
		</div>
		<button
			type="button"
			onclick={() => (leftOpen = !leftOpen)}
			aria-label={leftOpen ? m.gis_hero_collapse_profile() : m.gis_hero_open_profile()}
			aria-expanded={leftOpen}
			title={leftOpen ? m.gis_hero_collapse_profile() : m.gis_hero_open_profile()}
			class="mm absolute z-[2] flex items-center justify-center rounded-leaf-sm {leftOpen
				? 'bg-well text-foreground'
				: 'bg-primary text-primary-foreground'}"
			style="left: {leftOpen ? L.leftOpenW - 74 : 26}px; top: {leftOpen
				? 22
				: 16}px; width: {leftOpen ? 40 : 48}px; height: {leftOpen ? 40 : 48}px"
		>
			<span class="mm flex" style="transform: rotate({leftOpen ? 0 : 180}deg)">
				<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
					<path
						d="M10 3L5 8l5 5"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</span>
		</button>
		<div
			aria-hidden="true"
			class="pointer-events-none absolute top-[82px] left-0 flex w-[100px] justify-center"
		>
			<span
				class="mph font-mono text-xs font-semibold tracking-[0.08em] text-muted-foreground [writing-mode:vertical-rl]"
				style={leftOpen
					? 'opacity:0;transform:rotate(180deg) translateY(-24px);filter:blur(6px)'
					: 'opacity:1;transform:rotate(180deg);filter:blur(0);transition-delay:.38s'}
			>
				{m.gis_hero_rail()}
			</span>
		</div>
	</section>

	<!-- Bottom-left: CTA under the profile -->
	<div
		class="intro-hide mm absolute bottom-4 box-border flex h-[86px] items-center justify-center overflow-hidden px-4 [--in:770ms]"
		style="left: {L.leftFootX}px; width: {L.leftFootW}px"
	>
		<a
			href="#work"
			aria-label={m.hero_button_link()}
			class="mm absolute flex items-center justify-center overflow-hidden font-extrabold whitespace-nowrap no-underline {leftOpen
				? 'h-[54px] w-[236px] rounded-leaf bg-primary text-[17px] text-primary-foreground hover:bg-foreground hover:text-background'
				: 'size-12 rounded-leaf-sm-r bg-well text-foreground'}"
		>
			<span
				aria-hidden="true"
				class="mtx block overflow-hidden"
				style="max-width: {leftOpen ? 170 : 0}px; margin-right: {leftOpen
					? 10
					: 0}px; opacity: {leftOpen ? 1 : 0}; filter: blur({leftOpen ? 0 : 6}px)"
				>{m.hero_button_link()}</span
			>
			<span class="mm flex flex-none" style="transform: rotate({leftOpen ? 0 : 90}deg)">
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
			</span>
		</a>
	</div>

	<!-- Bottom-left slot: scale bar + cursor coordinates -->
	<div
		class="intro-hide mm glass absolute bottom-4 left-4 box-border flex h-[76px] flex-col justify-center gap-[5px] overflow-hidden rounded-[22px_22px_30px_22px] px-4 font-mono text-[11px] whitespace-nowrap text-muted-foreground [--in:850ms]"
		style="width: {L.slotW}px; opacity: {leftOpen ? 1 : 0}"
		aria-hidden={!leftOpen}
	>
		<span class="flex items-center gap-2">
			<span class="flex h-1.5 w-[70px] border-[1.5px] border-t-0 border-foreground">
				<span class="flex-1 border-r-[1.5px] border-foreground"></span>
				<span class="flex-1"></span>
			</span>
			{Math.round(200 / 2 ** (zoom - 16))} m · Z {zoom}
		</span>
		<span class="font-semibold text-foreground">{lat}</span>
		<span class="font-semibold text-foreground">{lon}</span>
	</div>

	<!-- Right: layer panel toggle (under the language tab) -->
	<div
		class="intro-hide absolute top-[66px] right-4 flex h-9 w-[100px] items-center justify-center [--in:670ms]"
	>
		<button
			type="button"
			onclick={() => (rightOpen = !rightOpen)}
			aria-label={rightOpen ? m.gis_hero_collapse_layers() : m.gis_hero_open_layers()}
			aria-expanded={rightOpen}
			class="flex h-8 w-11 items-center justify-center rounded-leaf-sm-r transition-colors duration-300 {rightOpen
				? 'bg-well text-foreground'
				: 'bg-primary text-primary-foreground'}"
		>
			<span class="ms flex" style="transform: rotate({rightOpen ? 0 : 180}deg)">
				<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
					<path
						d="M6 3l5 5-5 5"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</span>
		</button>
	</div>

	<!-- Right: layers -->
	<section
		aria-label={m.gis_layers_title()}
		class="intro-hide mm absolute top-[102px] right-4 bottom-[102px] overflow-hidden [--in:630ms]"
		style="width: {L.rightW}px"
	>
		<div
			role="group"
			aria-label={m.gis_layers_title()}
			class="absolute inset-y-0 right-0 box-border flex w-[280px] flex-col items-end gap-2 pt-3.5 pr-6 pb-[18px] pl-[18px]"
		>
			<div
				class="mtx h-12 self-stretch overflow-hidden"
				style="opacity: {rightOpen ? 1 : 0}; filter: blur({rightOpen ? 0 : 6}px)"
			>
				<div class="flex flex-col gap-0.5 px-1 pb-1.5">
					<span class="text-[17px] font-black whitespace-nowrap">{m.gis_layers_title()}</span>
					<span class="font-mono text-[11px] whitespace-nowrap text-muted-foreground"
						>EPSG:3857 · vektor</span
					>
				</div>
			</div>
			{#each LAYER_DEFS as l, i (l.key)}
				{@const on = layers[l.key]}
				<button
					type="button"
					onclick={() => (layers[l.key] = !on)}
					aria-pressed={on}
					aria-label={l.label()}
					title={l.label()}
					class="mm box-border flex h-[52px] flex-none items-center gap-2.5 overflow-hidden pr-3 pl-2 text-left text-[15px] font-extrabold text-foreground {rightOpen
						? `${leaf(i)} ${on ? 'bg-white/85 shadow-[0_4px_10px_rgba(30,32,38,.08),inset_0_0_0_1.5px_var(--primary)] dark:bg-white/10' : 'bg-white/35 shadow-[inset_0_0_0_1px_rgba(255,255,255,.7)] dark:bg-white/5'}`
						: `${on ? leafSm(i + 1) : leafSm(i)} bg-transparent`}"
					style="width: {rightOpen ? 238 : 52}px; transition-delay: {rightOpen
						? i * 0.04
						: (3 - i) * 0.03}s"
				>
					<span
						class="mm flex size-9 flex-none items-center justify-center {on
							? `${leafSm(i + 1)} bg-primary text-primary-foreground`
							: `${leafSm(i)} bg-well text-muted-foreground`}"
					>
						<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
							<path
								d={l.icon}
								fill="none"
								stroke="currentColor"
								stroke-width="1.9"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</span>
					<span
						aria-hidden="true"
						class="mtx flex w-[166px] flex-none items-center gap-2.5"
						style="opacity: {rightOpen ? 1 : 0}; filter: blur({rightOpen
							? 0
							: 6}px); transition-delay: {rightOpen ? 0.3 + i * 0.05 : 0}s"
					>
						<span class="flex-1 whitespace-nowrap">{l.label()}</span>
						<span
							class="relative h-5 w-[34px] flex-none rounded-[10px_5px_10px_5px] transition-colors duration-200 {on
								? 'bg-primary'
								: 'bg-line-strong'}"
						>
							<span
								class="ms absolute top-[3px] size-3.5 rounded-[6px_3px_6px_3px] bg-white"
								style="left: {on ? 17 : 3}px"
							></span>
						</span>
					</span>
				</button>
			{/each}
			<dl
				class="mph mt-auto mb-0 grid grid-cols-3 gap-1.5 self-stretch font-mono"
				style={rightOpen
					? 'opacity:1;transform:none;filter:blur(0);transition-delay:.42s'
					: 'opacity:0;transform:translateY(16px) scale(.94);filter:blur(8px)'}
			>
				{#each [['PITCH', '53°'], ['BEARING', `${bearing}°`], ['ZOOM', String(zoom)]] as [k, v], i (k)}
					<div class="bg-white/70 px-2.5 py-2 dark:bg-white/10 {leafSm(i)}">
						<dt class="text-[10px] text-muted-foreground">{k}</dt>
						<dd class="m-0 mt-0.5 font-sans text-[15px] font-black">{v}</dd>
					</div>
				{/each}
			</dl>
		</div>
	</section>

	<!-- Bottom strip under the layer panel: socials -->
	<div
		class="intro-hide mm absolute bottom-4 flex h-[86px] items-center justify-center gap-1 overflow-hidden [--in:810ms]"
		style="right: {L.rightFootRight}px; width: {L.rightFootW}px"
	>
		<a
			href="https://github.com/mikeu-dev"
			aria-label="GitHub"
			target="_blank"
			rel="noopener noreferrer"
			class="flex size-10 items-center justify-center rounded-leaf-sm bg-white/70 text-foreground dark:bg-white/10"
		>
			<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
				<path
					d="M7 15l-4-5 4-5M13 5l4 5-4 5"
					fill="none"
					stroke="currentColor"
					stroke-width="1.9"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</a>
		<a
			href="https://www.linkedin.com/in/rikiruswandi/"
			aria-label="LinkedIn"
			target="_blank"
			rel="noopener noreferrer"
			class="flex size-10 items-center justify-center rounded-leaf-sm-r bg-white/70 text-sm font-black text-foreground no-underline dark:bg-white/10"
			>in</a
		>
	</div>

	<!-- Map controls -->
	<div
		role="toolbar"
		aria-orientation="vertical"
		aria-label={m.gis_map_controls()}
		class="intro-hide mm glass absolute top-[118px] flex flex-col rounded-[26px_14px_26px_14px] p-[5px] [--in:890ms]"
		style="right: {L.railRight}px"
	>
		<button
			type="button"
			aria-label={m.gis_hero_zoom_in()}
			disabled={zoom >= 18}
			onclick={() => (zoom = Math.min(18, zoom + 1))}
			class="flex size-11 items-center justify-center rounded-leaf-sm text-foreground hover:bg-white/60 disabled:opacity-40"
		>
			<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
				<path d="M9 3v12M3 9h12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
			</svg>
		</button>
		<button
			type="button"
			aria-label={m.gis_hero_zoom_out()}
			disabled={zoom <= 16}
			onclick={() => (zoom = Math.max(16, zoom - 1))}
			class="flex size-11 items-center justify-center rounded-leaf-sm-r text-foreground hover:bg-white/60 disabled:opacity-40"
		>
			<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
				<path d="M3 9h12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
			</svg>
		</button>
		<button
			type="button"
			aria-label={m.gis_hero_north()}
			onclick={() => (bearing = 0)}
			class="flex size-11 items-center justify-center rounded-leaf-sm bg-white/70 dark:bg-white/10"
		>
			<svg
				class={bearing ? 'map-wob' : ''}
				width="24"
				height="24"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path d="M12 2l4 10h-8z" fill="#D9733A" />
				<path d="M12 22l-4-10h8z" fill="#9C9890" />
			</svg>
		</button>
	</div>

	<!-- Bottom-right: quick contact (pill that unfolds into a small card) -->
	<div
		class="intro-hide mm glass absolute bottom-4 overflow-hidden [--in:950ms]"
		style="right: {L.askRight}px; width: {askOpen ? 360 : 180}px; height: {askOpen
			? 284
			: 76}px; border-radius: {askOpen ? '30px 14px 30px 30px' : '22px 22px 22px 30px'}"
	>
		<button
			type="button"
			onclick={() => (askOpen = true)}
			aria-expanded={askOpen}
			aria-controls="hero-ask"
			class="mph absolute inset-0 flex items-center justify-center gap-2.5 text-[15px] font-black text-foreground"
			style="opacity: {askOpen ? 0 : 1}; pointer-events: {askOpen
				? 'none'
				: 'auto'}; filter: blur({askOpen ? 6 : 0}px); transform: scale({askOpen
				? 0.9
				: 1}); transition-delay: {askOpen ? 0 : 0.3}s"
			tabindex={askOpen ? -1 : 0}
		>
			<span
				class="flex size-[34px] items-center justify-center rounded-leaf-sm-r bg-route text-white"
			>
				<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
					<path
						d="M3 5h14v10H3zM3 5l7 6 7-6"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</span>
			{m.hero_button_text()}
		</button>
		<div
			id="hero-ask"
			role="dialog"
			aria-label={m.gis_quick_contact()}
			inert={!askOpen}
			class="mph absolute bottom-0 left-0 box-border flex h-[284px] w-[360px] flex-col gap-2.5 px-3.5 pb-3.5"
			style="opacity: {askOpen ? 1 : 0}; transform: translateY({askOpen
				? 0
				: 20}px); filter: blur({askOpen ? 0 : 8}px); pointer-events: {askOpen
				? 'auto'
				: 'none'}; transition-delay: {askOpen ? 0.22 : 0}s"
		>
			<div class="flex h-[58px] items-center justify-between pl-1.5">
				<span class="flex items-center gap-2 text-[17px] font-black">
					<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
						<path
							d="M3 5h14v10H3zM3 5l7 6 7-6"
							fill="none"
							stroke="var(--route)"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					{m.gis_ask_title()}
				</span>
				<button
					type="button"
					onclick={() => (askOpen = false)}
					aria-label={m.gis_close_contact()}
					class="flex size-10 items-center justify-center rounded-leaf-sm-r bg-well text-foreground"
				>
					<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
						<path
							d="M4 4l8 8M12 4l-8 8"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
						/>
					</svg>
				</button>
			</div>
			<p class="m-0 px-1.5 text-sm leading-normal text-ink-soft">{m.gis_contact_lead()}</p>
			<a href="mailto:{email}" class="btn-pill-solid min-h-[50px] text-[15px]">{email}</a>
			<div class="mt-auto grid grid-cols-2 gap-1.5">
				{#each SOCIAL as s, i (s.href)}
					<a
						href={s.href}
						target="_blank"
						rel="noopener noreferrer"
						class="flex min-h-11 items-center bg-white/60 px-3.5 text-sm font-extrabold text-foreground no-underline hover:bg-white/90 dark:bg-white/10 {leafSm(
							i + (i > 0 ? 1 : 0)
						)}">{s.label}</a
					>
				{/each}
				<a
					href={localizeHref('/contact')}
					class="flex min-h-11 items-center rounded-leaf-sm bg-white/60 px-3.5 text-sm font-extrabold text-foreground no-underline hover:bg-white/90 dark:bg-white/10"
					>{m.contact_page_button()}</a
				>
			</div>
		</div>
	</div>
</section>

<!-- ================= Phone / tablet: map, then a profile card ================= -->
<section aria-label={m.gis_hero_label()} class="relative pt-[88px] lg:hidden">
	<div class="relative h-[440px] overflow-hidden">
		<HeroMap {layers} fit="object-[72%_50%]" />
		<div class="absolute top-3 right-3 left-3 flex justify-between gap-2">
			<div class="glass flex gap-1 rounded-leaf p-1">
				{#each LAYER_DEFS.slice(0, 2) as l, i (l.key)}
					{@const on = layers[l.key]}
					<button
						type="button"
						onclick={() => (layers[l.key] = !on)}
						aria-pressed={on}
						class="flex min-h-10 items-center gap-1.5 px-3 text-[13px] font-extrabold {leafSm(
							i
						)} {on ? 'bg-primary text-primary-foreground' : 'text-foreground'}"
					>
						{l.label()}
					</button>
				{/each}
			</div>
		</div>
	</div>
	<div class="shard relative mx-3 -mt-16 flex flex-col sm:mx-4">
		<p class="tab tab-r eyebrow flex h-11 items-center self-start px-5 text-xs">
			Purwakarta · 6.5569° S, 107.4431° E
		</p>
		<div class="flex flex-col gap-3.5 rounded-[0_30px_30px_30px] bg-card p-6">
			<p class="m-0 text-base font-extrabold text-muted-foreground">{m.gis_hero_hello()}</p>
			<h1 class="m-0 text-[clamp(32px,8.5vw,48px)] leading-[1.04] font-black tracking-[-0.03em]">
				{m.gis_hero_title_a()} <span class="text-primary">{m.gis_hero_title_em()}</span>
				{m.gis_hero_title_b()}
			</h1>
			<p class="m-0 text-base leading-relaxed text-ink-soft">{m.gis_hero_lead()}</p>
			<div class="flex flex-wrap gap-2.5">
				<a href="#work" class="btn-pill-solid min-h-[52px]">{m.hero_button_link()}</a>
				<a href={localizeHref('/contact')} class="btn-pill-line min-h-[52px]"
					>{m.hero_button_text()}</a
				>
			</div>
		</div>
	</div>
</section>

<style>
	.hero-glass {
		background: var(--glass);
		-webkit-backdrop-filter: blur(16px) saturate(1.05);
		backdrop-filter: blur(16px) saturate(1.05);
	}
	/* Panel morph timings, from the design */
	.mm {
		transition-property:
			left, right, top, bottom, width, height, max-width, border-radius, transform, opacity,
			background-color, color, box-shadow, padding;
		transition-duration: 0.7s;
		transition-timing-function: cubic-bezier(0.65, 0, 0.25, 1);
	}
	.ms {
		transition-property: left, transform, background-color;
		transition-duration: 0.62s;
		transition-timing-function: cubic-bezier(0.34, 1.3, 0.5, 1);
	}
	.morph {
		d: var(--shape);
		transition: d 0.7s cubic-bezier(0.65, 0, 0.25, 1);
	}
	.clip {
		clip-path: var(--shape);
		transition: clip-path 0.7s cubic-bezier(0.65, 0, 0.25, 1);
	}
	/* Intro: the shards start as loading pills, then morph into place */
	:global(html.intro) .morph {
		d: var(--pill);
	}
	:global(html.intro) .clip {
		clip-path: var(--pill);
	}
	:global(html.intro-done) .morph,
	:global(html.intro-done) .clip {
		transition-duration: 0.9s;
		transition-delay: calc(var(--i) * 70ms);
	}
	.mph {
		transition:
			opacity 0.34s cubic-bezier(0.4, 0, 0.2, 1),
			transform 0.55s cubic-bezier(0.2, 0.8, 0.2, 1),
			filter 0.45s cubic-bezier(0.4, 0, 0.2, 1);
	}
	.mtx {
		transition:
			opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			max-width 0.7s cubic-bezier(0.65, 0, 0.25, 1),
			margin 0.7s cubic-bezier(0.65, 0, 0.25, 1),
			filter 0.4s ease;
	}
	@media (prefers-reduced-motion: reduce) {
		.mm,
		.ms,
		.morph,
		.clip,
		.mph,
		.mtx {
			transition-duration: 0.01s !important;
		}
	}
</style>
