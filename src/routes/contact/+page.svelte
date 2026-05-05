<script lang="ts">
	import Button from '@/lib/components/ui/button/button.svelte';
	import Input from '@/lib/components/ui/input/input.svelte';
	import Label from '@/lib/components/ui/label/label.svelte';
	import Textarea from '@/lib/components/ui/textarea/textarea.svelte';
	import { applyAction, enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { m } from '@/lib/paraglide/messages';
	import { ConfettiCannon } from 'svelte-canvas-confetti';
	import { playConfettiSound } from '$lib/utils/confetti-sound';
	import { onMount, tick } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import {
		Mail,
		Github,
		Linkedin,
		Twitter,
		ArrowRight,
		Copy,
		Check,
		MapPin,
		Clock,
		Send,
		Loader2,
		User,
		Building2,
		CircleDollarSign,
		MessageSquare
	} from '@lucide/svelte';
	import { PUBLIC_CONTACT_EMAIL } from '$env/static/public';

	type ActionData = {
		success: boolean;
		message: string;
	};

	let confettiCannon = $state(false);
	let isSubmitting = $state(false);
	let isCopied = $state(false);

	const triggerConfetti = async () => {
		confettiCannon = false;
		await tick();
		confettiCannon = true;
		playConfettiSound();
	};

	const copyEmail = async () => {
		try {
			await navigator.clipboard.writeText(PUBLIC_CONTACT_EMAIL);
			isCopied = true;
			toast.success(m.blog_link_copied());
			setTimeout(() => (isCopied = false), 2000);
		} catch {
			toast.error('Failed to copy email');
		}
	};

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		const tl = gsap.timeline();

		// Background blobs animation
		gsap.to('.bg-blob', {
			x: 'random(-50, 50)',
			y: 'random(-50, 50)',
			duration: 10,
			repeat: -1,
			yoyo: true,
			ease: 'none',
			stagger: 2
		});

		tl.from('.contact-reveal', {
			y: 60,
			opacity: 0,
			duration: 1,
			stagger: 0.15,
			ease: 'power4.out'
		}).from(
			'.form-card-container',
			{
				scale: 0.9,
				opacity: 0,
				duration: 1.2,
				ease: 'back.out(1.7)'
			},
			'-=0.8'
		);

		// Morphing blob animation for the abstract card
		gsap.to('.organic-shape', {
			borderRadius: '40% 60% 70% 30% / 40% 40% 60% 50%',
			duration: 8,
			repeat: -1,
			yoyo: true,
			ease: 'sine.inOut'
		});
	});
</script>

{#if confettiCannon}
	<ConfettiCannon
		origin={[window.innerWidth / 2, window.innerHeight]}
		angle={-90}
		spread={35}
		force={35}
	/>
{/if}

<!-- Noise Overlay -->
<div
	class="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-overlay grayscale invert dark:invert-0"
	style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
></div>

<div class="relative mx-auto mt-32 max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
	<!-- Decorative Background Blobs -->
	<div
		class="bg-blob absolute -top-24 -left-24 z-0 h-96 w-96 rounded-full bg-primary/10 blur-[120px]"
	></div>
	<div
		class="bg-blob absolute -bottom-24 -right-24 z-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]"
	></div>

	<div class="relative z-10 grid grid-cols-1 gap-16 lg:grid-cols-2">
		<!-- Left Column: Info -->
		<div class="space-y-12">
			<section class="space-y-6">
				<div class="contact-reveal inline-flex items-center gap-3">
					<div class="h-1 w-8 rounded-full bg-primary"></div>
					<span class="text-xs font-black tracking-[0.4em] text-primary uppercase"
						>{m.hero_title()}</span
					>
				</div>
				<h1
					class="contact-reveal font-poppins text-6xl font-black tracking-tighter italic md:text-8xl"
				>
					{m.contact_page_title()}<span class="text-primary">.</span>
				</h1>
				<p
					class="contact-reveal max-w-lg font-poppins text-xl leading-relaxed text-muted-foreground/80"
				>
					{m.contact_page_subtitle()}
				</p>
			</section>

			<div class="contact-reveal space-y-8">
				<!-- Contact Details -->
				<div class="group relative overflow-hidden rounded-3xl border bg-card/50 p-6 backdrop-blur-xl">
					<div class="flex items-start gap-6">
						<div
							class="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-500 group-hover:scale-110"
						>
							<Mail class="size-7" />
						</div>
						<div class="flex-1 space-y-1">
							<p class="text-xs font-black tracking-widest text-muted-foreground uppercase">
								{m.contact_field_email()}
							</p>
							<p class="text-xl font-bold">{PUBLIC_CONTACT_EMAIL}</p>
							<button
								onclick={copyEmail}
								class="mt-2 flex items-center gap-2 text-sm font-bold text-primary hover:underline"
							>
								{#if isCopied}
									<Check class="size-4" />
									Copied!
								{:else}
									<Copy class="size-4" />
									Copy email address
								{/if}
							</button>
						</div>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="rounded-3xl border bg-card/50 p-6 backdrop-blur-xl">
						<div class="flex items-center gap-4">
							<div class="flex size-10 items-center justify-center rounded-xl bg-orange-500/10">
								<MapPin class="size-5 text-orange-500" />
							</div>
							<div>
								<p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
									Location
								</p>
								<p class="font-bold">Indonesia</p>
							</div>
						</div>
					</div>
					<div class="rounded-3xl border bg-card/50 p-6 backdrop-blur-xl">
						<div class="flex items-center gap-4">
							<div class="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10">
								<Clock class="size-5 text-emerald-500" />
							</div>
							<div>
								<p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
									Response Time
								</p>
								<p class="font-bold">&lt; 24 Hours</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Social Links -->
			<div class="contact-reveal space-y-4">
				<p class="text-xs font-black tracking-[0.3em] text-muted-foreground uppercase">
					Connect with me
				</p>
				<div class="flex flex-wrap gap-4">
					{#each [{ icon: Github, href: 'https://github.com/mikeu-dev', label: 'GitHub' }, { icon: Linkedin, href: '#', label: 'LinkedIn' }, { icon: Twitter, href: '#', label: 'Twitter' }] as social}
						<a
							href={social.href}
							target="_blank"
							rel="noopener noreferrer"
							class="flex size-14 items-center justify-center rounded-2xl border bg-card/50 text-muted-foreground backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:bg-primary/5 hover:text-primary"
							aria-label={social.label}
						>
							<social.icon class="size-6" />
						</a>
					{/each}
				</div>
			</div>
		</div>

		<!-- Right Column: Abstract Organic Form Card -->
		<div class="form-card-container relative flex items-center justify-center p-4">
			<!-- Animated Background Blobs Behind Card -->
			<div class="absolute -top-10 -right-10 z-0 h-40 w-40 animate-pulse rounded-full bg-primary/20 blur-2xl"></div>
			<div class="absolute -bottom-10 -left-10 z-0 h-40 w-40 animate-pulse rounded-full bg-blue-500/20 blur-2xl" style="animation-delay: 1s"></div>

			<!-- The Abstract Organic Container -->
			<div
				class="organic-shape relative z-10 w-full overflow-hidden border border-white/20 bg-white/30 p-10 shadow-2xl backdrop-blur-3xl transition-all duration-700 hover:shadow-primary/10 dark:border-white/5 dark:bg-black/30 md:p-14"
				style="border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;"
			>
				<div class="mb-10 space-y-2">
					<h3 class="font-poppins text-3xl font-black italic tracking-tight uppercase">
						Get <span class="text-primary">Synced</span>
					</h3>
					<p class="text-[10px] font-mono font-medium tracking-tight text-muted-foreground">
						// PROTOCOL: DIRECT_LINK_STABLISHED
					</p>
				</div>

				<form
					method="POST"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ result }) => {
							isSubmitting = false;
							if (result.type === 'success') {
								const data = result.data as ActionData;
								toast.success(data.message ?? m.contact_form_success());
								await triggerConfetti();
							} else if (result.type === 'failure') {
								const data = result.data as ActionData;
								toast.error(data.message ?? m.contact_form_failure());
							}
							await applyAction(result);
						};
					}}
					class="space-y-10"
				>
					<!-- Name Field -->
					<div class="group relative">
						<div class="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 transition-all duration-300 group-focus-within:left-0 group-focus-within:opacity-100">
							<User class="size-5 text-primary" />
						</div>
						<input
							type="text"
							id="name"
							name="name"
							required
							placeholder=" "
							class="peer w-full border-b-2 border-muted bg-transparent py-2 pl-0 transition-all focus:border-primary focus:outline-none"
						/>
						<label
							for="name"
							class="pointer-events-none absolute top-2 left-0 font-mono text-xs font-black tracking-widest text-muted-foreground uppercase transition-all peer-focus:-top-6 peer-focus:text-[10px] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-[10px]"
						>
							{m.contact_field_name()}
						</label>
						<div class="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-500 group-focus-within:w-full"></div>
					</div>

					<!-- Email Field -->
					<div class="group relative">
						<div class="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 transition-all duration-300 group-focus-within:left-0 group-focus-within:opacity-100">
							<Mail class="size-5 text-primary" />
						</div>
						<input
							type="email"
							id="email"
							name="email"
							required
							placeholder=" "
							class="peer w-full border-b-2 border-muted bg-transparent py-2 pl-0 transition-all focus:border-primary focus:outline-none"
						/>
						<label
							for="email"
							class="pointer-events-none absolute top-2 left-0 font-mono text-xs font-black tracking-widest text-muted-foreground uppercase transition-all peer-focus:-top-6 peer-focus:text-[10px] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-[10px]"
						>
							{m.contact_field_email()}
						</label>
						<div class="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-500 group-focus-within:w-full"></div>
					</div>

					<!-- Message Field -->
					<div class="group relative">
						<div class="absolute -left-8 top-6 opacity-0 transition-all duration-300 group-focus-within:left-0 group-focus-within:opacity-100">
							<MessageSquare class="size-5 text-primary" />
						</div>
						<textarea
							id="message"
							name="message"
							required
							rows="3"
							placeholder=" "
							class="peer w-full border-b-2 border-muted bg-transparent py-2 pl-0 transition-all focus:border-primary focus:outline-none"
						></textarea>
						<label
							for="message"
							class="pointer-events-none absolute top-2 left-0 font-mono text-xs font-black tracking-widest text-muted-foreground uppercase transition-all peer-focus:-top-6 peer-focus:text-[10px] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-6 peer-[:not(:placeholder-shown)]:text-[10px]"
						>
							{m.contact_field_message()}
						</label>
						<div class="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-500 group-focus-within:w-full"></div>
					</div>

					<Button
						type="submit"
						disabled={isSubmitting}
						class="relative h-16 w-full overflow-hidden rounded-2xl bg-zinc-900 text-lg font-black tracking-widest uppercase transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-zinc-100"
					>
						<div class="relative z-10 flex items-center justify-center gap-3">
							{#if isSubmitting}
								<Loader2 class="size-5 animate-spin" />
								Syncing...
							{:else}
								{m.contact_page_button()}
								<Send class="size-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
							{/if}
						</div>
					</Button>
				</form>
			</div>

			<!-- Abstract SVG Accents -->
			<svg class="absolute inset-0 z-0 h-full w-full opacity-20" viewBox="0 0 100 100">
				<defs>
					<linearGradient id="blob-grad" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:var(--color-primary);stop-opacity:0.2" />
						<stop offset="100%" style="stop-color:var(--color-blue-500);stop-opacity:0.2" />
					</linearGradient>
				</defs>
				<circle cx="10" cy="10" r="15" fill="url(#blob-grad)" class="animate-pulse" />
				<circle cx="90" cy="90" r="20" fill="url(#blob-grad)" class="animate-pulse" style="animation-delay: 2s" />
			</svg>
		</div>
	</div>
</div>

<style>
	@reference "tailwindcss";

	:global(body) {
		overflow-x: hidden;
	}

	.organic-shape {
		will-change: border-radius, transform;
		box-shadow: 0 25px 50px -12px rgba(var(--color-primary), 0.1);
	}

	form input,
	form textarea {
		@apply transition-all duration-500 ease-in-out;
	}

	form input:focus,
	form textarea:focus {
		@apply pl-8;
	}

	/* Custom focus ring removal since we use underlined style */
	form input:focus-visible,
	form textarea:focus-visible {
		outline: none;
	}
</style>
