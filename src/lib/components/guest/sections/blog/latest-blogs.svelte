<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import BlogCard from '../../blog/blog-card.svelte';
	import type { BlogPost } from '$lib/types';
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import Icon from '$lib/components/ui/icon.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { Hash, Command, Terminal } from '@lucide/svelte';

	let { posts = [] } = $props<{ posts: BlogPost[] }>();

	let section = $state<HTMLElement>();
	let dossierProgress = $state(0);
	let dossierState = $derived(
		dossierProgress < 5
			? 'DOSSIER_SECURED'
			: dossierProgress > 95
				? 'DOSSIER_DECRYPTED'
				: 'DECRYPTING_DOSSIER'
	);

	let activeIndex = $state(0);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let triggerInstance = $state<any>(null);

	function navigateToPage(idx: number) {
		const pages = gsap.utils.toArray('.origami-page-layer') as HTMLElement[];
		const targetPage = pages[idx];
		if (!targetPage) return;

		if (triggerInstance) {
			const start = triggerInstance.start;
			const end = triggerInstance.end;
			const totalPages = posts.length > 1 ? posts.length - 1 : 1;
			const targetScroll = start + (idx / totalPages) * (end - start);
			window.scrollTo({
				top: targetScroll + 2,
				behavior: 'smooth'
			});
		}
	}

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		// 1. Staggered section entrance animations
		const introTl = gsap.timeline({
			scrollTrigger: {
				trigger: section,
				start: 'top 80%',
				toggleActions: 'play none none none'
			}
		});

		introTl
			.from('.origami-shard-blog', {
				rotateX: -120,
				rotateY: 45,
				scale: 0.3,
				opacity: 0,
				duration: 1.4,
				stagger: 0.15,
				ease: 'power3.out'
			})
			.from(
				'.blog-header-stagger',
				{
					rotateX: -90,
					transformOrigin: 'top center',
					y: 30,
					opacity: 0,
					duration: 1.2,
					stagger: 0.1,
					ease: 'power4.out'
				},
				'-=1.0'
			);

		// 2. Responsive matchMedia layout timelines
		const mm = gsap.matchMedia();
		const pages = gsap.utils.toArray('.origami-page-layer') as HTMLElement[];
		let bookTl: gsap.core.Timeline | null = null;

		if (pages.length > 0) {
			// All screens: 3D Horizontal Page-Turner Binder (rotateY along left hinge)
			mm.add('all', () => {
				// Initially stack page layers in absolute frame
				pages.forEach((page, idx) => {
					const panel = page.querySelector('.origami-panel') as HTMLElement;
					if (idx !== 0) {
						gsap.set(page, {
							opacity: 0,
							scale: 0.85,
							z: -100,
							pointerEvents: 'none',
							visibility: 'hidden',
							position: 'absolute',
							top: 0,
							left: 0
						});
					} else {
						gsap.set(page, {
							opacity: 1,
							scale: 1,
							z: 0,
							pointerEvents: 'auto',
							visibility: 'visible',
							position: 'absolute',
							top: 0,
							left: 0
						});
					}
					if (panel) {
						gsap.set(panel, {
							rotateY: 0,
							z: 0
						});
					}
				});

				bookTl = gsap.timeline({
					scrollTrigger: {
						trigger: section,
						start: 'top top',
						end: `+=${pages.length * 100}%`,
						pin: true,
						scrub: 0.8,
						onUpdate: (self) => {
							dossierProgress = self.progress * 100;
							activeIndex = Math.min(
								pages.length - 1,
								Math.floor(self.progress * pages.length * 0.99)
							);
						}
					}
				});

				triggerInstance = bookTl.scrollTrigger;

				// Generate page-flip transitions between layers
				pages.forEach((page, idx) => {
					if (idx === pages.length - 1) return;

					const nextPage = pages[idx + 1];
					const panel = page.querySelector('.origami-panel') as HTMLElement;

					bookTl!
						// Page flips horizontally along left hinge (rotateY)
						.fromTo(
							panel,
							{ rotateY: 0, z: 0 },
							{
								rotateY: -180,
								z: 15,
								duration: 1.2,
								ease: 'power2.inOut'
							},
							idx
						)
						// Current page fades out
						.to(
							page,
							{
								opacity: 0,
								scale: 0.9,
								pointerEvents: 'none',
								visibility: 'hidden',
								duration: 0.8
							},
							idx + 0.3
						)
						// Next page lifts into place
						.fromTo(
							nextPage,
							{
								opacity: 0,
								scale: 0.85,
								z: -100,
								visibility: 'hidden'
							},
							{
								opacity: 1,
								scale: 1,
								z: 0,
								visibility: 'visible',
								pointerEvents: 'auto',
								duration: 1.2,
								ease: 'power3.out'
							},
							idx + 0.2
						);
				});

				return () => {
					if (bookTl && bookTl.scrollTrigger) {
						bookTl.scrollTrigger.kill();
					}
				};
			});
		}

		// Mouse Parallax for background depth elements
		const handleMouseMove = (e: MouseEvent) => {
			const { clientX, clientY } = e;
			const x = (clientX / window.innerWidth - 0.5) * 8;
			const y = (clientY / window.innerHeight - 0.5) * 8;

			gsap.to('.blog-parallax-layer', {
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

<section
	id="latest-blog"
	bind:this={section}
	class="relative overflow-hidden bg-background py-6 md:py-32"
>
	<!-- Grain Texture Overlay -->
	<div
		class="pointer-events-none absolute inset-0 z-50 opacity-[0.03] mix-blend-overlay contrast-150 grayscale"
		style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
	></div>

	<div class="relative container mx-auto px-6">
		<!-- Responsive Grid: Collapses vertically on mobile, split columns on desktop -->
		<div
			class="blog-parallax-layer relative grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-16"
		>
			<!-- Decorative Background Shards -->
			<div
				class="origami-shard-blog absolute -top-24 -right-24 size-96 bg-primary/5 dark:bg-primary/10"
				style="clip-path: polygon(20% 0%, 100% 20%, 80% 100%, 0% 80%);"
			></div>
			<div
				class="origami-shard-blog absolute -bottom-24 -left-24 size-80 bg-foreground/5"
				style="clip-path: polygon(0% 10%, 90% 0%, 100% 90%, 10% 100%);"
			></div>

			<!-- LEFT COLUMN: Header + Dossier HUD Controls (5 cols on lg) -->
			<div class="blog-header-stagger flex flex-col justify-center py-4 text-left lg:col-span-5">
				<div class="mb-4 flex flex-wrap items-center gap-2 md:mb-6 md:gap-4">
					<div
						class="flex items-center gap-2 font-mono text-[10px] font-black tracking-[0.2em] text-primary uppercase"
					>
						<Terminal class="size-3" /> ARCHIVE_SCAN: RECENT_ENTRIES
					</div>
					<div
						class="flex items-center gap-2 font-mono text-[10px] font-black tracking-[0.2em] text-foreground/40 uppercase"
					>
						<Command class="size-3 animate-pulse" /> [READY_FOR_READING]
					</div>
				</div>

				<h2 class="font-poppins text-5xl leading-none font-black tracking-tighter sm:text-7xl">
					{m.blog_latest_header()} <span class="text-primary italic">{m.blog_title()}</span><span
						class="text-primary">.</span
					>
				</h2>

				<p
					class="mt-4 max-w-lg font-mono text-xs leading-relaxed text-muted-foreground uppercase sm:text-sm md:mt-6"
				>
					{m.blog_subtitle()}
				</p>

				<!-- Interactive Origami HUD Controller -->
				{#if posts.length > 0}
					<div
						class="mt-4 flex flex-col gap-4 border-t-2 border-foreground/10 pt-4 md:mt-8 md:gap-6 md:pt-6"
					>
						<div class="flex items-center gap-4">
							<span class="font-mono text-xs font-black tracking-widest text-primary uppercase">
								DOSSIER_PAGE: {String(activeIndex + 1).padStart(2, '0')} // {String(
									posts.length
								).padStart(2, '0')}
							</span>
							<div class="flex h-3 w-32 border border-foreground bg-background/50 p-[1px]">
								<div
									class="h-full bg-primary transition-all duration-300"
									style="width: {((activeIndex + 1) / posts.length) * 100}%"
								></div>
							</div>
						</div>

						<!-- Decrypt State HUD (desktop only) -->
						<div
							class="hidden items-center gap-2 font-mono text-[9px] font-black tracking-widest text-foreground/40 uppercase lg:flex"
						>
							<span>DECRYPT_STATE: {dossierState}</span>
							<span class="text-primary">|</span>
							<span>{dossierProgress.toFixed(0)}%</span>
						</div>

						<!-- Clickable Page Tabs (Brutalist Mini-Origami Buttons) -->
						<div class="hidden flex-wrap gap-2 md:flex">
							{#each posts as post, idx (post.slug)}
								<button
									onclick={() => navigateToPage(idx)}
									class="relative flex h-8 cursor-pointer items-center justify-center border-2 border-foreground px-4 font-mono text-[9px] font-black tracking-widest uppercase transition-all duration-200 {activeIndex ===
									idx
										? '-translate-y-1 bg-primary text-primary-foreground shadow-[2px_2px_0px_var(--foreground)]'
										: 'bg-card text-foreground hover:bg-muted active:translate-y-0 active:shadow-none'}"
									style="clip-path: polygon(0% 15%, 100% 0%, 95% 100%, 5% 85%);"
								>
									{post.title.length > 18 ? post.title.slice(0, 18) + '…' : post.title}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- RIGHT COLUMN: 3D Binder Page Stack -->
			<div
				class="blog-page-stack relative block h-[45vh] min-h-[300px] w-full lg:col-span-7 lg:h-[70vh] lg:min-h-[480px]"
			>
				{#if posts.length > 0}
					{#each posts as post, idx (post.slug)}
						<div
							class="origami-page-layer h-full w-full will-change-transform"
							style="z-index: {posts.length - idx}; transform-style: preserve-3d;"
							data-index={idx}
						>
							<div
								class="origami-panel relative h-full w-full will-change-transform"
								style="transform-style: preserve-3d; transform-origin: left center;"
							>
								<!-- Front: Blog Card -->
								<div
									class="panel-front relative"
									style="backface-visibility: hidden; -webkit-backface-visibility: hidden;"
								>
									<BlogCard {post} animateOnScroll={false} />
								</div>

								<!-- Back: Dossier Technical Cover (visible mid page-flip) -->
								{#if idx < posts.length - 1}
									<div
										class="panel-back absolute inset-0 z-0 flex flex-col justify-between overflow-hidden border-2 border-foreground bg-card p-8"
										style="backface-visibility: hidden; -webkit-backface-visibility: hidden; transform: rotateY(180deg); transform-style: preserve-3d;"
									>
										<!-- Origami Crease Lighting Overlay -->
										<div
											class="origami-crease pointer-events-none absolute inset-0 z-20 opacity-25"
										></div>

										<!-- Tactical Classified Stamp -->
										<div
											class="pointer-events-none absolute top-[42%] left-[10%] z-10 -rotate-12 border-2 border-dashed border-destructive/20 px-4 py-1.5 select-none dark:border-destructive/40"
										>
											<span
												class="font-mono text-xs font-black tracking-[0.25em] text-destructive/20 uppercase dark:text-destructive/40"
											>
												[CLASSIFIED]
											</span>
										</div>

										<div class="relative z-10 flex flex-col gap-4">
											<div
												class="flex items-center justify-between border-b border-foreground/10 pb-4 font-mono text-[8px] font-black tracking-[0.2em] text-primary"
											>
												<span
													>SYSTEM_ARCHIVE // DOSSIER_PART_{String(idx + 1).padStart(2, '0')}</span
												>
												<span>SEC_LEVEL_CONFIDENTIAL</span>
											</div>
											<h4
												class="mt-6 font-poppins text-3xl leading-none font-black tracking-tighter uppercase"
											>
												TECHNICAL<br />DOSSIER<span class="text-primary">.</span>
											</h4>
											<p
												class="mt-4 font-mono text-[9px] leading-relaxed text-muted-foreground uppercase"
											>
												RECORD_ID: Mikeu_Dev_{String(idx + 1).padStart(2, '0')}B<br />
												PROTOCOL: AES_256_STRICT<br />
												CATEGORY: KNOWLEDGE_BASE
											</p>
										</div>
										<div
											class="relative z-10 flex items-end justify-between border-t border-foreground/10 pt-4"
										>
											<div
												class="h-8 w-28 bg-foreground/10"
												style="background: repeating-linear-gradient(90deg, var(--foreground), var(--foreground) 2px, transparent 2px, transparent 6px);"
											></div>
											<span
												class="font-mono text-[8px] font-black tracking-[0.2em] text-foreground/30"
												>[PART_{String(idx + 1).padStart(2, '0')} // SECURE]</span
											>
										</div>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				{:else}
					<div class="blog-header-stagger py-24 text-center">
						<div
							class="mx-auto mb-6 flex size-16 items-center justify-center border-2 border-foreground/10"
						>
							<Hash class="size-8 text-foreground/20" />
						</div>
						<p class="font-mono text-sm font-black tracking-widest text-muted-foreground uppercase">
							{m.blog_empty()}
						</p>
					</div>
				{/if}
			</div>

			<!-- CTA (full-width inside grid) -->
			{#if posts.length > 0}
				<div class="blog-header-stagger mt-8 text-center lg:col-span-12 lg:mt-24">
					<a
						href={localizeHref('/blog')}
						class="group relative inline-flex h-16 items-center justify-center overflow-hidden bg-foreground px-12 text-background transition-all hover:bg-primary hover:text-primary-foreground sm:h-20 sm:w-80"
						style="clip-path: polygon(0% 15%, 100% 0%, 95% 100%, 5% 85%);"
					>
						<div class="flex items-center gap-4">
							<span class="font-poppins text-xl font-black tracking-tighter uppercase">
								{m.blog_card_button()}
							</span>
							<Icon
								iconName="BsArrowRight"
								size={20}
								class="transition-transform duration-300 group-hover:translate-x-2"
							/>
						</div>
					</a>
				</div>
			{/if}

			<!-- Footer Technicality (full-width inside grid) -->
			<div
				class="mt-8 flex items-center justify-between border-t-2 border-foreground/10 pt-4 font-mono text-[8px] font-black tracking-[0.3em] text-foreground/30 uppercase lg:col-span-12 lg:mt-24 lg:pt-8"
			>
				<div class="flex items-center gap-4">
					<Hash class="size-3" />
					<span>MIKEU_DEV // BLOG_ARCHIVE_V3</span>
				</div>
				<div class="hidden sm:block">PROTOCOL: BLOG_ARCHIVE_SECURED</div>
				<span>ENTRIES_TOTAL: {posts.length.toString().padStart(2, '0')}</span>
			</div>
		</div>
	</div>
</section>

<style lang="postcss">
	@reference "tailwindcss";

	#latest-blog {
		perspective: 1200px;
	}

	.blog-parallax-layer {
		transform-style: preserve-3d;
	}

	.origami-shard-blog {
		pointer-events: none;
	}

	/* Page stack 3D structural layout */
	.blog-page-stack {
		perspective: 2000px;
		transform-style: preserve-3d;
	}

	.origami-page-layer {
		transform-style: preserve-3d;
		perspective: 2000px;
	}

	.origami-panel {
		transform-style: preserve-3d;
	}

	.panel-front,
	.panel-back {
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
		width: 100%;
		height: 100%;
	}

	/* Engineering blueprint style grid background for dossier back covers */
	.panel-back {
		background-image:
			linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
		background-size: 16px 16px;
		transition: background-color 0.4s ease;
	}

	:global(.dark) .panel-back {
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
		background-size: 16px 16px;
	}

	/* Origami Crease Shading Lighting */
	.origami-crease {
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.05) 0%,
			rgba(255, 255, 255, 0) 50%,
			rgba(0, 0, 0, 0.08) 50.1%,
			rgba(0, 0, 0, 0.16) 100%
		);
		mix-blend-mode: multiply;
	}

	:global(.dark) .origami-crease {
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.03) 0%,
			rgba(255, 255, 255, 0) 50%,
			rgba(0, 0, 0, 0.18) 50.1%,
			rgba(0, 0, 0, 0.38) 100%
		);
	}
</style>
