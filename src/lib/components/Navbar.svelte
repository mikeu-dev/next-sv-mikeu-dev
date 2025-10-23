<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { auth } from '$lib/firebase/firebase.client';
	import { toast } from 'svelte-sonner';
	import {
		GoogleAuthProvider,
		onAuthStateChanged,
		signInWithPopup,
		signOut,
		type User
	} from 'firebase/auth';
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

	let anchorElement: HTMLAnchorElement;
	let headerElement: HTMLElement; // The container for the physics world
	let devSpan: HTMLElement;

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

	async function handleSignIn() {
		const provider = new GoogleAuthProvider();
		try {
			const result = await signInWithPopup(auth, provider);
			const token = await result.user.getIdToken();
			const res = await fetch('/api/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token })
			});
			if (res.ok) {
				toast.success('Signed in successfully');
				window.location.reload();
			} else {
				toast.error('Sign in failed');
			}
		} catch (error) {
			toast.error('Sign in failed');
		}
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
		} catch (error) {
			toast.error('Sign out failed');
		}
	}
</script>

<header bind:this={headerElement} class="relative flex items-center justify-between border-b p-4">
	<a href="/" bind:this={anchorElement} class="text-lg font-bold flex items-center gap-2">
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
			<Button onclick={handleSignIn}>Sign In with Google</Button>
		{/if}
	</div>
</header>
