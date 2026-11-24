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

	const FONT_CSS =
		'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Red+Hat+Mono:wght@400;500;600&display=swap';
	const FONT_STYLESHEET = `<link href="${FONT_CSS.replace(/&/g, '&amp;')}" rel="stylesheet" media="print" onload="this.media='all'">`;

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
	let showScrollTop = $state(false);
	let liveStats = $state({ total: 0, today: 0 });
	let lenis: Lenis;

	function scrollToTop() {
		if (lenis) lenis.scrollTo(0, { duration: 0.5 });
		else window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function handleScroll() {
		showScrollTop = window.scrollY > 300;
	}

	onMount(() => {
		// Smooth scrolling drives its own animation frame loop (no GSAP on every
		// page: it was ~80 KiB of script the home page barely used).
		lenis = new Lenis({
			lerp: 0.1,
			smoothWheel: true,
			autoRaf: true
		});

		window.addEventListener('scroll', handleScroll);

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
	<!-- Non-blocking font stylesheet. Raw HTML so the onload swap works before
	     hydration (a Svelte handler only attaches once the app has hydrated). -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- constant markup, no user input -->
	{@html FONT_STYLESHEET}
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
		<Navbar resolvedResumeUrls={data.resumeUrls} />
	{/if}
	<main
		id="main-content"
		class={fullBleed ? 'flex-1' : 'container mx-auto flex-1 px-4 pt-28 pb-12 sm:pt-32'}
	>
		{@render children?.()}
	</main>
	{#if !isAdmin}
		<Footer
			socials={data.socials}
			visitorStats={liveStats.total > 0 ? liveStats : data.visitorStats}
		/>
	{/if}
</div>

<div style="display: none">
	{#each locales as locale (locale)}
		<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
	{/each}
</div>

<button
	class="glass fixed right-6 bottom-6 z-[9999] flex size-12 items-center justify-center rounded-leaf-sm text-foreground transition-[opacity,transform,background-color,color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-primary hover:text-primary-foreground motion-reduce:transition-none sm:right-8 sm:bottom-8 {showScrollTop
		? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
		: 'pointer-events-none translate-y-5 scale-80 opacity-0'}"
	tabindex={showScrollTop ? 0 : -1}
	aria-hidden={!showScrollTop}
	aria-label={m.gis_scroll_top()}
	onclick={scrollToTop}
>
	<ArrowUp class="size-5" strokeWidth={2.4} />
</button>
