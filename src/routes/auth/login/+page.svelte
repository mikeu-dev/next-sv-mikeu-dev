<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { auth } from '$lib/firebase/firebase.client';
	import { signInWithEmailAndPassword } from 'firebase/auth';
	import SEO from '$lib/components/seo/seo.svelte';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { Terminal, ShieldCheck, Lock, Fingerprint, Command } from '@lucide/svelte';

	let email = $state('');
	let password = $state('');
	let username = $state('');
	let loading = $state(false);
	let formContainer = $state<HTMLElement>();

	onMount(() => {
		gsap.from('.login-stagger', {
			y: 30,
			opacity: 0,
			duration: 0.8,
			stagger: 0.1,
			ease: 'power4.out'
		});
	});

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		loading = true;
		let authEmail = email;

		try {
			if (!email.includes('@')) {
				username = email;
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

			const result = await signInWithEmailAndPassword(auth, authEmail, password);
			const token = await result.user.getIdToken();
			const res = await fetch('/api/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token, email: authEmail })
			});

			if (res.ok) {
				toast.success('ACCESS_GRANTED: Redirecting to Archive Core');
				window.location.href = '/admin/contacts';
			} else {
				toast.error('AUTH_SERVER_ERROR: Sync Failed');
			}
		} catch (e: unknown) {
			console.error('Authentication error:', e);
			let message = e instanceof Error ? e.message : 'Unknown encryption failure.';
			toast.error(message);
		} finally {
			loading = false;
		}
	}
</script>

<SEO noindex={true} />

<div
	class="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 selection:bg-primary selection:text-primary-foreground"
>
	<!-- Grain Texture Overlay -->
	<div
		class="pointer-events-none absolute inset-0 z-50 opacity-[0.03] mix-blend-overlay contrast-150 grayscale"
		style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
	></div>

	<!-- Background Origami Shards -->
	<div class="pointer-events-none absolute inset-0 -z-10">
		<div
			class="absolute top-0 right-0 h-[60vh] w-[60vw] bg-primary/5"
			style="clip-path: polygon(100% 0, 0 0, 100% 100%);"
		></div>
		<div
			class="absolute bottom-0 left-0 h-[40vh] w-[40vw] bg-foreground/[0.02]"
			style="clip-path: polygon(0 0, 0 100%, 100% 100%);"
		></div>
	</div>

	<div
		bind:this={formContainer}
		class="login-stagger relative w-full max-w-md border-2 border-foreground bg-background p-8 md:p-12"
		style="clip-path: polygon(0 0, 95% 0, 100% 5%, 100% 100%, 5% 100%, 0 95%);"
	>
		<!-- Decorative Elements -->
		<div class="absolute -top-1 -left-1 size-4 border-t-4 border-l-4 border-primary"></div>
		<div class="absolute -right-1 -bottom-1 size-4 border-r-4 border-b-4 border-primary"></div>

		<!-- Metadata Header -->
		<div class="mb-8 flex items-center justify-between border-b-2 border-foreground/10 pb-4">
			<div
				class="flex items-center gap-2 font-mono text-[10px] font-black tracking-widest text-primary uppercase"
			>
				<ShieldCheck class="size-3" /> SECURE_ARCHIVE_ACCESS
			</div>
			<div class="font-mono text-[8px] font-black tracking-tighter text-muted-foreground uppercase">
				PROTO_V5.0 // ID_AUTH
			</div>
		</div>

		<div class="mb-10">
			<h1 class="font-poppins text-4xl leading-none font-black tracking-tighter uppercase">
				System<span class="text-primary">.</span>Login
			</h1>
			<p
				class="mt-2 font-mono text-[10px] font-black tracking-widest text-muted-foreground uppercase"
			>
				AUTHORIZED_PERSONNEL_ONLY. INPUT_CREDENTIALS.
			</p>
		</div>

		<form onsubmit={handleSubmit} class="grid gap-6">
			<!-- Input Email/Username -->
			<div class="login-stagger group relative grid gap-2">
				<label
					for="email"
					class="flex items-center gap-2 font-mono text-[10px] font-black tracking-widest text-muted-foreground uppercase transition-colors group-focus-within:text-primary"
				>
					<Fingerprint class="size-3" /> IDENTIFIER_KEY
				</label>
				<input
					id="email"
					type="text"
					placeholder="EMAIL_OR_USERNAME"
					required
					bind:value={email}
					class="h-12 border-2 border-foreground bg-transparent px-4 font-mono text-xs font-black tracking-wider uppercase transition-all outline-none focus:border-primary focus:bg-primary/5 focus:ring-4 focus:ring-primary/10"
				/>
			</div>

			<!-- Input Password -->
			<div class="login-stagger group relative grid gap-2">
				<label
					for="password"
					class="flex items-center gap-2 font-mono text-[10px] font-black tracking-widest text-muted-foreground uppercase transition-colors group-focus-within:text-primary"
				>
					<Lock class="size-3" /> SECURITY_PHRASE
				</label>
				<input
					id="password"
					type="password"
					required
					bind:value={password}
					class="h-12 border-2 border-foreground bg-transparent px-4 font-mono text-xs font-black tracking-wider uppercase transition-all outline-none focus:border-primary focus:bg-primary/5 focus:ring-4 focus:ring-primary/10"
				/>
			</div>

			<!-- Action Button -->
			<button
				type="submit"
				disabled={loading}
				class="login-stagger group relative mt-4 h-14 w-full bg-primary font-poppins text-sm font-black tracking-tighter text-primary-foreground uppercase transition-all hover:bg-foreground hover:text-background active:scale-[0.98] disabled:opacity-50"
				style="clip-path: polygon(5% 0, 100% 0, 95% 100%, 0 100%);"
			>
				<div class="flex items-center justify-center gap-3">
					{loading ? 'INITIALIZING_SESSION...' : 'INITIATE_HANDSHAKE'}
					{#if !loading}
						<Command class="size-4 animate-pulse" />
					{/if}
				</div>
				<!-- Decorative Glow -->
				<div
					class="absolute inset-0 -z-10 bg-primary opacity-0 blur-xl transition-opacity group-hover:opacity-20"
				></div>
			</button>
		</form>

		<!-- Footer Metadata -->
		<div
			class="mt-12 flex items-center gap-4 font-mono text-[8px] font-black tracking-[0.3em] text-muted-foreground uppercase"
		>
			<Terminal class="size-3" />
			<span>ENCRYPTION: AES_256_ACTIVE</span>
		</div>
	</div>
</div>
