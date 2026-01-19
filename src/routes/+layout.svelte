<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.png';
	import { onMount } from 'svelte';
	import { Toaster } from 'svelte-sonner';
	import { ModeWatcher } from 'mode-watcher';
	import Navbar from '@/lib/components/guest/navbar/navbar.svelte';
	import Footer from '@/lib/components/guest/footer/footer.svelte';
	import SEO from '@/lib/components/seo/seo.svelte';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { FallingConfetti } from 'svelte-canvas-confetti';
	import Button from '@/lib/components/ui/button/button.svelte';
	import gsap from 'gsap';
	import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
	import { Icon } from 'svelte-icons-pack';
	import { BsArrowUpCircleFill } from 'svelte-icons-pack/bs';
	import { auth } from '$lib/firebase/firebase.client';
	import { signOut } from 'firebase/auth';
	import { authState } from '$lib/stores/auth.svelte';

	let { data, children } = $props();
	const { socials } = data;

	let fallingConfetti = $state(false);
	let scrollBtn: HTMLButtonElement;

	function scrollToTop() {
		gsap.to(window, { duration: 1, scrollTo: 0 });
	}

	function handleScroll() {
		const show = window.scrollY > 300;
		gsap.registerPlugin(ScrollToPlugin);

		// Animasi smooth: opacity + scale
		gsap.to(scrollBtn, {
			duration: 0.4,
			opacity: show ? 1 : 0,
			scale: show ? 1 : 0.5,
			pointerEvents: show ? 'auto' : 'none',
			ease: 'power2.out'
		});
	}

	onMount(() => {
		scrollBtn = document.getElementById('scrollToTopBtn') as HTMLButtonElement;
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});

	afterNavigate(() => {
		if (page.url.pathname === '/') {
			fallingConfetti = true;
			setTimeout(() => (fallingConfetti = false), 5000);
		}
	});

	$effect(() => {
		if (authState.initialized && authState.user && !data.user) {
			console.log(
				'⚠️ Session mismatch detected (Server: Logged out, Client: Logged in). Signing out...'
			);
			signOut(auth).then(async () => {
				await fetch('/api/auth', { method: 'DELETE' });
				// data.user is static from load function, so we might need to invalidateAll or reload
				// but since simple signout clears authState, UI should update immediately.
				// However, to be safe and clear cookies properly:
				window.location.reload();
			});
		}
	});
	let isAdmin = $derived(page.url.pathname.startsWith('/admin'));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<!-- 🎉 Confetti layer di luar layout utama -->
{#if fallingConfetti}
	<FallingConfetti />
{/if}

<SEO />
<ModeWatcher />
<Toaster />

<!-- 🧩 Layout utama -->
<div class="flex min-h-dvh flex-col">
	{#if !isAdmin}
		<Navbar />
	{/if}
	<main class="container mx-auto flex-1 px-4 py-8">
		{@render children?.()}
	</main>
	{#if !isAdmin}
		<Footer {socials} />
	{/if}
</div>

<!-- 🌐 Hidden locale links -->
<div style="display: none">
	{#each locales as locale}
		<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
	{/each}
</div>

<Button
	class="shadow-3xl pointer-events-none fixed right-8 bottom-8 z-9999 scale-50 cursor-pointer rounded-full p-3 text-white opacity-0 transition-all dark:bg-teal-400 dark:hover:bg-teal-300"
	id="scrollToTopBtn"
	aria-label="Scroll to top"
	onclick={() => scrollToTop()}
>
	<Icon src={BsArrowUpCircleFill} size={24} />
</Button>
