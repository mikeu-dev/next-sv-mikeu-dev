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
	import { onNavigate, afterNavigate } from '$app/navigation';
	import { FallingConfetti } from 'svelte-canvas-confetti';
	import { playConfettiSound } from '$lib/utils/confetti-sound';
	import gsap from 'gsap';
	import ScrollToPlugin from 'gsap/ScrollToPlugin';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import Skeleton from '@/lib/components/ui/skeleton.svelte';
	import { ArrowUp } from '@lucide/svelte';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	import { pwaState, type BeforeInstallPromptEvent } from '$lib/stores/pwa.svelte';

	let { data, children } = $props();

	// Register GSAP Plugin globally once
	if (typeof window !== 'undefined') {
		gsap.registerPlugin(ScrollToPlugin);
	}

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	let fallingConfetti = $state(false);
	let scrollBtn = $state<HTMLElement | null>(null);
	let liveStats = $state({ total: 0, today: 0 });

	function scrollToTop() {
		// Reduced duration for more responsive feel
		gsap.to(window, {
			duration: 0.5,
			scrollTo: 0,
			ease: 'power4.inOut'
		});
	}

	function handleScroll() {
		if (!scrollBtn) return;
		const show = window.scrollY > 300;
		gsap.to(scrollBtn, {
			duration: 0.3,
			opacity: show ? 1 : 0,
			scale: show ? 1 : 0.8,
			y: show ? 0 : 20,
			pointerEvents: show ? 'auto' : 'none',
			ease: 'back.out(1.7)'
		});
	}

	onMount(() => {
		window.addEventListener('scroll', handleScroll);

		if ('serviceWorker' in navigator && !dev) {
			navigator.serviceWorker.register('/service-worker.js', {
				type: dev ? 'module' : 'classic'
			});
		}

		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			pwaState.setInstallPrompt(e as BeforeInstallPromptEvent);
		});

		window.addEventListener('appinstalled', () => {
			pwaState.setInstallPrompt(null);
		});

		(async () => {
			try {
				const res = await fetch('/api/stats');
				if (res.ok) {
					liveStats = await res.json();
				}
			} catch {
				// Fail silently
			}
		})();

		return () => window.removeEventListener('scroll', handleScroll);
	});

	afterNavigate(() => {
		if (page.url.pathname === '/') {
			fallingConfetti = true;
			playConfettiSound();
			setTimeout(() => (fallingConfetti = false), 5000);
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
	<meta name="google-adsense-account" content="ca-pub-6698556269439251" />
	<script
		async
		src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6698556269439251"
		crossorigin="anonymous"
	></script>
</svelte:head>

{#if fallingConfetti}
	<FallingConfetti />
{/if}

<SEO />
<ModeWatcher />
<Toaster />

<div class="flex min-h-dvh flex-col">
	{#if !isAdmin}
		{#await data.resumeUrls}
			<Navbar resolvedResumeUrls={{ en: '', id: '' }} />
		{:then resolvedResumeUrls}
			<Navbar {resolvedResumeUrls} />
		{/await}
	{/if}
	<main class="container mx-auto flex-1 px-4 py-8">
		{@render children?.()}
	</main>
	{#if !isAdmin}
		{#await Promise.all([data.socials, data.visitorStats])}
			<footer class="container mx-auto px-4 py-8">
				<div class="flex justify-between">
					<Skeleton class="h-6 w-32" />
					<Skeleton class="h-6 w-48" />
				</div>
			</footer>
		{:then [socials, stats]}
			<Footer {socials} visitorStats={liveStats.total > 0 ? liveStats : stats} />
		{:catch}
			<Footer socials={[]} visitorStats={{ total: 0, today: 0 }} />
		{/await}
	{/if}
</div>

<div style="display: none">
	{#each locales as locale (locale)}
		<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
	{/each}
</div>

<!-- Brutalist Scroll to Top Button -->
<button
	bind:this={scrollBtn}
	class="group scroll-top-origami pointer-events-none fixed right-8 bottom-8 z-[9999] flex size-12 cursor-pointer items-center justify-center border-2 border-foreground bg-primary text-primary-foreground opacity-0 shadow-[4px_4px_0_var(--foreground)] transition-all duration-300 hover:-translate-x-2 hover:-translate-y-2 hover:rotate-3 hover:bg-foreground hover:text-primary hover:shadow-[12px_12px_0_var(--primary)] active:translate-x-0 active:translate-y-0 active:shadow-none"
	aria-label="Scroll to top"
	onclick={scrollToTop}
>
	<!-- Decorative Shard (Visible on Hover) -->
	<div
		class="absolute inset-0 -z-10 translate-x-0 translate-y-0 bg-primary-foreground/20 opacity-0 transition-all duration-300 group-hover:translate-x-3 group-hover:translate-y-3 group-hover:opacity-100"
		style="clip-path: polygon(20% 0, 100% 40%, 80% 100%, 0 70%);"
	></div>

	<ArrowUp
		class="relative z-10 size-6 transition-transform duration-300 group-hover:-translate-y-1"
		strokeWidth={3}
	/>
</button>

<style lang="postcss">
	@reference "tailwindcss";

	.scroll-top-origami {
		clip-path: polygon(15% 0, 100% 0, 85% 100%, 0 100%);
	}

	.scroll-top-origami:hover {
		clip-path: polygon(0 0, 85% 15%, 100% 100%, 15% 85%);
	}
</style>
