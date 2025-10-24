<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { auth } from '$lib/firebase/firebase.client';
	import { toast } from 'svelte-sonner';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';

	import { resetMode, setMode } from 'mode-watcher';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import Id from 'svelte-flags/Id.svelte';
	import GbNir from 'svelte-flags/GbNir.svelte';
	import {
		createUserWithEmailAndPassword,
		onAuthStateChanged,
		signInWithEmailAndPassword,
		signOut,
		type User
	} from 'firebase/auth';
	import { page } from '$app/stores';
	import Matter from 'matter-js';
	import { slide, fade } from 'svelte/transition'; // Import Svelte transitions
	import { quintOut } from 'svelte/easing'; // Import easing for slide transition
	import { getLocale, setLocale } from '../paraglide/runtime';

	let locale = $state(getLocale());
	$effect(() => {
		if (locale) {
			setLocale(locale);
		}
	});

	const availableLanguageTags = ['in', 'en'] as const;

	const navLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/projects', label: 'Projects' },
		{ href: '/blog', label: 'Blog' },
		{ href: '/about', label: 'About' },
		{ href: '/contact', label: 'Contact' }
	];
	let user: User | null = $state(null);
	let showAuthModal = $state(false); // Renamed to avoid conflict with mobile menu
	let authMode: 'signIn' | 'signUp' = $state('signIn');
	let email = $state('');
	let password = $state('');
	let username = $state('');

	let anchorElement: HTMLAnchorElement;
	let headerElement: HTMLElement;
	let devSpan: HTMLElement;

	// New state for mobile menu
	let isMobileMenuOpen: boolean = $state(false);

	// --- onMount tetap sama ---
	onMount(() => {
		const unsubscribe = onAuthStateChanged(auth, (newUser: User | null) => {
			user = newUser;
		});

		// Matter.js setup
		const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Constraint } = Matter;

		const engine = Engine.create();
		engine.gravity.y = 0.6; // A bit less gravity for a lighter feel
		const world = engine.world;

		// Ensure headerElement and devSpan are available before Matter.js setup
		if (!headerElement || !devSpan) {
			console.warn('Matter.js elements not found. Skipping physics setup.');
			return;
		}
		const runner = Runner.create();

		const headerRect = headerElement.getBoundingClientRect();
		const wallOptions = { isStatic: true, render: { visible: false } };

		// Create boundaries (walls and floor)
		Composite.add(world, [
			Bodies.rectangle(
				headerRect.width / 2,
				headerRect.height + 20,
				headerRect.width,
				40,
				wallOptions
			), // floor
			Bodies.rectangle(
				headerRect.width + 20,
				headerRect.height / 2,
				40,
				headerRect.height,
				wallOptions
			), // right wall
			Bodies.rectangle(-20, headerRect.height / 2, 40, headerRect.height, wallOptions) // left wall
		]);

		// Create the body for the "Dev" span
		const devRect = devSpan.getBoundingClientRect();
		// Calculate the initial center position relative to the header
		const initialX = devRect.left - headerRect.left + devRect.width / 2;
		const initialY = devRect.top - headerRect.top + devRect.height / 2;

		const devBody = Bodies.rectangle(initialX, initialY, devRect.width, devRect.height, {
			restitution: 0.6, // How bouncy it is
			friction: 0.05,
			density: 0.001
		});

		// The pivot point in world coordinates (bottom-right corner of the initial position)
		const pivotPoint = {
			x: initialX + devRect.width / 2,
			y: initialY + devRect.height / 2
		};

		// Create a constraint to pin the body to the pivot point
		const constraint = Constraint.create({
			bodyB: devBody,
			pointB: { x: devRect.width / 2, y: devRect.height / 2 }, // Attach to body's bottom-right
			pointA: pivotPoint, // Pin to the world
			stiffness: 1,
			length: 0
		});

		Composite.add(world, [devBody, constraint]);

		// Add mouse control for interactivity
		const mouse = Mouse.create(devSpan.ownerDocument.body); // Use body for correct viewport coordinates
		const mouseConstraint = MouseConstraint.create(engine, {
			mouse: mouse,
			constraint: { stiffness: 0.2, render: { visible: false } }
		});
		Composite.add(world, mouseConstraint);

		// Add hover effect
		const handleHover = () => {
			Matter.Body.applyForce(devBody, devBody.position, {
				x: Math.random() * 0.01 - 0.005,
				y: -0.025 // A little nudge upwards
			});
		};
		anchorElement.addEventListener('mouseenter', handleHover);

		Runner.run(runner, engine);

		// Sync DOM with physics engine
		(function update() {
			if (engine.world.bodies.length === 0) return; // Stop if cleared
			requestAnimationFrame(update);
			const { x, y } = devBody.position;
			const angle = devBody.angle;
			devSpan.style.transform = `translate(${x - initialX}px, ${y - initialY}px) rotate(${angle}rad)`;
		})();

		return () => {
			Runner.stop(runner);
			Engine.clear(engine);
			anchorElement.removeEventListener('mouseenter', handleHover);
			unsubscribe();
		};
	});

	// Function to toggle mobile menu
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

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		let authEmail = email;

		try {
			let result;
			// Jika mode sign-in, cari email berdasarkan username
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

			// Lanjutkan dengan email yang ditemukan atau yang diinput saat sign-up
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
				body: JSON.stringify({ token, username, email: authEmail }) // Kirim data user ke server
			});

			if (res.ok) {
				window.location.reload();
			} else {
				toast.error('Authentication with server failed.');
			}
		} catch (e: unknown) {
			console.error('Authentication error:', e);
			let message = 'An unknown error occurred.';
			if (e instanceof Error) {
				// Firebase errors often have more specific messages
				message = e.message;
			}
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
			} else {
				toast.error('Sign out failed');
			}
		} catch (e: unknown) {
			console.error('Sign out error:', e);
			toast.error('An error occurred during sign out.');
		}
	}
</script>

<header
	bind:this={headerElement}
	class="relative z-10 flex items-center justify-between border-b p-4"
>
	<a href="/" bind:this={anchorElement} class="flex min-w-0 items-center gap-2 text-lg font-bold">
		<!-- min-w-0 added to prevent overflow on small screens -->
		<Avatar.Root>
			<Avatar.Image src="https://github.com/mikeu-dev.png" alt="@mikeu-dev" />
			<Avatar.Fallback>RR</Avatar.Fallback>
		</Avatar.Root>
		Mikeu
		<span
			bind:this={devSpan}
			class="inline-block origin-bottom-right rounded bg-teal-600 px-4 py-1 text-white">Dev</span
		>
	</a>
	<!-- Desktop Navigation -->
	<nav class="hidden items-center space-x-6 text-sm font-medium md:flex">
		{#each navLinks as link}
			<a
				href={link.href}
				class="transition-colors hover:text-foreground/80"
				class:text-foreground={$page.url.pathname === link.href}
				class:text-muted-foreground={$page.url.pathname !== link.href}
			>
				{link.label}
			</a>
		{/each}
	</nav>
	<div class="hidden items-center gap-4 md:flex">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline', size: 'icon' })}>
				<SunIcon
					class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90"
				/>
				<MoonIcon
					class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
				/>
				<span class="sr-only">Toggle theme</span>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Item onclick={() => setMode('light')}>Light</DropdownMenu.Item>
				<DropdownMenu.Item onclick={() => setMode('dark')}>Dark</DropdownMenu.Item>
				<DropdownMenu.Item onclick={() => resetMode()}>System</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		<Select.Root type="single" bind:value={locale}>
			<Select.Trigger class="w-[90px] font-mono text-xs"
				>{#if locale === 'id'}
					<Id class="h-5 w-5" />ID
				{:else if locale === 'en'}
					<GbNir class="h-5 w-5 text-xs" />EN
				{:else}
					<span class="text-gray-500">Bahasa</span>
				{/if}
			</Select.Trigger>
			<Select.Content class="font-mono text-xs">
				<Select.Item value="id"><Id />ID</Select.Item>
				<Select.Item value="en"><GbNir />EN</Select.Item>
			</Select.Content>
		</Select.Root>
		<div class="mx-2 h-6 w-px bg-border"></div>
		{#if user}
			<Avatar.Root>
				<Avatar.Image src={user.photoURL} alt={user.displayName} />
				<Avatar.Fallback>RR</Avatar.Fallback>
			</Avatar.Root>
			<Button onclick={handleSignOut}>Sign Out</Button>
		{:else}
			<Button onclick={() => openAuthModal('signIn')}>Sign In</Button>
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

<!-- Mobile Menu Overlay and Drawer -->
{#if isMobileMenuOpen}
	<button
		transition:fade={{ duration: 150 }}
		class="fixed inset-0 z-40 bg-black/50 md:hidden"
		onclick={toggleMobileMenu}
		aria-label="toggle"
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
				<span class="sr-only">Close navigation</span>
			</Button>
		</div>
		<nav class="mt-8 flex grow flex-col space-y-4 text-lg">
			{#each navLinks as link}
				<a
					href={link.href}
					class="block transition-colors hover:text-foreground/80"
					class:text-foreground={$page.url.pathname === link.href}
					class:text-muted-foreground={$page.url.pathname !== link.href}
					onclick={toggleMobileMenu}
				>
					{link.label}
				</a>
			{/each}
		</nav>
		<div class="my-8 flex justify-center gap-4">
			{#each availableLanguageTags as lang}
				<a
					href={'/' + lang + $page.url.pathname}
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
			{#if user}
				<div class="flex items-center gap-2">
					<Avatar.Root>
						<Avatar.Image src={user.photoURL} alt={user.displayName} />
						<Avatar.Fallback>RR</Avatar.Fallback>
					</Avatar.Root>
					<span class="font-medium">{user.displayName || user.email}</span>
				</div>
				<Button onclick={handleSignOut}>Sign Out</Button>
			{:else}
				<Button onclick={() => openAuthModal('signIn')}>Sign In</Button>
			{/if}
		</div>
	</div>
{/if}

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
		<div class="grid gap-4 py-4">
			<form onsubmit={handleSubmit}>
				{#if authMode === 'signUp'}
					<div class="mb-4">
						<label for="email" class="mb-1 block text-sm font-medium text-muted-foreground"
							>Email</label
						>
						<input
							type="email"
							id="email"
							bind:value={email}
							class="w-full rounded border bg-background p-2"
							required
						/>
					</div>
				{/if}
				<div class="mb-4">
					<label for="username" class="mb-1 block text-sm font-medium text-muted-foreground"
						>Username</label
					>
					<input
						type="text"
						id="username"
						bind:value={username}
						class="w-full rounded border bg-background p-2"
						required
					/>
				</div>
				<div class="mb-6">
					<label for="password" class="mb-1 block text-sm font-medium text-muted-foreground"
						>Password</label
					>
					<input
						type="password"
						id="password"
						bind:value={password}
						class="w-full rounded border bg-background p-2"
						required
					/>
				</div>
				<Button type="submit" class="w-full">{authMode === 'signIn' ? 'Sign In' : 'Sign Up'}</Button
				>
			</form>
		</div>
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
