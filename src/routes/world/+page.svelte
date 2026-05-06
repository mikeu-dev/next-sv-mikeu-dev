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

<div class="world-page">
	{#await import('$lib/components/guest/sections/world/folded-world.svelte')}
		<!-- Loading fallback while Three.js component loads -->
		<div class="world-loading-fallback">
			<div class="fallback-shape"></div>
			<p class="fallback-text">LOADING FOLDED_WORLD</p>
			<p class="fallback-sub">Preparing 3D visualization engine...</p>
		</div>
	{:then module}
		<module.default
			nodes={data.geoNodes}
			totalVisitors={data.stats.total}
			todayVisitors={data.stats.today}
		/>
	{:catch}
		<!-- Fallback for devices that can't load Three.js -->
		<div class="world-fallback">
			<div class="fallback-content">
				<h1 class="fallback-title">FOLDED<br />WORLD</h1>
				<div class="fallback-divider"></div>
				<p class="fallback-stats">
					{data.stats.total} total visitors from {data.geoNodes.length} locations
				</p>
				<div class="fallback-grid">
					{#each data.geoNodes.slice(0, 12) as node (node.id)}
						<div class="fallback-node">
							<span class="fallback-node-location">
								{node.city ? `${node.city}, ` : ''}{node.country}
							</span>
							<span class="fallback-node-count">{node.count}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/await}
</div>

<style>
	.world-page {
		position: fixed;
		inset: 0;
		z-index: 40;
		background: #0a0a0a;
		font-family: 'JetBrains Mono', 'Courier New', monospace;
	}

	/* --- Loading Fallback --- */

	.world-loading-fallback {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100dvh;
		background: #0a0a0a;
	}

	.fallback-shape {
		width: 100px;
		height: 100px;
		border: 2px solid #e0e0e0;
		clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
		animation: shape-pulse 2s ease-in-out infinite;
	}

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

	.fallback-text {
		margin-top: 32px;
		font-size: 12px;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: #fafafa;
	}

	.fallback-sub {
		margin-top: 8px;
		font-size: 10px;
		color: #555;
	}

	/* --- Static Fallback --- */

	.world-fallback {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100dvh;
		background: #0a0a0a;
		padding: 24px;
	}

	.fallback-content {
		max-width: 600px;
		width: 100%;
	}

	.fallback-title {
		font-size: 48px;
		font-weight: 900;
		letter-spacing: 0.2em;
		line-height: 1;
		color: #fafafa;
		margin: 0;
	}

	.fallback-divider {
		width: 80px;
		height: 3px;
		background: #ff3333;
		margin: 24px 0;
	}

	.fallback-stats {
		font-size: 12px;
		color: #888;
		letter-spacing: 0.1em;
		margin-bottom: 32px;
	}

	.fallback-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 8px;
	}

	.fallback-node {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 12px;
		border: 1px solid #222;
		background: #111;
	}

	.fallback-node-location {
		font-size: 10px;
		color: #aaa;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.fallback-node-count {
		font-size: 14px;
		font-weight: 700;
		color: #e0e0e0;
	}
</style>
