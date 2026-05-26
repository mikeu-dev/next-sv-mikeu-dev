<script lang="ts">
	import ProjectCard from '@/lib/components/guest/card/project-card.svelte';
	import * as Tooltip from '@/lib/components/ui/tooltip';
	import type { Project } from '$lib/types';
	import { useWorkSection } from './work.svelte.js';
	import { getLocale } from '$lib/paraglide/runtime.js';
	import { m } from '$lib/paraglide/messages.js';
	import { getLocalizedProject } from '$lib/utils/project-mapper';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { Terminal, Command, Hash } from '@lucide/svelte';

	let { projects }: { projects: Project[] } = $props();
	let currentLocale = $derived(getLocale());
	let localizedProjects = $derived(
		projects.filter((p) => p.pinned).map((p) => getLocalizedProject(p, currentLocale))
	);

	let activeIndex = $state(0);
	let triggerInstance = $state<ScrollTrigger | null>(null);

	const { workSection, tooltipOpen, virtualAnchor, tooltipText } = useWorkSection();

	function navigateToCard(idx: number) {
		const cards = gsap.utils.toArray('.origami-card-layer') as HTMLElement[];
		const targetCard = cards[idx];
		if (!targetCard) return;

		if (triggerInstance) {
			const start = triggerInstance.start;
			const end = triggerInstance.end;
			const targetScroll = start + (idx / (localizedProjects.length - 1)) * (end - start);
			window.scrollTo({
				top: targetScroll + 2, // Offset slightly to guarantee trigger activation
				behavior: 'smooth'
			});
		}
	}

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		const sectionEl = $workSection;
		if (!sectionEl) return;

		// 1. Initial entrance for background shards and text elements
		const introTl = gsap.timeline({
			scrollTrigger: {
				trigger: sectionEl,
				start: 'top 80%',
				toggleActions: 'play none none none'
			}
		});

		introTl
			.from('.origami-shard', {
				rotateX: -120,
				rotateY: 45,
				scale: 0.3,
				opacity: 0,
				duration: 1.4,
				stagger: 0.15,
				ease: 'power3.out'
			})
			.from(
				'.work-header-stagger',
				{
					rotateX: -90,
					transformOrigin: 'top center',
					y: 30,
					opacity: 0,
					duration: 1.2,
					ease: 'power4.out'
				},
				'-=1.0'
			);

		// 2. Responsive matchMedia timeline
		const mm = gsap.matchMedia();
		const cards = gsap.utils.toArray('.origami-card-layer') as HTMLElement[];
		let pinTl: gsap.core.Timeline | null = null;

		if (cards.length > 0) {
			// All screens: 3D Scroll-Pinned Deck Stack morphs
			mm.add('all', () => {
				// Initially stack card layers in absolute frame
				cards.forEach((card, idx) => {
					const inner = card.querySelector('.project-card-inner');
					const shadow = card.querySelector('.project-card-shadow');
					if (idx !== 0) {
						gsap.set(card, {
							opacity: 0,
							scale: 0.85,
							rotateX: -60,
							pointerEvents: 'none',
							yPercent: 30,
							visibility: 'hidden',
							position: 'absolute',
							top: 0,
							left: 0
						});
					} else {
						gsap.set(card, {
							opacity: 1,
							scale: 1,
							rotateX: 0,
							pointerEvents: 'auto',
							yPercent: 0,
							visibility: 'visible',
							position: 'absolute',
							top: 0,
							left: 0
						});
					}
					if (inner) {
						gsap.set(inner, {
							clipPath: 'polygon(0% 0%, 100% 4%, 96% 96%, 4% 100%)'
						});
					}
					if (shadow) {
						gsap.set(shadow, {
							clipPath: 'polygon(4% 4%, 96% 0%, 100% 100%, 0% 96%)'
						});
					}
				});

				pinTl = gsap.timeline({
					scrollTrigger: {
						trigger: sectionEl,
						start: 'top top',
						end: `+=${cards.length * 100}%`,
						pin: true,
						scrub: 0.8,
						snap: {
							snapTo: 'labels',
							duration: { min: 0.2, max: 0.5 },
							delay: 0.05,
							ease: 'power2.inOut'
						},
						onUpdate: (self) => {
							const progress = self.progress;
							activeIndex = Math.min(cards.length - 1, Math.floor(progress * cards.length * 0.99));
						}
					}
				});

				triggerInstance = pinTl.scrollTrigger || null;

				// Generate transitions between card layers
				cards.forEach((card, idx) => {
					pinTl!.addLabel('step' + idx, idx);

					if (idx === cards.length - 1) return;

					const nextCard = cards[idx + 1];
					const inner = card.querySelector('.project-card-inner');
					const shadow = card.querySelector('.project-card-shadow');

					pinTl!
						.to(
							inner,
							{
								clipPath: 'polygon(0% 0%, 100% 0%, 50% 50%, 0% 100%)', // Diagonal fold morph
								rotateX: 75,
								rotateY: -30,
								yPercent: 100,
								opacity: 0,
								duration: 1,
								ease: 'power2.inOut'
							},
							idx
						)
						.to(
							shadow,
							{
								clipPath: 'polygon(0% 0%, 100% 0%, 50% 50%, 0% 100%)',
								opacity: 0,
								scale: 0.8,
								duration: 1,
								ease: 'power2.inOut'
							},
							idx
						)
						.to(
							card,
							{
								pointerEvents: 'none',
								visibility: 'hidden',
								duration: 0.1
							},
							idx
						)
						.to(
							nextCard,
							{
								opacity: 1,
								scale: 1,
								rotateX: 0,
								yPercent: 0,
								pointerEvents: 'auto',
								visibility: 'visible',
								duration: 1,
								ease: 'power3.out'
							},
							idx + 0.2
						);
				});

				return () => {
					if (pinTl && pinTl.scrollTrigger) {
						pinTl.scrollTrigger.kill();
					}
				};
			});
		}

		// Mouse Parallax for section background elements
		const handleMouseMove = (e: MouseEvent) => {
			const { clientX, clientY } = e;
			const x = (clientX / window.innerWidth - 0.5) * 12;
			const y = (clientY / window.innerHeight - 0.5) * 12;

			gsap.to('.work-parallax-layer', {
				rotateY: x,
				rotateX: -y,
				duration: 1.5,
				ease: 'power2.out'
			});
		};

		window.addEventListener('mousemove', handleMouseMove);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			mm.revert();
		};
	});
</script>

<Tooltip.Provider>
	<Tooltip.Root bind:open={$tooltipOpen}>
		<section
			bind:this={$workSection}
			class="work-section relative overflow-hidden bg-background py-6 md:py-32"
		>
			<!-- Grain Texture Overlay -->
			<div
				class="pointer-events-none absolute inset-0 z-50 opacity-[0.03] mix-blend-overlay contrast-150 grayscale"
				style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
			></div>

			<div class="relative container mx-auto px-6">
				<!-- Responsive Grid Structure: Collapses vertically on mobile, Split columns on desktop -->
				<div
					class="work-parallax-layer relative grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-16"
				>
					<!-- Decorative Background Shards -->
					<div
						class="origami-shard absolute -top-32 -left-32 size-96 bg-primary/5 dark:bg-primary/10"
						style="clip-path: polygon(10% 0%, 100% 10%, 90% 100%, 0% 90%);"
					></div>
					<div
						class="origami-shard absolute -right-32 -bottom-32 size-80 bg-foreground/5"
						style="clip-path: polygon(0% 15%, 85% 0%, 100% 85%, 15% 100%);"
					></div>

					<!-- LEFT COLUMN: Technical HUD Controls & Sticky Header (5 cols on lg) -->
					<div
						class="work-header-stagger flex flex-col justify-center py-4 text-left lg:col-span-5"
					>
						<div class="mb-4 flex flex-wrap items-center gap-2 md:mb-6 md:gap-4">
							<div
								class="flex items-center gap-2 font-mono text-[10px] font-black tracking-[0.2em] text-primary uppercase"
							>
								<Terminal class="size-3" /> ARCHIVE_SECTOR: PROJECTS_CATALOG
							</div>
							<div
								class="flex items-center gap-2 font-mono text-[10px] font-black tracking-[0.2em] text-foreground/40 uppercase"
							>
								<Command class="size-3 animate-pulse" /> [PIN_STATUS: LOCKED_3D]
							</div>
						</div>

						<h2 class="font-poppins text-5xl leading-none font-black tracking-tighter sm:text-7xl">
							{m.work_title()}<span class="text-primary">.</span>
						</h2>
						<p
							class="mt-4 max-w-lg font-mono text-xs leading-relaxed text-muted-foreground uppercase sm:text-sm md:mt-6"
						>
							{m.work_subtitle()}
						</p>

						<!-- Interactive Origami Booklet HUD Controller -->
						<div
							class="mt-4 flex flex-col gap-4 border-t-2 border-foreground/10 pt-4 md:mt-8 md:gap-6 md:pt-6"
						>
							<div class="flex items-center gap-4">
								<span class="font-mono text-xs font-black tracking-widest text-primary uppercase">
									CATALOG_INDEX: {String(activeIndex + 1).padStart(2, '0')} // {String(
										localizedProjects.length
									).padStart(2, '0')}
								</span>
								<div class="flex h-3 w-32 border border-foreground bg-background/50 p-px">
									<div
										class="h-full bg-primary transition-all duration-300"
										style="width: {((activeIndex + 1) / localizedProjects.length) * 100}%"
									></div>
								</div>
							</div>

							<!-- Clickable Segment Tabs (Brutalist Mini-Origami button tabs) -->
							<div class="hidden flex-wrap gap-2 md:flex">
								{#each localizedProjects as proj, idx (proj.id)}
									<button
										onclick={() => navigateToCard(idx)}
										class="relative flex h-8 cursor-pointer items-center justify-center border-2 border-foreground px-4 font-mono text-[9px] font-black tracking-widest uppercase transition-all duration-200 {activeIndex ===
										idx
											? '-translate-y-1 bg-primary text-primary-foreground shadow-[2px_2px_0px_var(--foreground)]'
											: 'bg-card text-foreground hover:bg-muted active:translate-y-0 active:shadow-none'}"
										style="clip-path: polygon(0% 15%, 100% 0%, 95% 100%, 5% 85%);"
									>
										{proj.title}
									</button>
								{/each}
							</div>
						</div>
					</div>

					<!-- RIGHT COLUMN: 3D Origami Card Deck Stack -->
					<div
						class="relative block h-[45vh] min-h-[300px] w-full lg:col-span-7 lg:h-[70vh] lg:min-h-[480px]"
					>
						{#each localizedProjects as project, i (project.id)}
							<div
								class="origami-card-layer h-full w-full will-change-transform"
								style="z-index: {localizedProjects.length - i}; transform-style: preserve-3d;"
								data-index={i}
							>
								<ProjectCard {project} animateOnScroll={false} />
							</div>
						{/each}
					</div>
				</div>

				<!-- Footer Technicality -->
				<div
					class="mt-8 flex items-center justify-between border-t-2 border-foreground/10 pt-4 font-mono text-[8px] font-black tracking-[0.3em] text-foreground/30 uppercase lg:mt-20 lg:pt-8"
				>
					<div class="flex items-center gap-4">
						<Hash class="size-3" />
						<span>MIKEU_DEV // PROJECT_VAULT_V3</span>
					</div>
					<div class="hidden sm:block">ENCRYPTION: AES_256_GCM</div>
					<span>LOAD_COUNT: {localizedProjects.length.toString().padStart(2, '0')}</span>
				</div>
			</div>

			<Tooltip.Content customAnchor={$virtualAnchor}>
				<p class="font-mono text-[10px] font-bold tracking-widest uppercase">
					{$tooltipText}
				</p>
			</Tooltip.Content>
		</section>
	</Tooltip.Root>
</Tooltip.Provider>

<style lang="postcss">
	@reference "tailwindcss";

	.work-section {
		perspective: 1200px;
	}

	.work-parallax-layer {
		transform-style: preserve-3d;
	}

	.origami-shard {
		pointer-events: none;
	}
</style>
