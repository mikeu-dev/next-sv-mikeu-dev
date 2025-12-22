<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import { auth } from '$lib/firebase/firebase.client';
	import { signInWithEmailAndPassword } from 'firebase/auth';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let username = $state('');
	let loading = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		loading = true;
		let authEmail = email;

		try {
			// First try to resolve username if email looks like a username (no @)
			// Or just assume it varies. The original dialog had logic for username lookup.
			// Let's assume for owner login, likely using email directly.
			// But to be consistent with AuthDialog, let's keep the username check if user inputs username.
			if (!email.includes('@')) {
				username = email;
				const res = await fetch(`/api/users/find-by-username`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ username })
				});
				if (!res.ok) {
					// Try as email anyway if lookup fails? No, if no @ and lookup fails, it's invalid.
					const errorData = await res.json();
					throw new Error(errorData.message || 'User not found');
				}
				const { email: foundEmail } = await res.json();
				authEmail = foundEmail;
			}

			const result = await signInWithEmailAndPassword(auth, authEmail, password);

			const token = await result.user.getIdToken();
			const res = await fetch('/api/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token, email: authEmail }) // username might be empty if used email
			});

			if (res.ok) {
				toast.success('Signed in successfully');
				window.location.href = '/admin/contacts'; // Force reload/nav to update server session
			} else {
				toast.error('Authentication with server failed.');
			}
		} catch (e: unknown) {
			console.error('Authentication error:', e);
			let message = e instanceof Error ? e.message : 'An unknown error occurred.';
			toast.error(message);
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center px-4">
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">Login</Card.Title>
			<Card.Description>Enter your email or username to access the admin panel.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form onsubmit={handleSubmit} class="grid gap-4">
				<div class="grid gap-2">
					<Label for="email">Email or Username</Label>
					<Input id="email" type="text" placeholder="m@example.com" required bind:value={email} />
				</div>
				<div class="grid gap-2">
					<Label for="password">Password</Label>
					<Input id="password" type="password" required bind:value={password} />
				</div>
				<Button type="submit" class="w-full" disabled={loading}>
					{loading ? 'Signing in...' : 'Sign in'}
				</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
