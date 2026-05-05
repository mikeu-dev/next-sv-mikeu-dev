<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Select from '$lib/components/ui/select';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	import { page } from '$app/state';
	import { auth } from '$lib/firebase/firebase.client';
	import { toast } from 'svelte-sonner';
	import { base } from '$app/paths';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import Id from 'svelte-flags/Id.svelte';
	import GbNir from 'svelte-flags/GbNir.svelte';
	import { resetMode, setMode } from 'mode-watcher';
	import { signOut } from 'firebase/auth';
	import { authState } from '$lib/stores/auth.svelte';
	import InstallButton from '../pwa/InstallButton.svelte';
	import { fade } from 'svelte/transition';
	import { getLocale, setLocale } from '../../../paraglide/runtime';
	import { setupGsapPendulum } from './navbar.svelte.js';
	import { ConfettiCannon } from 'svelte-canvas-confetti';
	import { playConfettiSound } from '$lib/utils/confetti-sound';
	import { onMount, tick } from 'svelte';
	import { navLinks } from '@/lib/config/navlinks';
	import { m } from '@/lib/paraglide/messages';
	import { Terminal, Command, Hash, Menu, X, ArrowUpRight } from '@lucide/svelte';

	let { resolvedResumeUrls = { en: '', id: '' } } = $props<{
		resolvedResumeUrls?: { en: string; id: string };
	}>();
	
	// --- State Management (Runes API) ---
	let locale = $state(getLocale());
	let isMobileMenuOpen = $state(false);

	let navLinksData = $derived(navLinks[locale] || navLinks['en']);
	let fallbackResumeUrl = $derived(
		`https://raw.githubusercontent.com/mikeu-dev/portfolio-assets/main/docs/cv/riki-ruswandi-resume-(${locale}).pdf`
	);
	let resumeUrl = $derived(
		(locale === 'id' ? resolvedResumeUrls.id : resolvedResumeUrls.en) || fallbackResumeUrl
	);

	let anchorElement: HTMLAnchorElement;
	let headerElement: HTMLElement;
	let devSpan: HTMLElement;
	
	// Scroll Behavior
	let lastScrollTop = 0;
	let hideHeader = $state(false);
	let scrollTimeout: ReturnType<typeof setTimeout>;

	onMount(() => {
		const handleScroll = () => {
			const currentScroll = window.scrollY;

			if (currentScroll > lastScrollTop && currentScroll > 50) {
				hideHeader = true;
			} else {
				hideHeader = false;
			}
			lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;

			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(() => {
				hideHeader = false;
			}, 150);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});

	let confettiCannon = $state(false);

	const makeConfettiCannon = async () => {
		confettiCannon = false;
		await tick();
		confettiCannon = true;
		playConfettiSound();
	};


	// --- Reactive Locale Sync ---
	$effect(() => {
		if (locale) setLocale(locale);
	});

	// --- Matter.js Setup (Lifecycle Safe) ---
	$effect(() => {
		if (anchorElement && headerElement && devSpan) {
			const cleanup = setupGsapPendulum(anchorElement, headerElement, devSpan);
			return cleanup;
		}
	});

	// --- Computed / Derived State ---
	let isLoggedIn = $derived(Boolean(authState.user));
	let currentPath = $derived(page.url.pathname || '');

	// --- UI Interaction Handlers ---
	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	async function handleSignOut() {
		try {
			await signOut(auth);
			const res = await fetch('/api/auth', { method: 'DELETE' });
			if (res.ok) {
				toast.success('Signed out successfully');
				window.location.reload();
			} else toast.error('Sign out failed');
		} catch (e: unknown) {
			console.error('Sign out error:', e);
			toast.error('An error occurred during sign out.');
		}
	}
</script>

{#if confettiCannon}
	<ConfettiCannon
		origin={[window.innerWidth / 2, window.innerHeight]}
		angle={-90}
		spread={35}
		force={35}
	/>
{/if}

<header
	bind:this={headerElement}
	class="fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-out"
	class:translate-y-[-100%]={hideHeader}
>
	<!-- Main Nav Container -->
	<nav
		class="relative z-10 border-b-2 border-foreground bg-background/80 px-6 py-4 backdrop-blur-xl lg:px-12"
	>
		<!-- Grain Texture Overlay (Subtle) -->
		<div
			class="pointer-events-none absolute inset-0 z-[-1] opacity-[0.02] mix-blend-overlay grayscale"
			style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
		></div>

		<div class="mx-auto flex max-w-screen-2xl items-center justify-between">
			<!-- Branding (Pendulum Maintained) -->
			<a
				href="{base}/"
				bind:this={anchorElement}
				class="group relative flex items-center gap-3"
			>
				<div class="relative size-10 overflow-hidden border-2 border-foreground" style="clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);">
					<Avatar.Root class="size-full rounded-none!">
						<Avatar.Image src="https://github.com/mikeu-dev.png" alt="@mikeu-dev" class="rounded-none!" />
						<Avatar.Fallback class="rounded-none!">RR</Avatar.Fallback>
					</Avatar.Root>
				</div>
				
				<div class="flex flex-col">
					<span class="font-poppins text-lg font-black tracking-tighter uppercase leading-none">
						Mikeu<span class="text-primary">.</span>
					</span>
					<span
						bind:this={devSpan}
						class="mt-1 inline-block origin-bottom-right bg-primary px-3 py-0.5 font-mono text-[10px] font-black text-primary-foreground uppercase tracking-widest"
						style="clip-path: polygon(5% 0, 100% 0, 95% 100%, 0 100%);"
					>
						Dev
						<span class="absolute right-0.5 bottom-0.5 size-1 rounded-full bg-white"></span>
					</span>
				</div>
			</a>

			<!-- Desktop Navigation Links -->
			<div class="hidden items-center gap-8 md:flex">
				{#each navLinksData as link (link.href)}
					<a
						href={`${base}${link.href}`}
						class="group relative font-mono text-[10px] font-black uppercase tracking-[0.2em] transition-colors hover:text-primary"
						class:text-primary={currentPath === link.href}
						class:text-foreground={currentPath !== link.href}
					>
						{link.label}
						<span class="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" class:w-full={currentPath === link.href}></span>
					</a>
				{/each}
			</div>

			<!-- Controls -->
			<div class="hidden items-center gap-4 md:flex">
				<!-- Theme Selector (Sharp) -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						class="size-10 border-2 border-foreground bg-background transition-all hover:bg-foreground hover:text-background"
						style="clip-path: polygon(15% 0, 100% 0, 85% 100%, 0 100%);"
					>
						<div class="flex items-center justify-center">
							<SunIcon class="size-4 scale-100 dark:scale-0 transition-transform" />
							<MoonIcon class="absolute size-4 scale-0 dark:scale-100 transition-transform" />
						</div>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end" class="rounded-none! border-2 border-foreground font-mono text-[10px] font-black uppercase tracking-widest">
						<DropdownMenu.Item onclick={() => setMode('light')} class="cursor-pointer hover:bg-primary! hover:text-primary-foreground!">Light</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => setMode('dark')} class="cursor-pointer hover:bg-primary! hover:text-primary-foreground!">Dark</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => resetMode()} class="cursor-pointer hover:bg-primary! hover:text-primary-foreground!">System</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>

				<!-- Locale Selector (Sharp) -->
				<Select.Root type="single" bind:value={locale}>
					<Select.Trigger class="h-10 w-24 border-2 border-foreground bg-background font-mono text-[10px] font-black uppercase tracking-widest!" style="clip-path: polygon(0 0, 85% 0, 100% 100%, 15% 100%);">
						<div class="flex items-center gap-2">
							{#if locale === 'id'}<Id class="size-3" />ID{:else}<GbNir class="size-3" />EN{/if}
						</div>
					</Select.Trigger>
					<Select.Content class="rounded-none! border-2 border-foreground font-mono text-[10px] font-black uppercase tracking-widest">
						<Select.Item value="id" class="cursor-pointer">ID</Select.Item>
						<Select.Item value="en" class="cursor-pointer">EN</Select.Item>
					</Select.Content>
				</Select.Root>

				<div class="h-8 w-0.5 bg-foreground/10 mx-2"></div>

				{#if isLoggedIn}
					<Button 
						onclick={handleSignOut}
						class="bg-destructive text-destructive-foreground hover:bg-foreground hover:text-background"
						style="clip-path: polygon(0 0, 100% 0, 90% 100%, 10% 100%);"
					>
						Sign Out
					</Button>
				{:else}
					<InstallButton />
					<a 
						href={resumeUrl} 
						onclick={makeConfettiCannon} 
						download
						class="resume-btn-origami inline-flex h-10 items-center justify-center bg-primary px-6 font-poppins text-[10px] font-black text-primary-foreground uppercase tracking-tighter transition-all hover:-translate-x-1 hover:-translate-y-1 hover:bg-foreground hover:shadow-[4px_4px_0_var(--primary)] active:translate-x-0 active:translate-y-0 active:shadow-none"
					>
						{m.nav_cv_button()}
					</a>
				{/if}
			</div>

			<!-- Mobile Toggle -->
			<button 
				onclick={toggleMobileMenu}
				class="flex size-10 items-center justify-center border-2 border-foreground md:hidden"
				style="clip-path: polygon(0 0, 100% 15%, 100% 100%, 0 85%);"
			>
				{#if isMobileMenuOpen}<X class="size-5" />{:else}<Menu class="size-5" />{/if}
			</button>
		</div>
	</nav>
</header>

<!-- ===================== MOBILE MENU (BRUTALIST) ===================== -->
{#if isMobileMenuOpen}
	<div 
		transition:fade={{ duration: 300 }}
		class="fixed inset-0 z-[60] bg-background/95 backdrop-blur-2xl md:hidden"
	>
		<!-- Background Shards -->
		<div class="pointer-events-none absolute inset-0 overflow-hidden">
			<div class="absolute -top-24 -left-24 size-96 bg-primary/10" style="clip-path: polygon(0 0, 100% 0, 80% 100%, 0 80%);"></div>
			<div class="absolute -bottom-48 -right-48 size-[500px] bg-foreground/5" style="clip-path: polygon(20% 0, 100% 20%, 100% 100%, 0 100%);"></div>
		</div>

		<div class="relative flex h-full flex-col p-8">
			<div class="flex items-center justify-between border-b-2 border-foreground pb-8">
				<div class="flex items-center gap-2 font-mono text-[10px] font-black text-primary uppercase tracking-widest">
					<Terminal class="size-3" /> SYSTEM_MENU_V2.0
				</div>
				<button onclick={toggleMobileMenu} class="size-10 border-2 border-foreground flex items-center justify-center">
					<X class="size-5" />
				</button>
			</div>

			<nav class="mt-12 flex flex-col gap-6">
				{#each navLinksData as link (link.href)}
					<a
						href={`${base}${link.href}`}
						onclick={toggleMobileMenu}
						class="flex items-center justify-between border-b border-foreground/10 py-4 font-poppins text-4xl font-black tracking-tighter uppercase transition-all hover:translate-x-4 hover:text-primary"
					>
						<span>{link.label}</span>
						<ArrowUpRight class="size-8" />
					</a>
				{/each}
			</nav>

			<div class="mt-auto grid grid-cols-2 gap-4 pb-12">
				<div class="flex flex-col gap-4">
					<div class="flex items-center gap-2 font-mono text-[8px] font-black text-muted-foreground uppercase tracking-widest">
						<Command class="size-2" /> CORE_SETTINGS
					</div>
					<div class="flex gap-2">
						<button onclick={() => setMode('light')} class="size-10 border border-foreground flex items-center justify-center"><SunIcon class="size-4" /></button>
						<button onclick={() => setMode('dark')} class="size-10 border border-foreground flex items-center justify-center"><MoonIcon class="size-4" /></button>
					</div>
				</div>
				<div class="flex flex-col gap-4">
					<div class="flex items-center gap-2 font-mono text-[8px] font-black text-muted-foreground uppercase tracking-widest">
						<Hash class="size-2" /> LOCALE_SYNC
					</div>
					<div class="flex gap-2">
						<button onclick={() => locale = 'id'} class="h-10 border border-foreground px-4 font-mono text-[10px] font-black" class:bg-primary={locale === 'id'} class:text-primary-foreground={locale === 'id'}>ID</button>
						<button onclick={() => locale = 'en'} class="h-10 border border-foreground px-4 font-mono text-[10px] font-black" class:bg-primary={locale === 'en'} class:text-primary-foreground={locale === 'en'}>EN</button>
					</div>
				</div>
			</div>

			<!-- Mobile Resume Button -->
			<div class="mt-8">
				<a 
					href={resumeUrl} 
					onclick={makeConfettiCannon} 
					download
					class="resume-btn-origami flex h-14 w-full items-center justify-center bg-primary font-poppins text-xs font-black text-primary-foreground uppercase tracking-tighter transition-all hover:-translate-x-1 hover:-translate-y-1 hover:bg-foreground hover:shadow-[6px_6px_0_var(--primary)] active:translate-x-0 active:translate-y-0 active:shadow-none"
				>
					{m.nav_cv_button()}
				</a>
			</div>
		</div>
	</div>
{/if}
<style lang="postcss">
	@reference "tailwindcss";

	header {
		perspective: 1000px;
	}

	nav {
		transform-style: preserve-3d;
	}

	.resume-btn-origami {
		clip-path: polygon(5% 0, 100% 0, 95% 100%, 0 100%);
		transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
	}

	.resume-btn-origami:hover {
		clip-path: polygon(0 0, 95% 5%, 100% 100%, 5% 95%);
	}
</style>

