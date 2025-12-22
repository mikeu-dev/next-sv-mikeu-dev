<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	import { page } from '$app/stores';
	import { auth } from '$lib/firebase/firebase.client';
	import { toast } from 'svelte-sonner';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import Id from 'svelte-flags/Id.svelte';
	import GbNir from 'svelte-flags/GbNir.svelte';
	import { resetMode, setMode } from 'mode-watcher';
	import { signOut } from 'firebase/auth';
	import { authState } from '$lib/stores/auth.svelte';
	import AuthDialog from './auth-dialog.svelte';
	import { slide, fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { getLocale, setLocale } from '../../../paraglide/runtime';
	import { setupGsapPendulum } from './navbar.svelte.js';
	import { ConfettiCannon } from 'svelte-canvas-confetti';
	import { onMount, tick } from 'svelte';
	import { navLinks } from '@/lib/data/navlinks';
	import * as m from '@/lib/paraglide/messages';
	let initialLocale = $state(getLocale());
	let navLinksData = $derived(navLinks[initialLocale] || navLinks['en']);
	// --- State Management (Runes API) ---
	let locale = $state(getLocale());
	let showAuthModal = $state(false);
	let isMobileMenuOpen = $state(false);
	const resumeUrl = `https://raw.githubusercontent.com/mikeu-dev/portfolio-assets/main/docs/cv/riki-ruswandi-resume-(${initialLocale}).pdf`;

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
	};

	// --- Reactive Locale Sync ---
	$effect(() => {
		if (locale) setLocale(locale);
	});

	// --- Firebase Auth Watcher ---
	// --- Matter.js Setup (Lifecycle Safe) ---
	$effect(() => {
		if (anchorElement && headerElement && devSpan) {
			const cleanup = setupGsapPendulum(anchorElement, headerElement, devSpan);
			return cleanup;
		}
	});

	// --- Computed / Derived State ---
	let isLoggedIn = $derived(Boolean(authState.user));
	let currentPath = $derived($page.url.pathname);

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
<!-- ===================== HEADER ===================== -->
<header
	bind:this={headerElement}
	class="fixed inset-x-0 top-0 z-50 transition-transform duration-300 ease-in-out"
	class:translate-y-[-100%]={hideHeader}
>
	<nav
		class="relative z-10 mx-2 flex items-center justify-between rounded-b-4xl bg-white/30 p-6 shadow backdrop-blur-md lg:px-8 dark:bg-gray-900/30 dark:shadow-sm dark:shadow-gray-600"
	>
		<a
			href="/"
			bind:this={anchorElement}
			class="relative flex items-center gap-2 text-lg font-bold"
		>
			<Avatar.Root>
				<Avatar.Image src="https://github.com/mikeu-dev.png" alt="@mikeu-dev" />
				<Avatar.Fallback>RR</Avatar.Fallback>
			</Avatar.Root>
			Mikeu
			<span
				bind:this={devSpan}
				class="relative inline-block origin-bottom-right rounded bg-teal-600 px-4 py-1 text-white"
			>
				Dev
				<!-- Titik indikator/Poros -->
				<span
					class="absolute right-1.5 bottom-1.5 h-1 w-1 translate-x-1/4 translate-y-1/4 rounded-full bg-white"
				></span>
			</span>
		</a>

		<!-- Desktop Navigation -->
		<div class="hidden items-center space-x-6 text-sm font-medium md:flex">
			{#each navLinksData as link}
				<a
					href={link.href}
					class="transition-colors hover:text-foreground/80"
					class:text-foreground={currentPath === link.href}
					class:text-muted-foreground={currentPath !== link.href}
				>
					{link.label}
				</a>
			{/each}
		</div>

		<div class="hidden items-center gap-4 md:flex">
			<!-- Theme Dropdown -->
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline', size: 'icon' })}>
					<SunIcon
						class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
					/>
					<MoonIcon
						class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
					/>
					<span class="sr-only">Toggle theme</span>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Item onclick={() => setMode('light')}>Light</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => setMode('dark')}>Dark</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => resetMode()}>System</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>

			<!-- Locale Selector -->
			<Select.Root type="single" bind:value={locale}>
				<Select.Trigger class="w-[90px] font-mono text-xs">
					{#if locale === 'id'}
						<Id class="h-5 w-5" />ID
					{:else if locale === 'en'}
						<GbNir class="h-5 w-5" />EN
					{:else}
						<span class="text-gray-500">Lang</span>
					{/if}
				</Select.Trigger>
				<Select.Content class="font-mono text-xs">
					<Select.Item value="id"><Id />ID</Select.Item>
					<Select.Item value="en"><GbNir />EN</Select.Item>
				</Select.Content>
			</Select.Root>

			<div class="mx-2 h-6 w-px bg-border"></div>

			{#if isLoggedIn}
				<Avatar.Root>
					<Avatar.Image src={authState.user?.photoURL} alt={authState.user?.displayName} />
					<Avatar.Fallback>RR</Avatar.Fallback>
				</Avatar.Root>
				<Button onclick={handleSignOut}>Sign Out</Button>
			{:else}
				<Button href={resumeUrl} onclick={makeConfettiCannon} download>{m.nav_cv_button()}</Button>
			{/if}
		</div>

		<!-- Mobile Menu Button -->
		<div class="md:hidden">
			<Button variant="ghost" size="icon" onclick={toggleMobileMenu}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
				<span class="sr-only">Toggle navigation</span>
			</Button>
		</div>
	</nav>
</header>

<!-- ===================== MOBILE MENU ===================== -->
{#if isMobileMenuOpen}
	<!-- Overlay -->
	<button
		aria-label="toggle"
		transition:fade={{ duration: 200 }}
		class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
		onclick={toggleMobileMenu}
	></button>

	<!-- Panel -->
	<div
		transition:slide={{ axis: 'x', duration: 250, easing: quintOut }}
		class="fixed top-0 right-0 z-50 flex h-full w-[85%] max-w-xs flex-col border-l border-border bg-background/95 shadow-2xl backdrop-blur-xl md:hidden"
	>
		<!-- Header Close -->
		<div class="flex items-center justify-between border-b border-border/40 p-4">
			<h2 class="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Menu</h2>
			<Button
				variant="ghost"
				size="icon"
				onclick={toggleMobileMenu}
				class="rounded-full hover:bg-accent/10"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</Button>
		</div>

		<!-- Nav Links -->
		<nav class="flex flex-col gap-3 px-6 py-8 text-base">
			{#each navLinksData as link}
				<a
					href={link.href}
					onclick={toggleMobileMenu}
					class="rounded-md px-3 py-2 font-medium transition-all duration-200 hover:bg-accent/10"
					class:text-foreground={currentPath === link.href}
					class:text-muted-foreground={currentPath !== link.href}
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<!-- Divider -->
		<div class="mx-6 my-4 h-px bg-border/40"></div>

		<!-- Settings (Theme + Language) -->
		<div class="flex items-center justify-center gap-4 px-4">
			<!-- Theme Toggle -->
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline', size: 'icon' })}>
					<SunIcon
						class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
					/>
					<MoonIcon
						class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
					/>
					<span class="sr-only">Toggle theme</span>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Item onclick={() => setMode('light')}>Light</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => setMode('dark')}>Dark</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => resetMode()}>System</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>

			<!-- Locale Selector -->
			<Select.Root type="single" bind:value={locale}>
				<Select.Trigger class="w-[90px] font-mono text-xs">
					{#if locale === 'id'}
						<Id class="h-5 w-5" />ID
					{:else if locale === 'en'}
						<GbNir class="h-5 w-5" />EN
					{:else}
						<span class="text-gray-500">Lang</span>
					{/if}
				</Select.Trigger>
				<Select.Content class="font-mono text-xs">
					<Select.Item value="id"><Id />ID</Select.Item>
					<Select.Item value="en"><GbNir />EN</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>

		<!-- CTA Button -->
		<div class="mt-auto flex flex-col items-center gap-4 px-6 pt-4 pb-6">
			<Button href={resumeUrl} onclick={makeConfettiCannon} download class="w-full font-semibold">
				{m.nav_cv_button()}
			</Button>
			<p class="text-center text-xs text-muted-foreground">
				© {new Date().getFullYear()} Mikeu Dev
			</p>
		</div>
	</div>
{/if}

<!-- ===================== AUTH DIALOG ===================== -->
<AuthDialog bind:open={showAuthModal} />
