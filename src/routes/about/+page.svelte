<script lang="ts">
	import type { PageData } from './$types';
	import type { TechStackCategory, JourneyItem } from '$lib/types';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { getLocale } from '@/lib/paraglide/runtime';
	import Icon from '@/lib/components/ui/icon.svelte';
	import { m } from '$lib/paraglide/messages';
	import { getLocalizedTag } from '$lib/utils/project-mapper';
	import { Button } from '$lib/components/ui/button';
	import { Download, Mail, Coffee, Gamepad2, Music, CheckCircle2, ChevronRight } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

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

		// Hero Stagger
		gsap.from('.hero-anim', {
			y: 40,
			opacity: 0,
			duration: 1,
			stagger: 0.1,
			ease: 'power4.out'
		});

		// Philosophy Stagger
		gsap.from('.philosophy-card', {
			y: 30,
			opacity: 0,
			duration: 0.8,
			stagger: 0.2,
			ease: 'power2.out',
			scrollTrigger: {
				trigger: '.philosophy-section',
				start: 'top 80%'
			}
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

		// Journey Items Stagger
		gsap.from('.journey-item', {
			opacity: 0,
			y: 30,
			duration: 0.8,
			stagger: 0.2,
			scrollTrigger: {
				trigger: '.journey-container',
				start: 'top 70%'
			}
		});

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
			await navigator.clipboard.writeText('mikeu.dev@gmail.com'); // Placeholder email
			toast.success(m.blog_link_copied());
		} catch {
			toast.error('Failed to copy email');
		}
	}

	const philosophies = $derived([
		{
			title: m.about_philosophy_efficiency_title(),
			desc: m.about_philosophy_efficiency_desc(),
			icon: 'Zap',
			color: 'text-yellow-500'
		},
		{
			title: m.about_philosophy_scalability_title(),
			desc: m.about_philosophy_scalability_desc(),
			icon: 'Maximize',
			color: 'text-blue-500'
		},
		{
			title: m.about_philosophy_aesthetics_title(),
			desc: m.about_philosophy_aesthetics_desc(),
			icon: 'Palette',
			color: 'text-purple-500'
		}
	]);

	const funFacts = $derived([
		{ icon: Coffee, text: m.about_fun_facts_coffee(), color: 'text-orange-500' },
		{ icon: Gamepad2, text: m.about_fun_facts_gaming(), color: 'text-red-500' },
		{ icon: Music, text: m.about_fun_facts_music(), color: 'text-pink-500' }
	]);
</script>

<div bind:this={container} class="mx-auto mt-20 max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
	<!-- Hero Section -->
	<section class="grid grid-cols-1 items-center gap-16 py-20 lg:grid-cols-2">
		<div class="space-y-8">
			<div class="hero-anim space-y-4">
				<div class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
					<span class="relative flex h-2 w-2">
						<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
						<span class="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
					</span>
					{m.about_hero_title()}
				</div>
				<h1 class="font-poppins text-5xl font-black leading-tight tracking-tight md:text-7xl">
					{m.about_begin_first_part()} <span bind:this={wavingHand} class="inline-block">👋</span>,<br />
					{m.about_begin_second_part({ name: 'Mikeu' })}<span class="text-primary">.</span>
				</h1>
			</div>
			
			<div class="hero-anim prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<p>{@html m.about_desc_first_part()}</p>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				<p>{@html m.about_desc_second_part()}</p>
			</div>

			<div class="hero-anim flex flex-wrap gap-4 pt-4">
				<Button size="lg" class="rounded-2xl px-8 font-bold shadow-xl shadow-primary/20">
					<Download class="mr-2 size-5" />
					{m.about_hero_resume()}
				</Button>
				<Button variant="outline" size="lg" onclick={copyEmail} class="rounded-2xl px-8 font-bold">
					<Mail class="mr-2 size-5" />
					{m.about_hero_copy_email()}
				</Button>
			</div>
		</div>

		<div class="hero-anim relative hidden lg:block">
			<div class="absolute -top-12 -left-12 h-64 w-64 rounded-full bg-primary/20 blur-3xl"></div>
			<div class="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
			<div class="relative overflow-hidden rounded-[2.5rem] border-8 border-card shadow-2xl">
				<img
					src="https://github.com/mikeu-dev.png"
					alt="Mikeu"
					class="aspect-square w-full scale-105 object-cover transition-transform duration-700 hover:scale-100"
				/>
			</div>
			<div class="absolute -right-6 bottom-12 rounded-3xl border bg-card/80 p-6 shadow-2xl backdrop-blur-xl">
				<div class="flex items-center gap-4">
					<div class="flex size-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
						<CheckCircle2 class="size-6" />
					</div>
					<div>
						<p class="text-sm font-black">Available for Projects</p>
						<p class="text-xs text-muted-foreground">Open for collaborations</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Philosophy Section -->
	<section class="philosophy-section py-28">
		<div class="mb-20 text-center space-y-4">
			<h2 class="font-poppins text-4xl font-black tracking-tight md:text-5xl">
				{m.about_philosophy_title()}<span class="text-primary">.</span>
			</h2>
			<p class="text-lg text-muted-foreground">{m.about_subtitle()}</p>
		</div>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			{#each philosophies as phil (phil.title)}
				<div class="philosophy-card group relative overflow-hidden rounded-4xl border bg-card p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5">
					<div class={`mb-8 flex size-16 items-center justify-center rounded-2xl bg-muted transition-colors group-hover:bg-primary/10 ${phil.color}`}>
						<Icon iconName={phil.icon} size={32} />
					</div>
					<h3 class="mb-4 font-poppins text-2xl font-black">{phil.title}</h3>
					<p class="leading-relaxed text-muted-foreground">{phil.desc}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Journey Section -->
	<section class="py-28">
		<h2 class="mb-24 text-center font-poppins text-4xl font-black tracking-tight md:text-6xl">
			{m.about_jurney_title()}<span class="text-primary">.</span>
		</h2>

		<div class="journey-container relative mx-auto max-w-4xl px-4">
			<!-- Timeline Progress Line -->
			<div class="absolute top-0 left-8 h-full w-1 bg-muted md:left-1/2 md:-translate-x-1/2">
				<div bind:this={timelineProgress} class="w-full bg-primary" style="height: 0%"></div>
			</div>

			<div class="space-y-24">
				{#each myJourney as item, i (i)}
					<div class="journey-item relative flex flex-col md:flex-row md:items-center">
						<!-- Content -->
						<div class={`relative w-full pl-16 md:w-1/2 md:pl-0 ${i % 2 === 0 ? 'md:pr-20 md:text-right' : 'md:order-2 md:pl-20'}`}>
							<div class="space-y-2">
								<span class="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-black text-primary">
									{item.year}
								</span>
								<h3 class="font-poppins text-2xl font-black">{item.title}</h3>
								<p class="text-lg text-muted-foreground">{item.description}</p>
							</div>
						</div>

						<!-- Indicator -->
						<div class="absolute left-8 top-0 size-4 -translate-x-1/2 rounded-full border-4 border-primary bg-background shadow-[0_0_0_8px_rgba(var(--primary),0.1)] md:left-1/2"></div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Tech Stack Section -->
	<section class="py-28">
		<div class="mb-20 flex flex-col items-center justify-between gap-8 md:flex-row">
			<h2 class="font-poppins text-4xl font-black tracking-tight md:text-6xl">
				{m.about_teckstack_title()}<span class="text-primary">.</span>
			</h2>
			<div class="hidden h-px flex-1 bg-border md:block"></div>
		</div>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			{#each techstack as skillCategory, i (skillCategory.category || i)}
				<div class="group rounded-4xl border bg-card p-8 transition-all duration-300 hover:shadow-xl">
					<div class="mb-6 flex items-center justify-between">
						<h3 class="font-poppins text-xl font-black">{skillCategory.category}</h3>
						<div class="rounded-full bg-muted p-2 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
							<ChevronRight class="size-5" />
						</div>
					</div>
					<p class="mb-8 text-sm leading-relaxed text-muted-foreground">{skillCategory.description}</p>
					<div class="flex flex-wrap gap-2">
						{#each skillCategory.items as tech (tech.name)}
							<span
								class="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs font-bold transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:shadow-sm"
								style="--tag-color: {tech.color}"
							>
								{#if tech.icon}
									<Icon src={tech.icon} size={16} />
								{/if}
								{tech.name}
							</span>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Fun Facts Section -->
	<section class="py-28">
		<div class="rounded-[3rem] border bg-card/30 p-12 backdrop-blur-sm md:p-20">
			<div class="grid grid-cols-1 gap-16 lg:grid-cols-2">
				<div class="space-y-6">
					<h2 class="font-poppins text-4xl font-black tracking-tight md:text-5xl">
						{m.about_fun_facts_title()}<span class="text-primary">.</span>
					</h2>
					<p class="text-xl text-muted-foreground">
						When I'm not pushing pixels or writing logic, you can find me enjoying the smaller things in life.
					</p>
				</div>
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
					{#each funFacts as fact (fact.text)}
						<div class="flex items-center gap-4 rounded-3xl border bg-card p-6 transition-all hover:scale-105">
							<div class={`flex size-14 items-center justify-center rounded-2xl bg-muted ${fact.color}`}>
								<fact.icon class="size-6" />
							</div>
							<p class="font-bold leading-tight">{fact.text}</p>
						</div>
					{/each}
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
</style>
