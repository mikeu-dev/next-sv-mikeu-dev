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
		Loader2
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
			'.form-card',
			{
				x: 40,
				opacity: 0,
				duration: 1,
				ease: 'power3.out'
			},
			'-=0.8'
		);
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

		<!-- Right Column: Form Card -->
		<div class="form-card relative">
			<div class="absolute -inset-4 z-0 rounded-[3rem] bg-primary/5 blur-2xl"></div>
			<div
				class="relative z-10 overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/40 p-8 shadow-2xl backdrop-blur-2xl dark:bg-black/40"
			>
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
					class="space-y-8"
				>
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<div class="space-y-2">
							<Label for="name" class="text-xs font-black tracking-widest uppercase opacity-60"
								>{m.contact_field_name()}</Label
							>
							<Input
								type="text"
								id="name"
								name="name"
								placeholder={m.contact_field_placeholder({ name: m.contact_field_name() })}
								class="h-14 rounded-2xl border-white/20 bg-white/20 px-4 transition-all focus:bg-white/40 dark:bg-black/20 dark:focus:bg-black/40"
								required
							/>
						</div>
						<div class="space-y-2">
							<Label for="email" class="text-xs font-black tracking-widest uppercase opacity-60"
								>{m.contact_field_email()}</Label
							>
							<Input
								type="email"
								id="email"
								name="email"
								placeholder={m.contact_field_placeholder({ name: m.contact_field_email() })}
								class="h-14 rounded-2xl border-white/20 bg-white/20 px-4 transition-all focus:bg-white/40 dark:bg-black/20 dark:focus:bg-black/40"
								required
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<div class="space-y-2">
							<Label for="company" class="text-xs font-black tracking-widest uppercase opacity-60"
								>{m.contact_field_company()}</Label
							>
							<Input
								type="text"
								id="company"
								name="company"
								placeholder={m.contact_field_company_placeholder()}
								class="h-14 rounded-2xl border-white/20 bg-white/20 px-4 transition-all focus:bg-white/40 dark:bg-black/20 dark:focus:bg-black/40"
							/>
						</div>
						<div class="space-y-2">
							<Label for="budget" class="text-xs font-black tracking-widest uppercase opacity-60"
								>{m.contact_field_budget()}</Label
							>
							<Input
								type="text"
								id="budget"
								name="budget"
								placeholder={m.contact_field_budget_placeholder()}
								class="h-14 rounded-2xl border-white/20 bg-white/20 px-4 transition-all focus:bg-white/40 dark:bg-black/20 dark:focus:bg-black/40"
							/>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="message" class="text-xs font-black tracking-widest uppercase opacity-60"
							>{m.contact_field_message()}</Label
						>
						<Textarea
							id="message"
							name="message"
							rows={5}
							placeholder={m.contact_field_placeholder({ name: m.contact_field_message() })}
							class="resize-none rounded-2xl border-white/20 bg-white/20 px-4 py-3 transition-all focus:bg-white/40 dark:bg-black/20 dark:focus:bg-black/40"
							required
						/>
					</div>

					<Button
						type="submit"
						disabled={isSubmitting}
						class="h-16 w-full rounded-2xl text-lg font-black tracking-widest uppercase shadow-2xl shadow-primary/40 transition-transform active:scale-[0.98]"
					>
						{#if isSubmitting}
							<Loader2 class="mr-2 size-5 animate-spin" />
							Sending...
						{:else}
							{m.contact_page_button()}
							<Send class="ml-2 size-5" />
						{/if}
					</Button>
				</form>
			</div>
		</div>
	</div>
</div>

<style>
	@reference "tailwindcss";

	:global(body) {
		overflow-x: hidden;
	}

	.bg-blob {
		will-change: transform;
	}

	form :global(input),
	form :global(textarea) {
		@apply transition-all duration-300;
	}

	form :global(input:focus),
	form :global(textarea:focus) {
		@apply scale-[1.01] shadow-xl;
	}
</style>
