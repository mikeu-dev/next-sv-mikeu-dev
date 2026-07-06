<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import Icon from '$lib/components/ui/icon.svelte';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { Database, Activity, Cpu } from '@lucide/svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { origamiClipPath, randomOrigamiClipPath } from '$lib/utils/origami-shape';
	import { tornPaperClipPath } from '$lib/utils/torn-paper-shape';

	let { socials = [], visitorStats = { total: 0, today: 0 } } = $props();

	let footerElement = $state<HTMLElement>();

	// Static, seeded shapes — computed once so the torn/folded silhouette is
	// identical between SSR and hydration instead of reshuffling like
	// `Math.random()` would (same reasoning as the rest of the origami system).
	const topTearClipPath = tornPaperClipPath('footer-top-tear', { segments: 36, jitter: 40 });
	const bottomTearClipPath = tornPaperClipPath('footer-bottom-tear', { segments: 24, jitter: 16 });
	const logoClipPath = origamiClipPath({
		tl: 0,
		tr: { x: 18, y: 10 },
		br: 10,
		bl: { x: 10, y: 16 }
	});
	const statsClipPath = origamiClipPath({ tl: 0, tr: { x: 8, y: 3 }, br: 5, bl: { x: 3, y: 8 } });
	const statsShadowClipPath = origamiClipPath({
		tl: { x: 8, y: 3 },
		tr: 5,
		br: { x: 3, y: 8 },
		bl: 0
	});

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		const targets = footerElement?.querySelectorAll('.footer-stagger');
		if (targets && targets.length > 0) {
			gsap.from(targets, {
				y: 20,
				opacity: 0,
				duration: 0.8,
				stagger: 0.1,
				ease: 'power3.out',
				scrollTrigger: {
					trigger: footerElement,
					start: 'top 95%'
				}
			});
		}
	});
</script>

<footer bind:this={footerElement} class="relative overflow-hidden bg-background py-12">
	<!-- Torn Paper Top Edge — a thin ragged scar, not a slab, as if this sheet was ripped from the page above -->
	<div
		class="pointer-events-none absolute inset-x-0 top-0 z-10 h-1.5 bg-foreground"
		style="clip-path: {topTearClipPath};"
	></div>

	<!-- Decorative Origami Shards -->
	<div
		class="pointer-events-none absolute -top-16 -right-16 z-0 size-72 bg-primary/5 dark:bg-primary/10"
		style="clip-path: polygon(0% 15%, 100% 0%, 85% 100%, 15% 85%);"
	></div>
	<div
		class="pointer-events-none absolute -bottom-20 -left-20 z-0 size-64 bg-foreground/5"
		style="clip-path: polygon(15% 0%, 100% 15%, 85% 85%, 0% 100%);"
	></div>

	<!-- Grain Texture Overlay -->
	<div
		class="pointer-events-none absolute inset-0 z-50 opacity-[0.03] mix-blend-overlay contrast-150 grayscale"
		style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
	></div>

	<div class="relative z-10 container mx-auto px-6">
		<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
			<!-- Branding & Nav -->
			<div class="footer-stagger flex flex-col gap-8">
				<div class="flex items-center gap-3">
					<div class="relative size-10 shrink-0">
						<div
							class="absolute inset-0 translate-x-1 translate-y-1 bg-foreground"
							style="clip-path: {logoClipPath};"
						></div>
						<div
							class="relative flex size-10 items-center justify-center border-2 border-foreground bg-primary text-xl font-black text-primary-foreground"
							style="clip-path: {logoClipPath};"
						>
							M
						</div>
					</div>
					<h3 class="font-poppins text-2xl font-black tracking-tighter uppercase">
						Mikeu<span class="text-primary">.</span>Dev
					</h3>
				</div>

				<div class="flex flex-col gap-4">
					<p
						class="max-w-md font-mono text-xs leading-loose font-black tracking-widest text-muted-foreground uppercase"
					>
						[ARCHIVE_SYSTEM_V2.0] // BUILT_WITH_PRECISION // CRAFTED_IN_INDONESIA.
						EVERY_PIXEL_MATTERS. EVERY_LINE_COUNTS.
					</p>

					<nav
						class="flex flex-wrap gap-x-8 gap-y-2 font-mono text-[10px] font-black tracking-[0.2em] uppercase"
					>
						<a
							href={localizeHref('/privacy-policy')}
							class="group relative transition-colors hover:text-primary"
						>
							Privacy_Policy
							<span
								class="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full"
							></span>
						</a>
						<a
							href={localizeHref('/terms-of-service')}
							class="group relative transition-colors hover:text-primary"
						>
							Terms_Of_Service
							<span
								class="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full"
							></span>
						</a>
						<a
							href={localizeHref('/disclaimer')}
							class="group relative transition-colors hover:text-primary"
						>
							Disclaimer
							<span
								class="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full"
							></span>
						</a>
					</nav>
				</div>
			</div>

			<!-- Socials & Stats -->
			<div class="footer-stagger flex flex-col items-start gap-8 lg:items-end">
				<!-- Social Grid -->
				<div class="flex flex-wrap gap-4">
					{#each socials as link (link.href)}
						{@const clip = randomOrigamiClipPath(link.href, {
							minCut: 10,
							maxCut: 22,
							sharpChance: 0,
							family: 'notch'
						})}
						<Tooltip.Provider>
							<Tooltip.Root>
								<div class="group relative size-12">
									<!-- Hard shadow sibling — clip-path clips its own box-shadow too,
									     so the "shadow" has to be a same-shaped element behind it. -->
									<div
										class="pointer-events-none absolute inset-0 bg-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100"
										style="clip-path: {clip}; transform: translate(5px, 5px);"
									></div>
									<Tooltip.Trigger>
										<a
											href={link.href}
											target="_blank"
											rel="noopener noreferrer"
											aria-label={link.label}
											class="social-box relative flex size-12 items-center justify-center border-2 border-foreground bg-background transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-primary group-hover:text-primary-foreground"
											style="clip-path: {clip};"
										>
											<Icon iconName={link.iconName} src={link.icon} size={20} />
										</a>
									</Tooltip.Trigger>
								</div>
								<Tooltip.Content>
									<p class="font-mono text-[9px] font-black tracking-widest uppercase">
										{link.label}
									</p>
								</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>
					{/each}
				</div>

				<!-- Diagnostic Stats — folded paper panel -->
				<div class="relative w-full lg:w-auto">
					<div
						class="pointer-events-none absolute inset-0 translate-x-1.5 translate-y-1.5 border-2 border-foreground"
						style="clip-path: {statsShadowClipPath};"
					></div>
					<div
						class="relative grid grid-cols-2 gap-4 border-2 border-foreground bg-foreground/5 p-4 lg:min-w-64 lg:grid-cols-1"
						style="clip-path: {statsClipPath};"
					>
						<div class="flex flex-col gap-1">
							<span
								class="flex items-center gap-2 font-mono text-[8px] font-black tracking-widest text-muted-foreground uppercase"
							>
								<Activity class="size-2 text-primary" /> SYSTEM_STATUS
							</span>
							<span
								class="font-mono text-[10px] font-black tracking-wider text-foreground uppercase"
								>OPERATIONAL_STABLE</span
							>
						</div>

						{#if visitorStats.total > 0}
							<div class="flex flex-col gap-1">
								<span
									class="flex items-center gap-2 font-mono text-[8px] font-black tracking-widest text-muted-foreground uppercase"
								>
									<Database class="size-2 text-primary" /> VSTR_ARCHIVE_LOG
								</span>
								<div class="flex justify-between gap-4 font-mono text-[10px] font-black">
									<span>TOTAL: {visitorStats.total.toLocaleString()}</span>
									<span class="text-primary">TODAY: {visitorStats.today.toLocaleString()}</span>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Final Metadata Footer -->
		<div class="relative mt-20 flex flex-col items-center justify-between gap-6 pt-8 md:flex-row">
			<div
				class="pointer-events-none absolute inset-x-0 top-0 h-3 bg-foreground/15"
				style="clip-path: {bottomTearClipPath};"
			></div>

			<div
				class="flex items-center gap-4 font-mono text-[9px] font-black tracking-[0.3em] text-foreground/30 uppercase"
			>
				<Cpu class="size-3" />
				<p>PROTOCOL: MIKEU_PORTFOLIO_V5.0</p>
			</div>

			<p class="font-mono text-[10px] font-black tracking-widest text-foreground/40 uppercase">
				&copy; {new Date().getFullYear()} MIKEU_DEV // ALL_RIGHTS_RESERVED.
			</p>

			<div
				class="flex items-center gap-2 font-mono text-[9px] font-black tracking-widest text-primary uppercase"
			>
				<div class="size-1.5 animate-pulse bg-primary"></div>
				SERVER_ID: ID_JKT_01
			</div>
		</div>
	</div>
</footer>

<style lang="postcss">
	@reference "tailwindcss";

	.social-box {
		transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
	}
</style>
