<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { auth } from '$lib/firebase/firebase.client';
	import { toast } from 'svelte-sonner';
	import {
		GoogleAuthProvider,
		createUserWithEmailAndPassword,
		onAuthStateChanged,
		signInWithEmailAndPassword,
		signOut,
		type User
	} from 'firebase/auth'; // Hapus signInWithPopup, tambahkan signInWithEmailAndPassword & createUserWithEmailAndPassword
	import { page } from '$app/stores';
	import Matter from 'matter-js';

	const navLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/projects', label: 'Projects' },
		{ href: '/blog', label: 'Blog' },
		{ href: '/about', label: 'About' },
		{ href: '/contact', label: 'Contact' }
	];
	let user: User | null = null;
	let showModal = false;
	let authMode: 'signIn' | 'signUp' = 'signIn';
	let email = '';
	let password = '';
	let username = '';

	let anchorElement: HTMLAnchorElement;
	let headerElement: HTMLElement; // The container for the physics world
	let devSpan: HTMLElement;

	// --- onMount tetap sama ---
	onMount(() => {
		const unsubscribe = onAuthStateChanged(auth, (newUser) => {
			user = newUser;
		});

		// Matter.js setup
		const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Constraint } = Matter;

		const engine = Engine.create();
		engine.gravity.y = 0.6; // A bit less gravity for a lighter feel
		const world = engine.world;

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

	function openModal(mode: 'signIn' | 'signUp') {
		authMode = mode;
		showModal = true;
		email = '';
		username = '';
		password = '';
	}

	async function handleSubmit() {
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

		showModal = false;
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

<header bind:this={headerElement} class="relative flex items-center justify-between border-b p-4">
	<a href="/" bind:this={anchorElement} class="flex items-center gap-2 text-lg font-bold">
		<Avatar.Root>
			<Avatar.Image src="https://github.com/mikeu-dev.png" alt="@mikeu-dev" />
			<Avatar.Fallback>RR</Avatar.Fallback>
		</Avatar.Root>
		Mikeu
		<span
			bind:this={devSpan}
			class="inline-block origin-bottom-right rounded bg-teal-600 px-4 py-1 text-white">Dev</span
		></a
	>
	<nav class="flex items-center space-x-6 text-sm font-medium">
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
	<div class="flex items-center gap-4">
		{#if user}
			<Avatar.Root>
				<Avatar.Image src={user.photoURL} alt={user.displayName} />
				<Avatar.Fallback>RR</Avatar.Fallback>
			</Avatar.Root>
			<Button onclick={handleSignOut}>Sign Out</Button>
		{:else}
			<Button onclick={() => openModal('signIn')}>Sign In</Button>
		{/if}
	</div>
</header>

<Dialog.Root bind:open={showModal}>
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
			<form on:submit|preventDefault={handleSubmit}>
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
					on:click={() => (authMode = authMode === 'signIn' ? 'signUp' : 'signIn')}
				>
					{authMode === 'signIn' ? 'Sign Up' : 'Sign In'}
				</button>
			</p>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
