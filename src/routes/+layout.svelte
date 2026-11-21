<script lang="ts">
	import '../app.css';
	import favicon from '#lib/assets/favicon.png';
	import { onMount } from 'svelte';
	import { Toaster } from 'svelte-sonner';
	import { ModeWatcher } from 'mode-watcher';
	import Navbar from '@/lib/components/guest/navbar/navbar.svelte';
	import Footer from '@/lib/components/guest/footer/footer.svelte';
	import { locales, localizeHref } from '#lib/paraglide/runtime.js';
	import { page } from '$app/state';
	import { onNavigate, afterNavigate } from '$app/navigation';
	import { FallingConfetti } from 'svelte-canvas-confetti';
	import { playConfettiSound } from '#lib/utils/confetti-sound.js';
	import gsap from 'gsap';
	import ScrollToPlugin from 'gsap/ScrollToPlugin';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import Lenis from 'lenis';
	import { dev } from '$app/env';
	// @vercel/analytics's `injectAnalytics` (from '@vercel/analytics/sveltekit') still imports the
	// removed `$app/stores`, which now throws and crashes hydration — no SvelteKit-3-compatible
	// release exists yet (checked even the latest canary). Using the framework-agnostic `inject`
	// instead, replicating what `injectAnalytics` did internally (see its source): inject with
	// `disableAutoTrack`, then manually call `pageview()` on route change via `$app/state`.
	import { inject, pageview } from '@vercel/analytics';
	import Skeleton from '@/lib/components/ui/skeleton.svelte';
	import { ArrowUp } from '@lucide/svelte';
	import { m } from '#lib/paraglide/messages.js';

	inject({
		mode: dev ? 'development' : 'production',
		disableAutoTrack: true,
		framework: 'sveltekit'
	});

	$effect(() => {
		if (page.route.id) {
			pageview({ route: page.route.id, path: page.url.pathname });
		}
	});

	import { pwaState, type BeforeInstallPromptEvent } from '#lib/stores/pwa.svelte.js';
	import AdsenseLoader from '@/lib/components/ui/adsense-loader.svelte';

	let { data, children } = $props();

	// Register GSAP Plugin globally once
	if (typeof window !== 'undefined') {
		gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);
	}

	onNavigate((navigation) => {
		if (navigation.shallow) return;
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	let fallingConfetti = $state(false);
	let confettiShown = false;
	let scrollBtn = $state<HTMLElement | null>(null);
	let liveStats = $state({ total: 0, today: 0 });
	let lenis: Lenis;

	function scrollToTop() {
		if (lenis) {
			lenis.scrollTo(0, { duration: 0.5 });
		} else {
			// Reduced duration for more responsive feel
			gsap.to(window, {
				duration: 0.5,
				scrollTo: 0,
				ease: 'power4.inOut'
			});
		}
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
		lenis = new Lenis({
			lerp: 0.1,
			smoothWheel: true
		});

		lenis.on('scroll', ScrollTrigger.update);

		const updateLenis = (time: number) => {
			lenis.raf(time * 1000);
		};

		gsap.ticker.add(updateLenis);
		gsap.ticker.lagSmoothing(0);

		window.addEventListener('scroll', handleScroll);

		if ('serviceWorker' in navigator && !dev) {
			navigator.serviceWorker.register('/service-worker.js', { type: 'classic' });
		}

		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			pwaState.setInstallPrompt(e as BeforeInstallPromptEvent);
		});

		window.addEventListener('appinstalled', () => {
			pwaState.setInstallPrompt(null);
		});

		recordVisit();

		(async () => {
			try {
				const res = await fetch('/api/stats');
				if (res.ok) {
					const stats = await res.json();
					// The endpoint returns null when the database is unavailable.
					if (stats && typeof stats.total === 'number') liveStats = stats;
				}
			} catch {
				// Fail silently
			}
		})();

		return () => {
			window.removeEventListener('scroll', handleScroll);
			gsap.ticker.remove(updateLenis);
			if (lenis) lenis.destroy();
		};
	});

	/**
	 * Count this visit from the browser (once per session; the server also
	 * dedupes per day). Bots that do not run JavaScript never get here, and
	 * automation that does announces itself through navigator.webdriver.
	 */
	function recordVisit() {
		if (page.url.pathname.startsWith('/admin') || navigator.webdriver) return;
		try {
			if (sessionStorage.getItem('mikeu-visit')) return;
			sessionStorage.setItem('mikeu-visit', '1');
		} catch {
			/* storage unavailable: the server-side cookie still dedupes */
		}
		const body = JSON.stringify({ path: location.pathname, referrer: document.referrer });
		setTimeout(() => {
			fetch('/api/visit', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body,
				keepalive: true
			}).catch(() => {});
		}, 1000);
	}

	afterNavigate(({ shallow }) => {
		if (shallow) return;

		if (page.url.pathname === '/' && !confettiShown) {
			confettiShown = true;
			const fire = () => {
				fallingConfetti = true;
				playConfettiSound();
				setTimeout(() => (fallingConfetti = false), 5000);
			};
			// On a first visit the home intro plays first; celebrate once it hands over.
			if (document.documentElement.classList.contains('intro'))
				window.addEventListener('mikeu:intro-done', () => setTimeout(fire, 1100), {
					once: true
				});
			else fire();
		}
	});

	let isAdmin = $derived(page.url.pathname.startsWith('/admin'));

	// Guest pages that draw their own full-bleed header under the floating navbar.
	const FULL_BLEED = new Set([
		'/',
		'/projects',
		'/projects/[slug]',
		'/blog',
		'/blog/[slug]',
		'/about',
		'/contact',
		'/world'
	]);
	let fullBleed = $derived(isAdmin || FULL_BLEED.has(page.route.id ?? ''));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link rel="preconnect" href="https://pagead2.googlesyndication.com" />
	<link rel="preconnect" href="https://googleads.g.doubleclick.net" />
	<link rel="dns-prefetch" href="https://www.google-analytics.com" />

	<!-- Preload Critical Fonts (non-blocking) -->
	<link
		rel="preload"
		as="style"
		href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Red+Hat+Mono:wght@400;500;600&display=swap"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Red+Hat+Mono:wght@400;500;600&display=swap"
		rel="stylesheet"
		media="print"
		onload={(e) => ((e.currentTarget as HTMLLinkElement).media = 'all')}
	/>
	<noscript>
		<link
			href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Red+Hat+Mono:wght@400;500;600&display=swap"
			rel="stylesheet"
		/>
	</noscript>

	<meta name="google-adsense-account" content="ca-pub-6698556269439251" />
</svelte:head>

<AdsenseLoader clientId="ca-pub-6698556269439251" />

{#if fallingConfetti}
	<FallingConfetti />
{/if}

<ModeWatcher defaultMode="light" />
<Toaster />

<!-- Skip to content link for keyboard accessibility -->
<a
	href="#main-content"
	class="fixed top-0 left-1/2 z-[9999] -translate-x-1/2 -translate-y-full rounded-b-2xl bg-primary px-6 py-3 text-sm font-extrabold text-primary-foreground transition-transform focus:translate-y-0"
>
	Skip to content
</a>

<div class="flex min-h-dvh flex-col overflow-x-clip">
	{#if !isAdmin}
		{#await data.resumeUrls}
			<Navbar resolvedResumeUrls={{ en: '', id: '' }} />
		{:then resolvedResumeUrls}
			<Navbar {resolvedResumeUrls} />
		{/await}
	{/if}
	<main
		id="main-content"
		class={fullBleed ? 'flex-1' : 'container mx-auto flex-1 px-4 pt-28 pb-12 sm:pt-32'}
	>
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

<button
	bind:this={scrollBtn}
	class="glass pointer-events-none fixed right-6 bottom-6 z-[9999] flex size-12 items-center justify-center rounded-leaf-sm text-foreground opacity-0 transition-colors hover:bg-primary hover:text-primary-foreground sm:right-8 sm:bottom-8"
	aria-label={m.gis_scroll_top()}
	onclick={scrollToTop}
>
	<ArrowUp class="size-5" strokeWidth={2.4} />
</button>
