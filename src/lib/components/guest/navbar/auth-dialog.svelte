<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	import { auth } from '$lib/firebase/firebase.client';
	import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

	let { open = $bindable(false) } = $props();

	let authMode: 'signIn' | 'signUp' = $state('signIn');
	let email = $state('');
	let password = $state('');
	let username = $state('');

	// Reset form when dialog opens/closes or mode changes
	$effect(() => {
		if (!open) {
			// Optional: reset state on close
			// authMode = 'signIn';
		}
	});

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		console.log('Starting authentication...', { authMode, email, username });
		let authEmail = email;

		try {
			let result;
			if (authMode === 'signIn') {
				console.log('Fetching user by username...');
				const res = await fetch(`/api/users/find-by-username`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ username })
				});

				if (!res.ok) {
					const errorData = await res.json();
					console.error('User lookup failed:', errorData);
					throw new Error(errorData.message || 'User not found');
				}
				const { email: foundEmail } = await res.json();
				authEmail = foundEmail;
				console.log('User found, email:', authEmail);
			}

			if (authMode === 'signIn') {
				console.log('Attempting Firebase sign-in...');
				result = await signInWithEmailAndPassword(auth, authEmail, password);
				console.log('Firebase sign-in success:', result.user.uid);
				toast.success('Signed in successfully');
			} else {
				console.log('Attempting Firebase sign-up...');
				result = await createUserWithEmailAndPassword(auth, authEmail, password);
				console.log('Firebase sign-up success:', result.user.uid);
				toast.success('Account created successfully');
			}

			console.log('Getting ID token...');
			const token = await result.user.getIdToken();
			console.log('Sending token to server...');
			const res = await fetch('/api/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token, username, email: authEmail })
			});

			if (res.ok) {
				console.log('Server auth success. Invalidating data...');
				await invalidateAll();
				toast.success('Login successful!');
			} else {
				console.error('Server auth failed:', res.status, res.statusText);
				toast.error('Authentication with server failed.');
			}
		} catch (e: unknown) {
			console.error('Authentication error details:', e);
			let message = e instanceof Error ? e.message : 'An unknown error occurred.';
			toast.error(message);
		}

		open = false;
	}
</script>

<Dialog.Root bind:open>
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
