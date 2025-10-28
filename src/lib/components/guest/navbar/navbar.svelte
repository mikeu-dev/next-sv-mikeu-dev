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
	import {
		createUserWithEmailAndPassword,
		onAuthStateChanged,
		signInWithEmailAndPassword,
		signOut,
		type User
	} from 'firebase/auth';
	import { slide, fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { getLocale, setLocale } from '../../../paraglide/runtime';
	import { setupGsapPendulum } from './navbar.svelte.js';
	import { ConfettiCannon } from 'svelte-canvas-confetti';
	import { tick } from 'svelte';
	import { navLinks } from '@/lib/data/navlinks';
	import * as m from '@/lib/paraglide/messages';
	let initialLocale = $state(getLocale());
	let navLinksData = $derived(navLinks[initialLocale] || navLinks['en']);
	// --- State Management (Runes API) ---
	let locale = $state(getLocale());
	let user: User | null = $state(null);
	let showAuthModal = $state(false);
	let authMode: 'signIn' | 'signUp' = $state('signIn');
	let email = $state('');
	let password = $state('');
	let username = $state('');
	let isMobileMenuOpen = $state(false);
	const resumeUrl = `https://raw.githubusercontent.com/mikeu-dev/portfolio-assets/main/docs/cv/riki-ruswandi-resume-(${initialLocale}).pdf`;

	let anchorElement: HTMLAnchorElement;
	let headerElement: HTMLElement;
	let devSpan: HTMLElement;
	
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
	$effect(() => {
		const unsubscribe = onAuthStateChanged(auth, (newUser) => (user = newUser));
		return () => unsubscribe();
	});

	// --- Matter.js Setup (Lifecycle Safe) ---
	$effect(() => {
		if (anchorElement && headerElement && devSpan) {
			const cleanup = setupGsapPendulum(anchorElement, headerElement, devSpan);
			return cleanup;
		}
	});

	// --- Computed / Derived State ---
	let isLoggedIn = $derived(Boolean(user));
	let currentPath = $derived($page.url.pathname);

	// --- UI Interaction Handlers ---
	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	function openAuthModal(mode: 'signIn' | 'signUp') {
		authMode = mode;
		showAuthModal = true;
		email = '';
		username = '';
		password = '';
	}

	// --- Auth Handlers ---
	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		let authEmail = email;

		try {
			let result;
			if (authMode === 'signIn') {
				const res = await fetch(`/api/users/find-by-username`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ username })
				});
				if (!res.ok) {
					const errorData = await res.json();
					throw new Error(errorData.message || 'User not found');
				}
				const { email: foundEmail } = await res.json();
				authEmail = foundEmail;
			}

			if (authMode === 'signIn') {
				result = await signInWithEmailAndPassword(auth, authEmail, password);
				toast.success('Signed in successfully');
			} else {
				result = await createUserWithEmailAndPassword(auth, authEmail, password);
				toast.success('Account created successfully');
			}

			const token = await result.user.getIdToken();
			const res = await fetch('/api/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token, username, email: authEmail })
			});

			if (res.ok) window.location.reload();
			else toast.error('Authentication with server failed.');
		} catch (e: unknown) {
			console.error('Authentication error:', e);
			let message = e instanceof Error ? e.message : 'An unknown error occurred.';
			toast.error(message);
		}

		showAuthModal = false;
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
	class="relative z-10 flex items-center justify-between border-b p-4"
>
	<a href="/" bind:this={anchorElement} class="flex items-center gap-2 text-lg font-bold">
		<Avatar.Root>
			<Avatar.Image src="https://github.com/mikeu-dev.png" alt="@mikeu-dev" />
			<Avatar.Fallback>RR</Avatar.Fallback>
		</Avatar.Root>
		Mikeu
		<span
			bind:this={devSpan}
			class="inline-block origin-bottom-right rounded bg-teal-600 px-4 py-1 text-white"
		>
			Dev
		</span>
	</a>

	<!-- Desktop Navigation -->
	<nav class="hidden items-center space-x-6 text-sm font-medium md:flex">
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
	</nav>

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
				<Avatar.Image src={user?.photoURL} alt={user?.displayName} />
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
		class="fixed top-0 right-0 z-50 flex h-full w-[85%] max-w-xs flex-col bg-background/95 backdrop-blur-xl border-l border-border shadow-2xl md:hidden"
	>
		<!-- Header Close -->
		<div class="flex items-center justify-between p-4 border-b border-border/40">
			<h2 class="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
				Menu
			</h2>
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
					<SunIcon class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<MoonIcon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
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
		<div class="mt-auto flex flex-col items-center gap-4 px-6 pb-6 pt-4">
			<Button
				href={resumeUrl}
				onclick={makeConfettiCannon}
				download
				class="w-full font-semibold"
			>
				{m.nav_cv_button()}
			</Button>
			<p class="text-xs text-muted-foreground text-center">
				© {new Date().getFullYear()} Mikeu Dev
			</p>
		</div>
	</div>
{/if}


<!-- ===================== AUTH DIALOG ===================== -->
<Dialog.Root bind:open={showAuthModal}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{authMode === 'signIn' ? 'Sign In' : 'Sign Up'}</Dialog.Title>
			<Dialog.Description>
				{authMode === 'signIn'
					? 'Enter your credentials to access your account.'
					: 'Create an account to get started.'}
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="grid gap-4 py-4">
			{#if authMode === 'signUp'}
				<div>
					<label for="email" class="mb-1 block text-sm font-medium text-muted-foreground"
						>Email</label
					>
					<input
						id="email"
						type="email"
						bind:value={email}
						class="w-full rounded border bg-background p-2"
						required
					/>
				</div>
			{/if}

			<div>
				<label for="username" class="mb-1 block text-sm font-medium text-muted-foreground"
					>Username</label
				>
				<input
					id="username"
					type="text"
					bind:value={username}
					class="w-full rounded border bg-background p-2"
					required
				/>
			</div>

			<div>
				<label for="password" class="mb-1 block text-sm font-medium text-muted-foreground"
					>Password</label
				>
				<input
					id="password"
					type="password"
					bind:value={password}
					class="w-full rounded border bg-background p-2"
					required
				/>
			</div>

			<Button type="submit" class="w-full">{authMode === 'signIn' ? 'Sign In' : 'Sign Up'}</Button>
		</form>

		<Dialog.Footer class="sm:justify-center">
			<p class="text-center text-sm text-muted-foreground">
				{authMode === 'signIn' ? "Don't have an account?" : 'Already have an account?'}
				<button
					class="underline"
					onclick={() => (authMode = authMode === 'signIn' ? 'signUp' : 'signIn')}
				>
					{authMode === 'signIn' ? 'Sign Up' : 'Sign In'}
				</button>
			</p>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
