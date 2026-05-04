<script lang="ts">
	import type { PageData } from './$types';
	import type { TechStackCategory, JourneyItem } from '$lib/types';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { getLocale } from '@/lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { getLocalizedTag } from '$lib/utils/project-mapper';
	import { Button } from '$lib/components/ui/button';
	import { Mail, Coffee, Gamepad2, Music, CheckCircle2, ArrowRight } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import SkillPlayground from '$lib/components/about/skill-playground.svelte';

	let { data }: { data: PageData } = $props();
	let initialLocale = $state(getLocale());

	let techstackRaw = $derived(
		(data?.techStack?.[initialLocale] || data?.techStack?.['en'] || []) as TechStackCategory[]
	);
	let techstack = $derived(
		techstackRaw.map((category) => ({
			...category,
			items: (category.items || []).map((item) => getLocalizedTag(item))
		}))
	);

	let myJourney = $derived(
		(data?.journey?.[initialLocale] || data?.journey?.['en'] || []) as JourneyItem[]
	);

	let container: HTMLElement;
	let timelineProgress: HTMLElement;
	let wavingHand: HTMLElement;

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		// Hero Animations
		const tl = gsap.timeline();
		tl.from('.hero-title-main', {
			x: -100,
			opacity: 0,
			duration: 1.2,
			ease: 'power4.out'
		})
		.from('.hero-portrait', {
			scale: 0.8,
			opacity: 0,
			duration: 1,
			ease: 'back.out(1.7)'
		}, '-=0.8')
		.from('.hero-cta', {
			y: 20,
			opacity: 0,
			duration: 0.8,
			stagger: 0.1
		}, '-=0.5');

		// Scribble animation
		gsap.from('.scribble-path', {
			strokeDashoffset: 1000,
			strokeDasharray: 1000,
			duration: 1.5,
			delay: 1,
			ease: 'power2.inOut'
		});

		// Journey Progress Line
		if (timelineProgress) {
			gsap.to(timelineProgress, {
				height: '100%',
				ease: 'none',
				scrollTrigger: {
					trigger: '.journey-container',
					start: 'top center',
					end: 'bottom center',
					scrub: true
				}
			});
		}

		// Waving hand
		if (wavingHand) {
			gsap.to(wavingHand, {
				rotation: 20,
				duration: 0.5,
				repeat: -1,
				yoyo: true,
				ease: 'power1.inOut'
			});
		}
	});

	async function copyEmail() {
		try {
			await navigator.clipboard.writeText('mikeu.dev@gmail.com');
			toast.success(m.blog_link_copied());
		} catch {
			toast.error('Failed to copy email');
		}
	}

	const funFacts = $derived([
		{ icon: Coffee, text: m.about_fun_facts_coffee(), color: 'text-orange-500', bg: 'bg-orange-500/10', sub: 'High Caffeine' },
		{ icon: Gamepad2, text: m.about_fun_facts_gaming(), color: 'text-red-500', bg: 'bg-red-500/10', sub: 'Immersive Mode' },
		{ icon: Music, text: m.about_fun_facts_music(), color: 'text-pink-500', bg: 'bg-pink-500/10', sub: 'Deep Beats' },
		{ icon: CheckCircle2, text: m.about_fun_facts_learning(), color: 'text-emerald-500', bg: 'bg-emerald-500/10', sub: 'Infinite Loop' }
	]);

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		// ... existing hero animations ...
		
		// Fun Facts Stagger Reveal (Disabled temporarily for debugging)
		/*
		gsap.from('.fact-card', {
			y: 40,
			opacity: 0,
			duration: 1,
			stagger: 0.15,
			ease: 'power4.out',
			scrollTrigger: {
				trigger: '.facts-grid',
				start: 'top 85%'
			}
		});
		*/
	});
</script>

<div bind:this={container} class="noise-bg relative mx-auto mt-20 max-w-7xl overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
	<!-- Noise Overlay -->
	<div class="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-overlay grayscale invert dark:invert-0" style="background-image: url('https://grainy-gradients.vercel.app/noise.svg');"></div>

	<!-- Asymmetric Hero Section -->
	<section class="relative min-h-[80vh] py-20">
		<div class="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
			<!-- Text Content -->
			<div class="z-10 space-y-10 lg:col-span-8 lg:pt-10">
				<div class="hero-title-main relative">
					<h1 class="font-poppins text-6xl font-black leading-[0.9] tracking-tighter md:text-9xl lg:-ml-10">
						{m.about_begin_first_part()} <span bind:this={wavingHand} class="inline-block">👋</span>,<br />
						I'm <span class="relative inline-block text-primary">
							Mikeu
							<svg class="absolute -bottom-4 left-0 w-full" height="20" viewBox="0 0 200 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path class="scribble-path" d="M5 15C50 5 150 5 195 15" stroke="currentColor" stroke-width="8" stroke-linecap="round" />
							</svg>
						</span><span class="text-primary">.</span>
					</h1>
				</div>

				<div class="hero-cta grid grid-cols-1 gap-8 md:grid-cols-2">
					<div class="prose prose-xl dark:prose-invert max-w-none font-medium leading-relaxed text-muted-foreground/80">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						<p>{@html m.about_desc_first_part()}</p>
					</div>
					<div class="flex flex-col justify-end space-y-6">
						<div class="flex flex-wrap gap-4">
							<Button size="lg" class="rounded-full px-10 py-8 text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/40">
								{m.about_hero_resume()}
								<ArrowRight class="ml-2 size-6" />
							</Button>
							<Button variant="ghost" size="lg" onclick={copyEmail} class="rounded-full px-8 py-8 font-bold">
								<Mail class="mr-2 size-5" />
								{m.about_hero_copy_email()}
							</Button>
						</div>
						<div class="flex items-center gap-4 rounded-3xl border bg-card/50 p-6 backdrop-blur-xl">
							<div class="flex size-12 items-center justify-center rounded-full bg-green-500/10 text-green-500">
								<CheckCircle2 class="size-6" />
							</div>
							<p class="text-sm font-bold uppercase tracking-wider opacity-60">Ready for new challenges</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Floating Portrait -->
			<div class="hero-portrait relative lg:col-span-4 lg:mt-20">
				<div class="absolute inset-0 rotate-6 rounded-[3rem] bg-primary/20 blur-2xl"></div>
				<div class="relative aspect-4/5 overflow-hidden rounded-[3.5rem] border-12 border-card bg-muted shadow-2xl transition-transform duration-500 hover:rotate-2">
					<img
						src="https://github.com/mikeu-dev.png"
						alt="Mikeu"
						class="h-full w-full object-cover grayscale transition-all duration-700 hover:grayscale-0"
					/>
				</div>
				<!-- Floating Tech Tags -->
				<div class="absolute -right-8 top-1/4 rounded-2xl bg-black px-4 py-2 text-xs font-black text-white shadow-xl dark:bg-white dark:text-black">
					SVELTE EXPERT
				</div>
				<div class="absolute -left-8 bottom-1/4 rounded-2xl bg-primary px-4 py-2 text-xs font-black text-white shadow-xl">
					GIS LOVER
				</div>
			</div>
		</div>
	</section>

	<!-- Interactive Skill Playground -->
	<section class="py-28">
		<div class="mb-16 flex flex-col items-end gap-4 text-right">
			<h2 class="font-poppins text-5xl font-black uppercase italic tracking-tighter md:text-8xl">
				The Skill <span class="text-primary">Playground</span>
			</h2>
			<p class="max-w-md text-lg font-medium text-muted-foreground">
				My tech stack is more than just items on a list. It's a set of tools that I use to solve real-world problems. Feel free to play around.
			</p>
		</div>
		<SkillPlayground categories={techstack} />
	</section>

	<!-- Journey Section -->
	<section class="py-28">
		<div class="relative mb-24">
			<h2 class="text-center font-poppins text-6xl font-black tracking-tighter md:text-9xl opacity-[0.03] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 uppercase italic">
				Experience
			</h2>
			<h2 class="relative text-center font-poppins text-4xl font-black tracking-tight md:text-6xl">
				{m.about_jurney_title()}<span class="text-primary">.</span>
			</h2>
		</div>

		<div class="journey-container relative mx-auto max-w-4xl px-4">
			<div class="absolute top-0 left-8 h-full w-1 bg-muted md:left-1/2 md:-translate-x-1/2">
				<div bind:this={timelineProgress} class="w-full bg-primary" style="height: 0%"></div>
			</div>

			<div class="space-y-24">
				{#each myJourney as item, i (i)}
					<div class="journey-item relative flex flex-col md:flex-row md:items-center">
						<div class={`relative w-full pl-16 md:w-1/2 md:pl-0 ${i % 2 === 0 ? 'md:pr-20 md:text-right' : 'md:order-2 md:pl-20'}`}>
							<div class="space-y-2">
								<span class="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-black text-primary uppercase tracking-widest">
									{item.year}
								</span>
								<h3 class="font-poppins text-3xl font-black italic">{item.title}</h3>
								<p class="text-lg text-muted-foreground">{item.description}</p>
							</div>
						</div>
						<div class="absolute left-8 top-0 size-4 -translate-x-1/2 rounded-full border-4 border-primary bg-background shadow-[0_0_0_8px_rgba(var(--primary),0.1)] md:left-1/2"></div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Fun Facts Section (Redesigned) -->
	<section class="py-32">
		<div class="relative overflow-hidden rounded-[3rem] border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 p-8 md:p-20 backdrop-blur-xl">
			<!-- Decorative Gradients -->
			<div class="absolute -right-24 -top-24 size-96 rounded-full bg-primary/10 blur-3xl"></div>
			<div class="absolute -left-24 -bottom-24 size-96 rounded-full bg-blue-500/5 blur-3xl"></div>
			
			<div class="grid grid-cols-1 gap-20 lg:grid-cols-12">
				<div class="space-y-8 lg:col-span-5">
					<div class="flex items-center gap-3">
						<div class="h-1 w-6 bg-primary rounded-full"></div>
						<span class="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{m.about_fun_facts_label()}</span>
					</div>
					<h2 class="font-poppins text-5xl font-black tracking-tight text-zinc-900 dark:text-white md:text-7xl">
						{m.about_fun_facts_title()}<span class="text-primary">.</span>
					</h2>
					<p class="text-xl font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
						{m.about_fun_facts_desc_long()}
					</p>
					
					<div class="flex flex-col gap-4 pt-6">
						<div class="flex items-center gap-4">
							<div class="flex size-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
								<CheckCircle2 class="size-5 text-primary" />
							</div>
							<span class="text-sm font-bold text-zinc-700 dark:text-zinc-300">{m.about_fun_facts_growth()}</span>
						</div>
						<div class="flex items-center gap-4">
							<div class="flex size-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
								<CheckCircle2 class="size-5 text-primary" />
							</div>
							<span class="text-sm font-bold text-zinc-700 dark:text-zinc-300">{m.about_fun_facts_detail()}</span>
						</div>
					</div>
				</div>

				<div class="lg:col-span-7">
					<div class="facts-grid grid grid-cols-1 gap-4 sm:grid-cols-2">
						{#each funFacts as fact (fact.sub)}
							<div class="fact-card group relative overflow-hidden rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5">
								<!-- Card Inner Glow -->
								<div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
									style="background: radial-gradient(circle at top right, {fact.color.replace('text-', '').replace('-500', '')}11, transparent 70%);"></div>
								
								<div class="relative z-10 space-y-6">
									<div class="flex items-center justify-between">
										<div class={`flex size-14 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110 ${fact.bg}`}>
											<fact.icon class={`size-7 ${fact.color}`} />
										</div>
										<span class="text-[9px] font-black uppercase tracking-widest text-zinc-400 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
											{fact.sub}
										</span>
									</div>
									
									<div class="space-y-2">
										<p class="text-[9px] font-black uppercase tracking-widest text-zinc-400">{m.about_fun_facts_node_status()}</p>
										<p class="text-lg font-black leading-tight tracking-tighter text-zinc-800 dark:text-zinc-100 uppercase">
											{fact.text}
										</p>
									</div>
								</div>

								<!-- Bottom Accent Line -->
								<div class="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full"
									style="background-color: currentColor; color: inherit;"></div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	:global(.prose strong) {
		font-weight: 900;
		color: var(--foreground);
	}
	:global(.prose em) {
		font-weight: 700;
		color: var(--primary);
		font-style: normal;
	}

	.scribble-path {
		stroke-dasharray: 1000;
		stroke-dashoffset: 1000;
	}

	.noise-bg {
		position: relative;
	}
</style>
