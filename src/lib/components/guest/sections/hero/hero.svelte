<script lang="ts">
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { Terminal, Hash, Cpu, Activity, ArrowRight } from '@lucide/svelte';
	import HeroBackground from './hero-background.svelte';
	import HeroPhysicsText from './hero-physics-text.svelte';

	const titleChars = ['M', 'I', 'K', 'E', 'U', ' ', 'D', 'E', 'V'];
	const skills = ['FRONTEND_ARCHITECT', 'SVELTEKIT_EXPERT', 'UI/UX_ENGINEER'];

	let heroSection = $state<HTMLElement>();

	onMount(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!heroSection) return;
			const rect = heroSection.getBoundingClientRect();
			const x = ((e.clientX - rect.left) / rect.width) * 100;
			const y = ((e.clientY - rect.top) / rect.height) * 100;
			heroSection.style.setProperty('--mouse-x', `${x}%`);
			heroSection.style.setProperty('--mouse-y', `${y}%`);
			heroSection.style.setProperty('--coord-x', Math.floor(x).toString());
			heroSection.style.setProperty('--coord-y', Math.floor(y).toString());
		};

		window.addEventListener('mousemove', handleMouseMove);
		return () => window.removeEventListener('mousemove', handleMouseMove);
	});
</script>

<section
	id="hero"
	bind:this={heroSection}
	class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background pt-20 pb-10 text-center md:pt-24"
	style="--mouse-x: 50%; --mouse-y: 50%; --coord-x: 50; --coord-y: 50;"
>
	<!-- Grain Texture Overlay -->
	<div
		class="pointer-events-none absolute inset-0 z-50 opacity-[0.04] mix-blend-overlay contrast-150 grayscale"
		style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
	></div>

	<!-- Render Background HUD and Shards -->
	<HeroBackground />

	<div class="relative z-10 container mx-auto px-6">
		<!-- Technical Metadata Header -->
		<div
			class="hero-stagger mb-6 flex flex-wrap items-center justify-center gap-6 border-b-2 border-foreground/10 pb-6"
		>
			<div
				class="flex items-center gap-2 font-mono text-[10px] font-black tracking-[0.2em] text-primary uppercase"
			>
				<Terminal class="size-3" /> CORE_IDENTIFIER: MIKEU_DEV_V5
			</div>
			<div
				class="hidden items-center gap-2 font-mono text-[10px] font-black tracking-[0.2em] text-foreground/40 uppercase md:flex"
			>
				<Hash class="size-3" /> ORIGIN_ID: RIKI_RUSWANDI
			</div>
			<div
				class="flex items-center gap-2 font-mono text-[10px] font-black tracking-[0.2em] text-foreground/40 uppercase"
			>
				<Cpu class="size-3" /> ARCH_TYPE: FULLSTACK_ARCHIVE
			</div>
			<div
				class="flex items-center gap-2 font-mono text-[10px] font-black tracking-[0.2em] text-primary uppercase"
			>
				<Activity class="size-3 animate-pulse" /> SYSTEM_STATUS: STABLE
			</div>
		</div>

		<!-- Matter.js Interactive Title -->
		<HeroPhysicsText {titleChars} />

		<!-- Subtitle & Content -->
		<div class="hero-stagger mt-8">
			<p
				class="mx-auto max-w-2xl font-mono text-xs leading-relaxed tracking-widest text-muted-foreground uppercase sm:text-sm md:text-base"
			>
				// {m.hero_subtitle()} //
			</p>

			<!-- Industrial Skills List -->
			<div class="mt-6 flex flex-wrap justify-center gap-3">
				{#each skills as skill (skill)}
					<div
						class="group flex items-center gap-2 border-2 border-foreground/10 bg-foreground/2 px-4 py-2 transition-all hover:border-primary hover:bg-primary/5"
					>
						<Hash class="size-3 text-primary transition-transform group-hover:rotate-12" />
						<span class="font-mono text-[10px] font-black tracking-wider text-foreground uppercase">
							{skill}
						</span>
					</div>
				{/each}
			</div>

			<!-- Sharp Buttons -->
			<div class="mt-10 flex flex-wrap justify-center gap-6">
				<a
					href="#contact"
					onclick={(e) => {
						e.preventDefault();
						document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
					}}
					class="group relative inline-flex h-16 items-center justify-center bg-primary px-10 text-primary-foreground transition-all duration-300 hover:-translate-x-2 hover:-translate-y-2 hover:shadow-[10px_10px_0_var(--foreground)]"
					style="clip-path: polygon(0 15%, 100% 0, 95% 100%, 5% 85%);"
				>
					<div
						class="absolute inset-0 translate-x-[-110%] bg-foreground transition-transform duration-500 ease-out group-hover:translate-x-0"
						style="clip-path: polygon(0 0, 100% 0, 70% 100%, 0% 100%);"
					></div>
					<div
						class="relative z-10 flex items-center gap-3 transition-colors group-hover:text-background"
					>
						<span class="font-poppins text-lg font-black tracking-tighter uppercase">
							{m.hero_button_text()}
						</span>
						<ArrowRight class="size-5 transition-transform group-hover:translate-x-1" />
					</div>
				</a>

				<a
					href="#work"
					onclick={(e) => {
						e.preventDefault();
						document.querySelector('#work')?.scrollIntoView({ behavior: 'smooth' });
					}}
					class="group relative inline-flex h-16 items-center justify-center border-2 border-foreground bg-background px-10 text-foreground transition-all duration-300 hover:-translate-x-2 hover:-translate-y-2 hover:shadow-[10px_10px_0_var(--primary)]"
					style="clip-path: polygon(5% 0, 95% 15%, 100% 85%, 0 100%);"
				>
					<div
						class="absolute inset-0 translate-y-[110%] bg-foreground transition-transform duration-500 ease-out group-hover:translate-y-0"
						style="clip-path: polygon(0 20%, 100% 0, 100% 100%, 20% 100%);"
					></div>
					<span
						class="relative z-10 font-poppins text-lg font-black tracking-tighter uppercase transition-colors group-hover:text-background"
					>
						{m.hero_button_link()}
					</span>
				</a>
			</div>
		</div>

		<!-- Technical Footer ID -->
		<div
			class="hero-stagger mt-12 flex items-center justify-center gap-8 font-mono text-[8px] font-black tracking-[0.4em] text-foreground/20 uppercase"
		>
			<p>UID: 0x7F4B21_MIKEU</p>
			<p>SECTOR: ALPHA_PRIMARY</p>
			<p>LOAD_TIME: 242ms</p>
		</div>
	</div>
</section>

<style lang="postcss">
	@reference "tailwindcss";

	#hero {
		perspective: 1500px;
	}

	.hero-stagger {
		transform: translateZ(50px);
	}
</style>
