<script lang="ts">
	import type { PageData } from './$types';
	import type { TechStackCategory, JourneyItem } from '$lib/types';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { getLocale } from '@/lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { getLocalizedTag } from '$lib/utils/project-mapper';
	import { Mail, Coffee, Gamepad2, Music, CheckCircle2, ArrowRight } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import SkillPlayground from '$lib/components/about/skill-playground.svelte';
	import { PUBLIC_CONTACT_EMAIL } from '$env/static/public';

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

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		const ctx = gsap.context(() => {
			const tl = gsap.timeline();

			tl.from('.hero-origami', {
				clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
				duration: 1,
				ease: 'power4.inOut'
			})
				.from(
					'.stagger-item',
					{
						x: -50,
						rotateY: -20,
						opacity: 0,
						duration: 0.8,
						stagger: 0.1,
						ease: 'expo.out'
					},
					'-=0.6'
				)
				.from(
					'.hero-portrait-origami',
					{
						scale: 0.9,
						rotate: 5,
						opacity: 0,
						duration: 0.8,
						ease: 'elastic.out(1, 0.5)'
					},
					'-=0.6'
				);

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

			// Scroll animations for sections
			gsap.from('.journey-item-origami', {
				scrollTrigger: {
					trigger: '.journey-container',
					start: 'top 80%'
				},
				y: 50,
				opacity: 0,
				stagger: 0.2,
				duration: 1,
				ease: 'power4.out'
			});
		}, container);

		return () => ctx.revert();
	});

	async function copyEmail() {
		try {
			await navigator.clipboard.writeText(PUBLIC_CONTACT_EMAIL);
			toast.success(m.blog_link_copied());
		} catch {
			toast.error('Failed to copy email');
		}
	}

	let juiciness = $state({
		caffeine: 95,
		ping: 12,
		syncStatus: 'SYNCING_DATA...'
	});

	$effect(() => {
		const interval = setInterval(() => {
			juiciness.caffeine = 94 + Math.floor(Math.random() * 5);
			juiciness.ping = 10 + Math.floor(Math.random() * 5);
			juiciness.syncStatus = Math.random() > 0.8 ? 'OPTIMIZED' : 'SYNCING_DATA...';
		}, 3000);
		return () => clearInterval(interval);
	});

	const funFacts = $derived([
		{
			icon: Coffee,
			text: `${juiciness.caffeine}%`,
			color: 'text-orange-500',
			bg: 'bg-orange-500/10',
			sub: 'High Caffeine'
		},
		{
			icon: Gamepad2,
			text: `${juiciness.ping}ms`,
			color: 'text-red-500',
			bg: 'bg-red-500/10',
			sub: 'Live Gaming'
		},
		{
			icon: Music,
			text: '24/7',
			color: 'text-pink-500',
			bg: 'bg-pink-500/10',
			sub: 'Deep Beats'
		},
		{
			icon: CheckCircle2,
			text: juiciness.syncStatus,
			color: 'text-emerald-500',
			bg: 'bg-emerald-500/10',
			sub: 'Infinite Loop'
		}
	]);

	let expandedIndex = $state(0);
	function toggleJourney(index: number) {
		expandedIndex = expandedIndex === index ? -1 : index;
	}
</script>

<div bind:this={container} class="relative mt-28 min-h-screen space-y-24 pb-32">
	<!-- Industrial Background -->
	<div
		class="pointer-events-none fixed inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]"
		style="background-image: radial-gradient(var(--foreground) 1px, transparent 1px); background-size: 32px 32px;"
	></div>

	<!-- Hero Section -->
	<section class="container mx-auto px-4">
		<div
			class="hero-origami relative border-y-4 border-foreground bg-card/50 py-16 md:py-24"
			style="clip-path: polygon(0 0, 100% 0, 98% 100%, 2% 100%);"
		>
			<div class="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
				<!-- Text Content -->
				<div class="z-10 space-y-10 lg:col-span-8 lg:pl-16">
					<div class="stagger-item">
						<div
							class="mb-6 inline-block border-2 border-foreground bg-primary px-4 py-1 font-mono text-[10px] font-black tracking-[0.2em] text-primary-foreground uppercase shadow-[4px_4px_0_var(--foreground)]"
						>
							[USER_IDENTITY_STAMP]
						</div>
						<h1 class="font-poppins text-6xl font-black tracking-tighter md:text-9xl">
							{m.about_begin_first_part()} 👋<br />
							I'm
							<span class="text-primary underline decoration-4 underline-offset-8">Mikeu</span><span
								class="text-primary">_</span
							>
						</h1>
					</div>

					<div class="stagger-item space-y-8">
						<div
							class="max-w-2xl font-mono text-sm leading-relaxed tracking-wider text-muted-foreground uppercase md:text-base"
						>
							// <!-- eslint-disable-next-line svelte/no-at-html-tags -->
							{@html m.about_desc_first_part()}
						</div>

						<div class="flex flex-wrap gap-6">
							<button
								class="group relative border-4 border-foreground bg-primary px-8 py-4 font-mono text-xs font-black tracking-[0.2em] text-primary-foreground uppercase transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--foreground)] active:translate-x-0 active:translate-y-0 active:shadow-none"
							>
								{m.about_hero_resume()}
								<ArrowRight
									class="ml-3 inline-block size-5 transition-transform group-hover:translate-x-1"
								/>
							</button>
							<button
								onclick={copyEmail}
								class="group relative border-2 border-foreground bg-background px-8 py-4 font-mono text-xs font-black tracking-[0.2em] uppercase transition-all hover:bg-foreground hover:text-background"
							>
								<Mail class="mr-3 inline-block size-5" />
								{m.about_hero_copy_email()}
							</button>
						</div>

						<div
							class="inline-flex items-center gap-4 border-2 border-foreground bg-foreground/5 p-4 pr-8"
						>
							<div class="flex size-10 items-center justify-center bg-green-500 text-white">
								<CheckCircle2 class="size-6" />
							</div>
							<p class="font-mono text-[10px] font-black tracking-[0.2em] uppercase">
								STATUS: READY_FOR_MISSION_CRITICAL_TASKS
							</p>
						</div>
					</div>
				</div>

				<!-- Portrait -->
				<div class="hero-portrait-origami relative lg:col-span-4 lg:pr-16">
					<div
						class="relative aspect-4/5 border-4 border-foreground bg-muted p-2"
						style="clip-path: polygon(10% 0%, 100% 5%, 90% 100%, 0% 95%);"
					>
						<img
							src="https://github.com/mikeu-dev.png"
							alt="Mikeu"
							class="h-full w-full object-cover grayscale transition-all duration-700 hover:grayscale-0"
						/>

						<!-- Industrial Overlay Tags -->
						<div
							class="absolute -top-4 -right-4 border-2 border-foreground bg-black px-4 py-1 font-mono text-[10px] font-black text-white shadow-[4px_4px_0_var(--primary)] dark:bg-white dark:text-black"
						>
							[SVELTE_EXPERT]
						</div>
						<div
							class="absolute -bottom-4 -left-4 border-2 border-foreground bg-primary px-4 py-1 font-mono text-[10px] font-black text-white shadow-[4px_4px_0_var(--foreground)]"
						>
							[GIS_ENGINEER]
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Interactive Skill Playground -->
	<section class="py-28">
		<div class="container mx-auto mb-20 px-4 text-right">
			<div class="stagger-item inline-block border-l-4 border-primary pr-8">
				<h2 class="font-poppins text-5xl font-black tracking-tighter uppercase italic md:text-8xl">
					THE SKILL <span class="text-primary">PLAYGROUND</span>
				</h2>
				<p
					class="mt-6 ml-auto max-w-md font-mono text-xs tracking-wider text-muted-foreground uppercase"
				>
					// ARTIFACT_COLLECTION_v2.0: INTERACTIVE_TECH_STACK_SIMULATION
				</p>
			</div>
		</div>
		<SkillPlayground categories={techstack} />
	</section>

	<!-- Journey Section -->
	<section class="py-28">
		<div class="container mx-auto px-4">
			<div class="relative mb-32 text-center">
				<div
					class="header-badge mb-6 inline-block border-2 border-foreground bg-foreground px-4 py-1 font-mono text-[10px] font-black text-background uppercase"
				>
					[TEMPORAL_LOGS]
				</div>
				<h2 class="font-poppins text-5xl font-black tracking-tight md:text-8xl">
					{m.about_jurney_title()}<span class="text-primary">_</span>
				</h2>
			</div>

			<div class="journey-container relative mx-auto max-w-5xl">
				<!-- Central Timeline -->
				<div
					class="absolute top-0 left-8 h-full w-2 bg-foreground/10 md:left-1/2 md:-translate-x-1/2"
				>
					<div
						bind:this={timelineProgress}
						class="w-full origin-top bg-primary"
						style="height: 0%"
					></div>
				</div>

				<div class="space-y-24">
					{#each myJourney as item, i (i)}
						{@const isExpanded = expandedIndex === i}
						<div
							class="journey-item-origami group relative flex flex-col md:flex-row md:items-center"
						>
							<!-- Timeline Node -->
							<div
								class={`absolute top-0 left-8 z-20 size-6 -translate-x-1/2 border-4 bg-background transition-all duration-500 md:left-1/2 ${isExpanded ? 'scale-125 rotate-45 border-foreground bg-primary' : 'rotate-0 border-foreground'}`}
							></div>

							<div
								class={`relative w-full pl-20 md:w-1/2 md:pl-0 ${i % 2 === 0 ? 'md:pr-24 md:text-right' : 'md:order-2 md:pl-24'}`}
							>
								<button
									onclick={() => toggleJourney(i)}
									class={`group/card relative w-full border-4 p-8 text-left transition-all duration-500 md:text-inherit ${isExpanded ? 'border-foreground bg-card shadow-[8px_8px_0_var(--primary)]' : 'border-foreground/10 bg-transparent hover:border-foreground/30'}`}
									style={isExpanded ? '' : `clip-path: polygon(0 0, 100% 2%, 98% 100%, 2% 98%);`}
								>
									<div class="space-y-4">
										<div class={`flex items-center gap-4 ${i % 2 === 0 ? 'md:justify-end' : ''}`}>
											<span
												class={`px-3 py-1 font-mono text-xs font-black tracking-widest ${isExpanded ? 'bg-primary text-white' : 'bg-foreground/5 text-foreground/40'}`}
											>
												[{item.year}]
											</span>
										</div>

										<h3
											class={`font-poppins text-3xl font-black tracking-tighter uppercase italic ${isExpanded ? 'text-foreground' : 'text-foreground/30'}`}
										>
											{item.title}
										</h3>

										<div
											class={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'mt-6 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'}`}
										>
											<div class="space-y-6 overflow-hidden">
												<p
													class="font-mono text-sm leading-relaxed tracking-tight text-muted-foreground uppercase"
												>
													// {item.description}
												</p>
												<div
													class={`flex flex-wrap gap-3 border-t border-foreground/10 pt-6 ${i % 2 === 0 ? 'md:justify-end' : ''}`}
												>
													<span
														class="border border-foreground/20 px-3 py-1 font-mono text-[9px] font-black uppercase"
														>STATUS: COMPLETED</span
													>
													<span
														class="border border-foreground/20 px-3 py-1 font-mono text-[9px] font-black uppercase"
														>TYPE: PROFESSIONAL</span
													>
												</div>
											</div>
										</div>

										{#if !isExpanded}
											<div
												class={`mt-4 font-mono text-[9px] font-black tracking-[0.3em] text-primary opacity-0 transition-opacity group-hover/card:opacity-100 ${i % 2 === 0 ? 'md:text-right' : ''}`}
											>
												[EXPAND_ENTRY_DETAILS]
											</div>
										{/if}
									</div>
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- Fun Facts Section -->
	<section class="py-32">
		<div class="container mx-auto px-4">
			<div
				class="relative border-4 border-foreground bg-card p-8 md:p-20"
				style="clip-path: polygon(2% 0%, 98% 2%, 100% 100%, 0% 98%);"
			>
				<div class="grid grid-cols-1 gap-20 lg:grid-cols-12">
					<!-- Fact Header -->
					<div class="space-y-10 lg:col-span-5">
						<div class="stagger-item">
							<div
								class="mb-6 inline-block border-2 border-foreground bg-primary px-4 py-1 font-mono text-[10px] font-black text-white uppercase"
							>
								[SYSTEM_JUICE]
							</div>
							<h2
								class="font-poppins text-5xl font-black tracking-tight uppercase italic md:text-8xl"
							>
								{m.about_fun_facts_title()}<span class="text-primary">_</span>
							</h2>
						</div>

						<p
							class="font-mono text-sm leading-relaxed tracking-wider text-muted-foreground uppercase"
						>
							// {m.about_fun_facts_desc_long()}
						</p>

						<div class="space-y-4">
							<div class="flex items-center gap-4 border-l-4 border-primary pl-6">
								<span class="font-mono text-xs font-black tracking-widest uppercase"
									>{m.about_fun_facts_growth()}</span
								>
							</div>
							<div class="flex items-center gap-4 border-l-4 border-primary pl-6">
								<span class="font-mono text-xs font-black tracking-widest uppercase"
									>{m.about_fun_facts_detail()}</span
								>
							</div>
						</div>
					</div>

					<!-- Fact Grid -->
					<div class="lg:col-span-7">
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
							{#each funFacts as fact, i (fact.sub)}
								<div
									class="group relative border-2 border-foreground bg-background p-8 transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_var(--foreground)]"
								>
									<div class="relative z-10 space-y-8">
										<div class="flex items-center justify-between">
											<div
												class={`flex size-14 items-center justify-center border-2 border-foreground transition-all group-hover:bg-foreground group-hover:text-background ${fact.bg}`}
											>
												<fact.icon
													class={`size-7 ${fact.color} transition-colors group-hover:text-inherit`}
												/>
											</div>

											<!-- Industrial Mini-Widgets -->
											<div class="flex items-center gap-2">
												{#if i === 0}
													<div class="flex gap-1">
														{#each Array(4) as _, j (j)}
															<div
																class={`h-4 w-1.5 border border-foreground ${j < 3 ? 'bg-orange-500' : 'bg-transparent'} animate-pulse`}
																style="animation-delay: {j * 150}ms"
															></div>
														{/each}
													</div>
												{:else if i === 2}
													<div class="flex h-5 items-end gap-1">
														{#each Array(4) as _, j (j)}
															<div
																class="animate-visualizer w-1.5 border border-foreground bg-pink-500"
																style="animation-delay: {j * 100}ms"
															></div>
														{/each}
													</div>
												{:else if i === 1}
													<div
														class="flex items-center gap-2 border border-foreground bg-red-500/10 px-2 py-1"
													>
														<div class="size-2 animate-ping rounded-none bg-red-500"></div>
														<span class="font-mono text-[8px] font-black text-red-500 uppercase"
															>LIVE</span
														>
													</div>
												{/if}
											</div>
										</div>

										<div class="space-y-2">
											<p
												class="font-mono text-[9px] font-black tracking-widest text-muted-foreground uppercase"
											>
												[NODE_{fact.sub.replace(' ', '_').toUpperCase()}]
											</p>
											<p class="font-mono text-3xl font-black tracking-tighter uppercase italic">
												{fact.text}
											</p>
										</div>
									</div>
									<div
										class="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full"
									></div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</div>

<style lang="postcss">
	@reference "tailwindcss";

	:global(.prose strong) {
		font-weight: 900;
		color: var(--foreground);
	}

	:global(.prose em) {
		font-weight: 700;
		color: var(--primary);
		font-style: normal;
	}

	.hero-origami {
		transform-style: preserve-3d;
		perspective: 1000px;
	}

	@keyframes visualizer {
		0%,
		100% {
			height: 30%;
		}
		50% {
			height: 100%;
		}
	}

	.group:hover .animate-visualizer {
		animation: visualizer 0.8s ease-in-out infinite;
	}

	.group:hover .animate-ping {
		animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
	}

	.animate-visualizer,
	.animate-ping {
		animation: none;
	}

	button {
		@apply cursor-pointer;
	}
</style>
