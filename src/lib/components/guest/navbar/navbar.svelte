<script lang="ts">
	import { page } from '$app/state';
	import { auth } from '$lib/firebase/firebase.client';
	import { toast } from 'svelte-sonner';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import Id from 'svelte-flags/Id.svelte';
	import GbNir from 'svelte-flags/GbNir.svelte';
	import { resetMode, setMode } from 'mode-watcher';
	import { signOut } from 'firebase/auth';
	import { authState } from '$lib/stores/auth.svelte';
	import InstallButton from '../pwa/InstallButton.svelte';
	import { getLocale, setLocale, localizeHref } from '$lib/paraglide/runtime';
	import { ConfettiCannon } from 'svelte-canvas-confetti';
	import { playConfettiSound } from '$lib/utils/confetti-sound';
	import { onMount, tick } from 'svelte';
	import { navLinks } from '@/lib/config/navlinks';
	import { m } from '$lib/paraglide/messages';
	import { ArrowUpRight } from '@lucide/svelte';

	let { resolvedResumeUrls = { en: '', id: '' } } = $props<{
		resolvedResumeUrls?: { en: string; id: string };
	}>();

	let locale = $state(getLocale());

	let navLinksData = $derived(navLinks[locale] || navLinks['id']);
	let topLeftLinks = $derived(navLinksData.slice(0, 3));
	let topRightLinks = $derived(navLinksData.slice(3));

	let fallbackResumeUrl = $derived(
		`https://raw.githubusercontent.com/mikeu-dev/portfolio-assets/main/docs/cv/riki-ruswandi-resume-(${locale}).pdf`
	);
	let resumeUrl = $derived(
		(locale === 'id' ? resolvedResumeUrls.id : resolvedResumeUrls.en) || fallbackResumeUrl
	);

	let lastScrollTop = 0;
	let hideHeader = $state(false);

	let confettiCannon = $state(false);
	const makeConfettiCannon = async () => {
		confettiCannon = false;
		await tick();
		confettiCannon = true;
		playConfettiSound();
	};

	let isLoggedIn = $derived(Boolean(authState.user));
	let currentPath = $derived(page.url.pathname || '');

	$effect(() => {
		if (locale) setLocale(locale);
	});

	onMount(() => {
		let scrollTimeout: ReturnType<typeof setTimeout>;
		const handleScroll = () => {
			const currentScroll = window.scrollY;
			if (currentScroll > lastScrollTop && currentScroll > 50) {
				hideHeader = true;
			} else {
				hideHeader = false;
			}
			lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
			clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(() => {
				hideHeader = false;
			}, 150);
		};

		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
			clearTimeout(scrollTimeout);
		};
	});

	async function handleSignOut() {
		try {
			await signOut(auth);
			const res = await fetch('/api/auth', { method: 'DELETE' });
			if (res.ok) {
				toast.success('Signed out successfully');
				window.location.reload();
			} else toast.error('Sign out failed');
		} catch (e: unknown) {
			console.error('Sign out error:', e);
			toast.error('An error occurred during sign out.');
		}
	}
</script>

{#if confettiCannon}
	<ConfettiCannon
		origin={[window.innerWidth / 2, window.innerHeight]}
		angle={-90}
		spread={35}
		force={35}
	/>
{/if}

<!-- Invisible chrome: no bar, no background, no logo — just floating corner links -->
<div class="pointer-events-none fixed inset-0 z-50 text-foreground">
	<!-- Top-left nav links -->
	<nav
		aria-label="Main navigation"
		class="nav-cluster pointer-events-auto absolute top-4 left-4 flex items-center gap-4 sm:top-6 sm:left-6 sm:gap-6"
		class:nav-cluster-hidden-top={hideHeader}
	>
		{#each topLeftLinks as link (link.href)}
			<a
				href={localizeHref(link.href)}
				class="nav-link relative font-mono text-[10px] font-black tracking-widest uppercase {currentPath ===
				link.href
					? 'text-primary'
					: ''}"
			>
				{link.label}
				<span class="nav-underline"></span>
			</a>
		{/each}
	</nav>

	<!-- Top-right nav links -->
	<nav
		aria-label="Main navigation"
		class="nav-cluster pointer-events-auto absolute top-4 right-4 flex items-center gap-4 sm:top-6 sm:right-6 sm:gap-6"
		class:nav-cluster-hidden-top={hideHeader}
	>
		{#each topRightLinks as link (link.href)}
			<a
				href={localizeHref(link.href)}
				class="nav-link relative font-mono text-[10px] font-black tracking-widest uppercase {currentPath ===
				link.href
					? 'text-primary'
					: ''}"
			>
				{link.label}
				<span class="nav-underline"></span>
			</a>
		{/each}
	</nav>

	<!-- Bottom-left: theme + locale -->
	<div
		class="nav-cluster pointer-events-auto absolute bottom-4 left-4 flex items-center gap-4 sm:bottom-6 sm:left-6"
		class:nav-cluster-hidden-bottom={hideHeader}
	>
		<button onclick={() => setMode('light')} aria-label="Light mode" class="nav-link relative flex">
			<SunIcon class="size-3.5" />
			<span class="nav-underline"></span>
		</button>
		<button onclick={() => setMode('dark')} aria-label="Dark mode" class="nav-link relative flex">
			<MoonIcon class="size-3.5" />
			<span class="nav-underline"></span>
		</button>
		<button
			onclick={() => resetMode()}
			class="nav-link relative font-mono text-[10px] font-black tracking-widest uppercase"
		>
			Sys
			<span class="nav-underline"></span>
		</button>
		<div class="h-3 w-px bg-foreground/20"></div>
		<button
			onclick={() => (locale = 'id')}
			class="nav-link relative flex items-center gap-1 font-mono text-[10px] font-black uppercase {locale ===
			'id'
				? 'text-primary'
				: ''}"
		>
			<Id class="size-3" /> ID
			<span class="nav-underline"></span>
		</button>
		<button
			onclick={() => (locale = 'en')}
			class="nav-link relative flex items-center gap-1 font-mono text-[10px] font-black uppercase {locale ===
			'en'
				? 'text-primary'
				: ''}"
		>
			<GbNir class="size-3" /> EN
			<span class="nav-underline"></span>
		</button>
	</div>

	<!-- Bottom-right: PWA install / resume / sign-out -->
	<div
		class="nav-cluster pointer-events-auto absolute right-4 bottom-4 flex items-center gap-4 sm:right-6 sm:bottom-6"
		class:nav-cluster-hidden-bottom={hideHeader}
	>
		<InstallButton />
		{#if isLoggedIn}
			<button
				onclick={handleSignOut}
				class="nav-link relative font-mono text-[10px] font-black tracking-widest text-destructive uppercase"
			>
				Sign Out
				<span class="nav-underline"></span>
			</button>
		{:else}
			<a
				href={resumeUrl}
				onclick={makeConfettiCannon}
				download
				class="nav-link relative flex items-center gap-1.5 font-mono text-[10px] font-black tracking-widest uppercase"
			>
				{m.nav_cv_button()}
				<ArrowUpRight class="size-3" />
				<span class="nav-underline"></span>
			</a>
		{/if}
	</div>
</div>

<style lang="postcss">
	@reference "tailwindcss";

	.nav-cluster {
		transition:
			opacity 0.5s ease-out,
			transform 0.5s ease-out;
	}

	.nav-cluster-hidden-top {
		opacity: 0;
		pointer-events: none;
		transform: translateY(-0.75rem);
	}

	.nav-cluster-hidden-bottom {
		opacity: 0;
		pointer-events: none;
		transform: translateY(0.75rem);
	}

	.nav-link {
		padding: 0;
		padding-bottom: 2px;
		background: transparent;
		border: none;
		color: inherit;
		cursor: pointer;
	}

	.nav-underline {
		position: absolute;
		bottom: 0;
		left: 0;
		height: 1px;
		width: 100%;
		background: currentColor;
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 0.3s ease;
	}

	.nav-link:hover .nav-underline,
	.nav-link:focus-visible .nav-underline {
		transform: scaleX(1);
	}
</style>
