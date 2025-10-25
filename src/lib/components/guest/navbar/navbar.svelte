<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	import { page } from '$app/stores';
	import { page as p } from '$app/state';
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
	import { ConfettiBurst, ConfettiCannon, FallingConfetti, random } from 'svelte-canvas-confetti';
	import { tick } from 'svelte';
	import { afterNavigate } from '$app/navigation';

	// --- State Management (Runes API) ---
	let locale = $state(getLocale());
	let user: User | null = $state(null);
	let showAuthModal = $state(false);
	let authMode: 'signIn' | 'signUp' = $state('signIn');
	let email = $state('');
	let password = $state('');
	let username = $state('');
	let isMobileMenuOpen = $state(false);
	const resumeUrl =
		'https://raw.githubusercontent.com/mikeu-dev/portfolio-assets/main/docs/cv/riki-ruswandi-resume-(id).pdf';

	let anchorElement: HTMLAnchorElement;
	let headerElement: HTMLElement;
	let devSpan: HTMLElement;
	let fallingConfetti = $state(false);
	let confettiCannon = $state(false);

	afterNavigate(() => {
		if (p.url.pathname === '/') {
			fallingConfetti = true;

			setTimeout(() => {
				fallingConfetti = false;
			}, 5000); // tampil selama 2 detik
		}
	});

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
	const availableLanguageTags = ['id', 'en'] as const;
	const navLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/projects', label: 'Projects' },
		{ href: '/blog', label: 'Blog' },
		{ href: '/about', label: 'About' },
		{ href: '/contact', label: 'Contact' }
	];

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

{#if fallingConfetti}
	<FallingConfetti />
{/if}

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
		{#each navLinks as link}
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
			<Button href={resumeUrl} onclick={makeConfettiCannon} download>Get My Resume</Button>
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
	<button
		aria-label="toggle"
		transition:fade={{ duration: 150 }}
		class="fixed inset-0 z-40 bg-black/50 md:hidden"
		onclick={toggleMobileMenu}
	></button>
	<div
		transition:slide={{ axis: 'x', duration: 200, easing: quintOut }}
		class="fixed top-0 right-0 z-50 flex h-full w-3/4 max-w-xs flex-col bg-background p-4 shadow-lg md:hidden"
	>
		<div class="flex justify-end">
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
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</Button>
		</div>

		<nav class="mt-8 flex grow flex-col space-y-4 text-lg">
			{#each navLinks as link}
				<a
					href={link.href}
					class="block transition-colors hover:text-foreground/80"
					class:text-foreground={currentPath === link.href}
					class:text-muted-foreground={currentPath !== link.href}
					onclick={toggleMobileMenu}
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<div class="my-8 flex justify-center gap-4">
			{#each availableLanguageTags as lang}
				<a
					href={'/' + lang + currentPath}
					class="text-lg font-medium"
					class:text-foreground={lang === locale}
					class:text-muted-foreground={lang !== locale}
					onclick={toggleMobileMenu}
				>
					{lang.toUpperCase()}
				</a>
			{/each}
		</div>

		<div class="mt-8 flex flex-col gap-4">
			{#if isLoggedIn}
				<div class="flex items-center gap-2">
					<Avatar.Root>
						<Avatar.Image src={user?.photoURL} alt={user?.displayName} />
						<Avatar.Fallback>RR</Avatar.Fallback>
					</Avatar.Root>
					<span class="font-medium">{user?.displayName || user?.email}</span>
				</div>
				<Button onclick={handleSignOut}>Sign Out</Button>
			{:else}
				<Button onclick={() => openAuthModal('signIn')}>Sign In</Button>
			{/if}
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
