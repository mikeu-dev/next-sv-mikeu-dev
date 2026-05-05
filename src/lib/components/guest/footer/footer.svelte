<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import Icon from '$lib/components/ui/icon.svelte';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { Database, Activity, Cpu } from '@lucide/svelte';

	let { socials = [], visitorStats = { total: 0, today: 0 } } = $props();

	let footerElement = $state<HTMLElement>();

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

<footer 
	bind:this={footerElement}
	class="relative overflow-hidden border-t-2 border-foreground bg-background py-12"
>
	<!-- Grain Texture Overlay -->
	<div
		class="pointer-events-none absolute inset-0 z-50 opacity-[0.03] mix-blend-overlay contrast-150 grayscale"
		style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
	></div>

	<div class="container relative mx-auto px-6">
		<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
			
			<!-- Branding & Nav -->
			<div class="footer-stagger flex flex-col gap-8">
				<div class="flex items-center gap-3">
					<div class="size-10 bg-primary flex items-center justify-center font-black text-black text-xl" style="clip-path: polygon(10% 0, 100% 15%, 90% 100%, 0 85%);">
						M
					</div>
					<h3 class="font-poppins text-2xl font-black tracking-tighter uppercase">
						Mikeu<span class="text-primary">.</span>Dev
					</h3>
				</div>

				<div class="flex flex-col gap-4">
					<p class="font-mono text-xs font-black text-muted-foreground uppercase tracking-widest leading-loose max-w-md">
						[ARCHIVE_SYSTEM_V2.0] // BUILT_WITH_PRECISION // CRAFTED_IN_INDONESIA.
						EVERY_PIXEL_MATTERS. EVERY_LINE_COUNTS.
					</p>
					
					<nav class="flex flex-wrap gap-x-8 gap-y-2 font-mono text-[10px] font-black uppercase tracking-[0.2em]">
						<a href="/privacy-policy" class="group relative transition-colors hover:text-primary">
							Privacy_Policy
							<span class="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full"></span>
						</a>
						<a href="/terms-of-service" class="group relative transition-colors hover:text-primary">
							Terms_Of_Service
							<span class="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full"></span>
						</a>
						<a href="/disclaimer" class="group relative transition-colors hover:text-primary">
							Disclaimer
							<span class="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full"></span>
						</a>
					</nav>
				</div>
			</div>

			<!-- Socials & Stats -->
			<div class="footer-stagger flex flex-col items-start gap-8 lg:items-end">
				
				<!-- Social Grid -->
				<div class="flex flex-wrap gap-4">
					{#each socials as link (link.href)}
						<Tooltip.Provider>
							<Tooltip.Root>
								<Tooltip.Trigger>
									<a
										href={link.href}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={link.label}
										class="social-box group relative flex size-12 items-center justify-center border-2 border-foreground transition-all hover:bg-primary hover:text-primary-foreground"
										style="clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);"
									>
										<Icon
											iconName={link.iconName}
											src={link.icon}
											size={20}
										/>
										<!-- Glitch Shard Effect -->
										<div class="pointer-events-none absolute inset-0 -z-10 translate-x-1 translate-y-1 bg-primary opacity-0 transition-transform group-hover:opacity-20"></div>
									</a>
								</Tooltip.Trigger>
								<Tooltip.Content>
									<p class="font-mono text-[9px] font-black uppercase tracking-widest">{link.label}</p>
								</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>
					{/each}
				</div>

				<!-- Diagnostic Stats -->
				<div class="w-full lg:w-auto">
					<div class="grid grid-cols-2 gap-4 border-2 border-foreground/10 bg-foreground/[0.02] p-4 lg:grid-cols-1 lg:min-w-64">
						<div class="flex flex-col gap-1">
							<span class="font-mono text-[8px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
								<Activity class="size-2 text-primary" /> SYSTEM_STATUS
							</span>
							<span class="font-mono text-[10px] font-black text-foreground uppercase tracking-wider">OPERATIONAL_STABLE</span>
						</div>
						
						{#if visitorStats.total > 0}
							<div class="flex flex-col gap-1">
								<span class="font-mono text-[8px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
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
		<div class="mt-20 flex flex-col items-center justify-between border-t-2 border-foreground/10 pt-8 gap-6 md:flex-row">
			<div class="flex items-center gap-4 font-mono text-[9px] font-black tracking-[0.3em] text-foreground/30 uppercase">
				<Cpu class="size-3" />
				<p>PROTOCOL: MIKEU_PORTFOLIO_V5.0</p>
			</div>
			
			<p class="font-mono text-[10px] font-black text-foreground/40 uppercase tracking-widest">
				&copy; {new Date().getFullYear()} MIKEU_DEV // ALL_RIGHTS_RESERVED.
			</p>

			<div class="flex items-center gap-2 font-mono text-[9px] font-black text-primary uppercase tracking-widest">
				<div class="size-1.5 animate-pulse bg-primary"></div>
				SERVER_ID: ID_JKT_01
			</div>
		</div>
	</div>
</footer>

<style lang="postcss">
	@reference "tailwindcss";

	.social-box {
		transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
	}

	.social-box:hover {
		transform: translate(-4px, -4px);
		box-shadow: 6px 6px 0 var(--foreground);
	}
</style>

