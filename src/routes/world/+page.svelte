<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Folded World — Interactive Visitor Map | mikeu.dev</title>
	<meta
		name="description"
		content="An interactive 3D visualization of global visitors. Each visitor leaves a digital imprint on the folded world mesh."
	/>
	<meta property="og:title" content="Folded World — Interactive Visitor Map" />
	<meta
		property="og:description"
		content="Explore the digital footprints of global visitors through a brutalist 3D mesh visualization."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="fixed inset-0 z-40 bg-[#0a0a0a] font-mono">
	{#await import('$lib/components/guest/sections/world/folded-world.svelte')}
		<!-- Loading fallback while Three.js component loads -->
		<div class="flex h-dvh flex-col items-center justify-center bg-[#0a0a0a]">
			<div
				class="animate-shape-pulse size-[100px] border-2 border-[#e0e0e0]"
				style="clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);"
			></div>
			<p class="mt-8 text-[12px] tracking-[0.3em] text-[#fafafa] uppercase">LOADING FOLDED_WORLD</p>
			<p class="mt-2 text-[10px] text-[#555]">Preparing 3D visualization engine...</p>
		</div>
	{:then module}
		<module.default
			nodes={data.geoNodes}
			totalVisitors={data.stats.total}
			todayVisitors={data.stats.today}
		/>
	{:catch}
		<!-- Fallback for devices that can't load Three.js -->
		<div class="flex h-dvh items-center justify-center bg-[#0a0a0a] p-6">
			<div class="w-full max-w-[600px]">
				<h1 class="text-[48px] leading-none font-black tracking-[0.2em] text-[#fafafa] uppercase">
					FOLDED<br />WORLD
				</h1>
				<div class="my-6 h-[3px] w-20 bg-[#ff3333]"></div>
				<p class="mb-8 text-[12px] tracking-[0.1em] text-[#888]">
					{data.stats.total} total visitors from {data.geoNodes.length} locations
				</p>
				<div class="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
					{#each data.geoNodes.slice(0, 12) as node (node.id)}
						<div class="flex items-center justify-between border border-[#222] bg-[#111] p-2 px-3">
							<span class="text-[10px] tracking-[0.05em] text-[#aaa] uppercase">
								{node.city ? `${node.city}, ` : ''}{node.country}
							</span>
							<span class="text-[14px] font-bold text-[#e0e0e0]">{node.count}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/await}
</div>

<style>
	@keyframes shape-pulse {
		0%,
		100% {
			transform: scale(1) rotate(0deg);
			opacity: 0.5;
		}
		50% {
			transform: scale(1.1) rotate(45deg);
			opacity: 1;
		}
	}

	.animate-shape-pulse {
		animation: shape-pulse 2s ease-in-out infinite;
	}
</style>
