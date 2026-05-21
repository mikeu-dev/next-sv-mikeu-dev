<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { gsap } from 'gsap';

	let backgroundSection = $state<HTMLElement>();
	let ctx: gsap.Context;

	onMount(() => {
		if (!browser || !backgroundSection) return;

		ctx = gsap.context(() => {
			// Ambient Floating Shards (Drift)
			gsap.to('.ambient-shard', {
				y: 'random(-40, 40)',
				x: 'random(-40, 40)',
				rotation: 'random(-180, 180)',
				duration: 'random(10, 20)',
				repeat: -1,
				yoyo: true,
				ease: 'none'
			});

			// 3D Parallax effect for the shards based on mouse movement
			const handleMouseMove = (e: MouseEvent) => {
				const x = (e.clientX / window.innerWidth - 0.5) * 20;
				const y = (e.clientY / window.innerHeight - 0.5) * 20;

				gsap.to('.parallax-layer', {
					x: x,
					y: y,
					rotateY: x * 0.5,
					rotateX: -y * 0.5,
					duration: 1.5,
					ease: 'power2.out'
				});
			};
			window.addEventListener('mousemove', handleMouseMove);

			return () => {
				window.removeEventListener('mousemove', handleMouseMove);
			};
		});
	});

	onDestroy(() => {
		if (ctx) ctx.revert();
	});
</script>

<div
	bind:this={backgroundSection}
	class="pointer-events-none absolute inset-0 overflow-hidden"
	aria-hidden="true"
>
	<!-- Blueprint Grid -->
	<div class="blueprint-grid absolute inset-0"></div>

	<!-- Interactive Spotlight Overlay -->
	<div class="mouse-spotlight absolute inset-0"></div>

	<!-- Scanning Beam -->
	<div class="scanning-beam absolute left-0 w-full opacity-20"></div>

	<!-- Ambient Shards (Floating) - Reduced for mobile -->
	<div class="parallax-layer transform-style-3d absolute inset-0">
		{#each Array(browser && window.innerWidth < 768 ? 3 : 6) as _, _i (_i)}
			<div
				class="ambient-shard absolute size-16 bg-primary/5 dark:bg-primary/10"
				style="
                    top: {Math.random() * 100}%; 
                    left: {Math.random() * 100}%; 
                    clip-path: polygon({Math.random() * 100}% 0%, 100% {Math.random() *
					100}%, {Math.random() * 100}% 100%, 0% {Math.random() * 100}%);
                    filter: blur({2 + Math.random() * 4}px);
                "
			></div>
		{/each}

		<div
			class="origami-shard absolute -top-24 -left-24 size-[500px] bg-primary/5 dark:bg-primary/10"
			style="clip-path: polygon(0 0, 100% 0, 80% 100%, 0 80%);"
		></div>
		<div
			class="origami-shard absolute -right-48 -bottom-48 size-[600px] bg-foreground/5"
			style="clip-path: polygon(20% 0, 100% 20%, 100% 100%, 0 100%);"
		></div>
	</div>
</div>

<!-- Technical HUD Corners -->
<div class="pointer-events-none absolute inset-0 z-20 overflow-hidden p-8">
	<div class="absolute top-8 left-8 size-16 border-t-2 border-l-2 border-primary/20"></div>
	<div class="absolute top-8 right-8 size-16 border-t-2 border-r-2 border-primary/20"></div>
	<div class="absolute bottom-8 left-8 size-16 border-b-2 border-l-2 border-primary/20"></div>
	<div class="absolute right-8 bottom-8 size-16 border-r-2 border-b-2 border-primary/20"></div>

	<!-- Coordinates Display -->
	<div
		class="coord-display absolute right-12 bottom-12 font-mono text-[8px] font-black tracking-widest text-primary/40"
	>
		REL_COORDS: [X_<span class="x-val"></span> : Y_<span class="y-val"></span>]
	</div>
</div>

<style lang="postcss">
	.transform-style-3d {
		transform-style: preserve-3d;
	}

	/* â”€â”€ Background Aesthetics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
	.blueprint-grid {
		background-image: radial-gradient(var(--foreground) 0.5px, transparent 0.5px);
		background-size: 40px 40px;
		opacity: 0.08;
		mask-image: radial-gradient(
			circle 500px at var(--mouse-x) var(--mouse-y),
			black 0%,
			transparent 100%
		);
	}

	.mouse-spotlight {
		background: radial-gradient(
			circle 600px at var(--mouse-x) var(--mouse-y),
			rgba(var(--primary-rgb), 0.12),
			transparent 70%
		);
		mix-blend-mode: plus-lighter;
	}

	.scanning-beam {
		height: 1px;
		background: linear-gradient(
			to right,
			transparent,
			var(--primary) 20%,
			var(--primary) 80%,
			transparent
		);
		box-shadow: 0 0 15px var(--primary);
		animation: scan 8s linear infinite;
	}

	@keyframes scan {
		0% {
			top: -10%;
		}
		100% {
			top: 110%;
		}
	}

	.ambient-shard,
	.origami-shard {
		pointer-events: none;
		will-change: transform, opacity;
	}

	/* â”€â”€ Coordinate HUD with CSS Counters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
	.coord-display {
		counter-reset: x var(--coord-x) y var(--coord-y);
	}

	.x-val::after {
		content: counter(x);
	}

	.y-val::after {
		content: counter(y);
	}
</style>
