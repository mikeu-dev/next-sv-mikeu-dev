<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { ArrowRight, Hash, Command, Mail } from '@lucide/svelte';
	import { m } from '@/lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';

	let contactSection = $state<HTMLElement>();
	let shardsContainer = $state<HTMLElement>();

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: contactSection,
				start: 'top 80%',
				toggleActions: 'play none none none'
			}
		});

		// Origami Reveal Animation
		tl.from('.origami-bg-shard', {
			rotateX: -90,
			opacity: 0,
			duration: 1.2,
			stagger: 0.1,
			ease: 'power4.out'
		})
			.from(
				'.contact-content',
				{
					y: 100,
					opacity: 0,
					duration: 1,
					ease: 'expo.out'
				},
				'-=0.8'
			)
			.from(
				'.technical-label',
				{
					x: -20,
					opacity: 0,
					duration: 0.5,
					stagger: 0.1
				},
				'-=0.5'
			);

		// Mouse Interaction (Parallax)
		const handleMouseMove = (e: MouseEvent) => {
			if (!shardsContainer) return;
			const { clientX, clientY } = e;
			const x = (clientX / window.innerWidth - 0.5) * 15;
			const y = (clientY / window.innerHeight - 0.5) * 15;

			gsap.to('.shards-wrapper', {
				rotateY: x,
				rotateX: -y,
				duration: 1.5,
				ease: 'power2.out'
			});
		};

		window.addEventListener('mousemove', handleMouseMove);
		return () => window.removeEventListener('mousemove', handleMouseMove);
	});
</script>

<section
	bind:this={contactSection}
	id="contact"
	class="relative z-10 overflow-hidden bg-background py-24 md:py-32"
>
	<!-- Grain Texture Overlay -->
	<div
		class="pointer-events-none absolute inset-0 z-50 opacity-[0.03] mix-blend-overlay contrast-150 grayscale"
		style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
	></div>

	<div class="relative container mx-auto px-6">
		<div bind:this={shardsContainer} class="shards-wrapper relative flex flex-col items-center">
			<!-- Decorative Shards -->
			<div
				class="origami-bg-shard absolute -top-12 -left-12 size-64 bg-primary/5 dark:bg-primary/10"
				style="clip-path: polygon(0% 15%, 100% 0%, 85% 100%, 15% 85%);"
			></div>
			<div
				class="origami-bg-shard absolute -right-12 -bottom-12 size-80 bg-foreground/5"
				style="clip-path: polygon(15% 0%, 100% 15%, 85% 85%, 0% 100%);"
			></div>

			<!-- Technical Labels -->
			<div
				class="mb-12 flex w-full flex-wrap items-center justify-between gap-4 border-b-2 border-foreground pb-6"
			>
				<div
					class="technical-label flex items-center gap-2 font-mono text-[10px] font-black text-primary uppercase"
				>
					<Hash class="size-3" /> PROTOCOL: CONTACT_INIT_V2
				</div>
				<div
					class="technical-label flex items-center gap-2 font-mono text-[10px] font-black text-foreground/50 uppercase"
				>
					<Command class="size-3 animate-pulse" /> [READY_FOR_DEPLOYMENT]
				</div>
			</div>

			<!-- Main Content -->
			<div class="contact-content relative z-10 text-center">
				<div
					class="mb-6 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-4 py-1.5 font-mono text-[10px] font-bold tracking-widest text-foreground/80 uppercase"
				>
					<Mail class="size-3 text-primary" />
					{m.contact_field_email()}
				</div>

				<h2 class="mb-8 font-poppins text-5xl font-black tracking-tighter sm:text-7xl lg:text-8xl">
					{m.contact_title()}<span class="text-primary">.</span>
				</h2>

				<p
					class="mx-auto mb-16 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground uppercase sm:text-base"
				>
					{m.contact_subtitle_first_part()}
					<span class="mt-2 block font-bold text-foreground">
						{m.contact_subtitle_second_part()}
					</span>
				</p>

				<a
					href={localizeHref('/contact')}
					class="group relative inline-flex h-24 w-full items-center justify-center overflow-hidden bg-primary px-12 text-primary-foreground sm:w-80"
					style="clip-path: polygon(0% 0%, 100% 15%, 90% 100%, 10% 85%);"
				>
					<!-- Button Hover Effect -->
					<div
						class="absolute inset-0 bg-foreground opacity-0 transition-opacity group-hover:opacity-10"
					></div>

					<div class="flex items-center gap-4">
						<span class="font-poppins text-2xl font-black tracking-tighter uppercase">
							{m.contact_button()}
						</span>
						<ArrowRight
							class="size-8 transition-transform duration-300 group-hover:translate-x-2"
						/>
					</div>
				</a>
			</div>

			<!-- Technical Footer -->
			<div class="mt-16 w-full border-t-2 border-foreground/10 pt-6">
				<div
					class="flex justify-between font-mono text-[8px] font-black tracking-[0.2em] text-foreground/40 uppercase"
				>
					<span>© MIKEU_DEV // 2026</span>
					<span class="hidden sm:block">ENCRYPTED_COMMS // SECURED</span>
					<span>STATUS: ACTIVE</span>
				</div>
			</div>
		</div>
	</div>
</section>

<style lang="postcss">
	@reference "tailwindcss";

	#contact {
		perspective: 1000px;
	}

	.shards-wrapper {
		transform-style: preserve-3d;
	}

	.contact-content {
		transform: translateZ(50px);
	}

	.origami-bg-shard {
		transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
		pointer-events: none;
	}

	/* Disable clip-path on very small screens if it causes issues, but modern browsers handle it well */
	@media (max-width: 640px) {
		.origami-bg-shard {
			opacity: 0.1;
		}
	}
</style>
