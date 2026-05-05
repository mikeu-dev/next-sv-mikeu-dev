<script lang="ts">
	import Button from '@/lib/components/ui/button/button.svelte';
	import { applyAction, enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { m } from '@/lib/paraglide/messages';
	import { ConfettiCannon } from 'svelte-canvas-confetti';
	import { playConfettiSound } from '$lib/utils/confetti-sound';
	import { onMount, tick } from 'svelte';
	import { gsap } from 'gsap';
	import {
		Mail,
		Github,
		Linkedin,
		Twitter,
		Copy,
		Check,
		MapPin,
		Clock,
		Loader2,
		ArrowRight,
		Hash,
		QrCode,
		Command
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
		// GSAP Origami Reveal
		const tl = gsap.timeline({ defaults: { ease: 'power4.inOut' } });

		// Set initial states for 3D unfold
		gsap.set('.origami-shard', {
			transformPerspective: 1000,
			rotateX: -90,
			opacity: 0
		});

		tl.to('.origami-shard', {
			rotateX: 0,
			opacity: 1,
			duration: 1.5,
			stagger: 0.1,
			clearProps: 'all'
		})
			.from(
				'.brutalist-title',
				{
					x: -200,
					opacity: 0,
					duration: 1,
					ease: 'expo.out'
				},
				'-=1'
			)
			.from(
				'.archive-detail',
				{
					y: 20,
					opacity: 0,
					duration: 0.8,
					stagger: 0.05
				},
				'-=0.5'
			);

		// Mouse interaction for shards (subtle tilt)
		const handleMouseMove = (e: MouseEvent) => {
			const { clientX, clientY } = e;
			const x = (clientX / window.innerWidth - 0.5) * 10;
			const y = (clientY / window.innerHeight - 0.5) * 10;

			gsap.to('.shards-container', {
				rotateY: x,
				rotateX: -y,
				duration: 1,
				ease: 'power2.out'
			});
		};

		window.addEventListener('mousemove', handleMouseMove);

		return () => {
			clearInterval(interval);
			window.removeEventListener('mousemove', handleMouseMove);
		};
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

<!-- Grain & Static Texture Overlay -->
<div
	class="pointer-events-none fixed inset-0 z-50 opacity-[0.04] mix-blend-overlay contrast-150 grayscale"
	style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
></div>

<main class="relative min-h-screen overflow-hidden bg-background p-6 lg:p-12">
	<!-- Vertical Spine Title -->
	<div
		class="brutalist-title pointer-events-none fixed top-0 left-0 hidden h-full w-24 items-center justify-center border-r-2 border-foreground/10 lg:flex"
	>
		<h1
			class="rotate-[-90deg] font-poppins text-8xl font-black tracking-[-0.1em] whitespace-nowrap text-foreground/15 uppercase italic"
		>
			Mikeu // Dev_Archive
		</h1>
	</div>

	<div class="relative mx-auto max-w-7xl lg:pl-32">
		<!-- Header / Technical Specs -->
		<header
			class="mb-12 flex flex-col items-start justify-between gap-8 border-b-2 border-foreground pb-8 sm:flex-row sm:items-end"
		>
			<div class="mt-20 space-y-2">
				<div
					class="archive-detail flex items-center gap-2 font-mono text-[10px] font-black text-primary uppercase"
				>
					<Hash class="size-3" /> [STATUS: READY_FOR_COLLABORATION]
				</div>
				<h2 class="font-poppins text-5xl font-black tracking-tighter text-foreground sm:text-7xl">
					Mikeu<span class="text-primary">.</span>Dev
				</h2>
			</div>
			<div class="archive-detail text-right font-mono text-sm leading-tight font-bold uppercase">
				<p class="text-foreground/80">SECTOR: <span class="text-foreground">FULLSTACK_WEB_GIS</span></p>
				<p class="text-foreground/80">
					BASE_LOC: <span class="text-foreground">IDN // 7.79°S 110.37°E</span>
				</p>
			</div>
		</header>

		<div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
			<!-- Left: Info Shards -->
			<div class="order-2 space-y-4 lg:order-1 lg:col-span-4">
				<!-- Shard 1: Email -->
				<div
					class="origami-shard group relative h-48 bg-foreground p-8 text-background transition-all hover:bg-primary hover:text-primary-foreground"
					style="clip-path: polygon(0 0, 100% 15%, 95% 100%, 0 85%);"
				>
					<div class="flex h-full flex-col justify-between">
						<Mail class="size-8" />
						<div class="space-y-1">
							<p class="font-mono text-[10px] font-black text-background/80 uppercase">
								{m.contact_field_email()}
							</p>
							<p class="text-lg font-black tracking-tight break-all">{PUBLIC_CONTACT_EMAIL}</p>
						</div>
					</div>
					<button
						onclick={copyEmail}
						class="absolute top-8 right-8 opacity-0 transition-opacity group-hover:opacity-100"
					>
						{#if isCopied}
							<Check />
						{:else}
							<Copy />
						{/if}
					</button>
				</div>

				<!-- Shard 2: Location/Time -->
				<div class="grid grid-cols-2 gap-4">
					<div
						class="origami-shard bg-muted p-6 text-foreground"
						style="clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%);"
					>
						<MapPin class="mb-4 size-5 text-primary" />
						<p class="font-mono text-[10px] font-black text-foreground/80 uppercase">Base</p>
						<p class="font-bold">IDN</p>
					</div>
					<div
						class="origami-shard bg-muted p-6 text-foreground"
						style="clip-path: polygon(0 0, 90% 0, 100% 100%, 10% 100%);"
					>
						<Clock class="mb-4 size-5 text-primary" />
						<p class="font-mono text-[10px] font-black text-foreground/80 uppercase">Avg</p>
						<p class="font-bold">&lt; 24H</p>
					</div>
				</div>

				<!-- Shard 3: Social/QR -->
				<div
					class="origami-shard relative flex h-64 flex-col justify-between border-2 border-foreground p-8"
					style="clip-path: polygon(0 15%, 100% 0, 100% 85%, 0 100%);"
				>
					<div class="flex items-center justify-between">
						<QrCode class="size-10" />
						<Command class="size-6 animate-pulse text-primary" />
					</div>
					<div class="flex flex-wrap gap-4">
						{#each [{ icon: Github, href: '#', label: 'github' }, { icon: Linkedin, href: '#', label: 'linkedin' }, { icon: Twitter, href: '#', label: 'twitter' }] as social (social.label)}
							<a
								href={social.href}
								class="flex size-12 items-center justify-center border-2 border-foreground transition-all hover:bg-foreground hover:text-background"
							>
								<social.icon class="size-5" />
							</a>
						{/each}
					</div>
				</div>
			</div>

			<!-- Right: The Deconstructed Form -->
			<div class="order-1 lg:order-2 lg:col-span-8">
				<div class="shards-container space-y-6">
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
						class="space-y-6"
					>
						<!-- Shard: Main Inputs -->
						<div
							class="origami-shard bg-card p-10 shadow-2xl dark:bg-card/50"
							style="clip-path: polygon(0 5%, 95% 0, 100% 95%, 5% 100%);"
						>
							<div class="grid grid-cols-1 gap-12 md:grid-cols-2">
								<div class="group relative">
									<input
										type="text"
										id="name"
										name="name"
										required
										placeholder="[FULL_NAME]"
										class="peer w-full border-b-2 border-foreground bg-transparent py-4 font-poppins text-lg sm:text-xl font-black uppercase tracking-tighter outline-none placeholder:text-foreground/80 focus:border-primary"
									/>
									<label
										for="name"
										class="pointer-events-none absolute -top-6 left-0 font-mono text-xs font-black tracking-widest text-foreground/80 uppercase"
									>
										01 // {m.contact_field_name()}
									</label>
								</div>
								<div class="group relative">
									<input
										type="email"
										id="email"
										name="email"
										required
										placeholder="[EMAIL_ADDRESS]"
										class="peer w-full border-b-2 border-foreground bg-transparent py-4 font-poppins text-lg sm:text-xl font-black uppercase tracking-tighter outline-none placeholder:text-foreground/80 focus:border-primary"
									/>
									<label
										for="email"
										class="pointer-events-none absolute -top-6 left-0 font-mono text-xs font-black tracking-widest text-foreground/80 uppercase"
									>
										02 // {m.contact_field_email()}
									</label>
								</div>
							</div>
						</div>

						<!-- Shard: Message -->
						<div
							class="origami-shard bg-card p-10 shadow-2xl dark:bg-card/50"
							style="clip-path: polygon(5% 0, 100% 5%, 95% 100%, 0 95%);"
						>
							<div class="group relative">
								<textarea
									id="message"
									name="message"
									required
									rows="4"
									placeholder="[WRITE_MESSAGE_HERE...]"
									class="peer w-full border-b-2 border-foreground bg-transparent py-4 font-poppins text-lg sm:text-xl font-black uppercase tracking-tighter outline-none placeholder:text-foreground/80 focus:border-primary"
								></textarea>
								<label
									for="message"
									class="pointer-events-none absolute -top-6 left-0 font-mono text-xs font-black tracking-widest text-foreground/80 uppercase"
								>
									03 // {m.contact_field_message()}
								</label>
							</div>
						</div>

						<!-- Shard: Submit -->
						<div class="flex justify-end">
							<Button
								type="submit"
								disabled={isSubmitting}
								class="origami-shard relative h-24 w-full bg-primary p-0 text-primary-foreground sm:w-80"
								style="clip-path: polygon(0 0, 100% 20%, 90% 100%, 10% 80%);"
							>
								<div class="flex items-center justify-center gap-4 px-12">
									{#if isSubmitting}
										<Loader2 class="size-6 animate-spin" />
										<span class="font-poppins text-2xl font-black tracking-tighter uppercase"
											>Archiving...</span
										>
									{:else}
										<span class="font-poppins text-3xl font-black tracking-tighter uppercase"
											>{m.contact_page_button()}</span
										>
										<ArrowRight class="size-8" />
									{/if}
								</div>
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>

		<!-- Footer technicality -->
		<footer
			class="mt-12 flex items-center justify-between border-t-2 border-foreground/10 pt-8 font-mono text-[10px] font-black tracking-widest text-foreground/80 uppercase"
		>
			<p>© MIKEU_DEV_PROTOCOL_2026</p>
			<p>STACK: SVELTEKIT_VITE_TS</p>
		</footer>
	</div>
</main>

<style lang="postcss">
	@reference "tailwindcss";

	:global(body) {
		background-color: var(--background);
		color: var(--foreground);
		overflow-x: hidden;
		cursor: crosshair;
	}

	.shards-container {
		transform-style: preserve-3d;
	}

	.origami-shard {
		transition:
			transform 0.5s cubic-bezier(0.23, 1, 0.32, 1),
			background-color 0.3s ease;
	}

	.origami-shard:hover {
		transform: scale(1.02) translateZ(20px);
	}

	input::placeholder,
	textarea::placeholder {
		opacity: 1 !important;
	}

	@media (max-width: 1024px) {
		.origami-shard {
			clip-path: none !important;
			border-radius: 4px;
		}
	}
</style>
