<script lang="ts">
	import { page } from '$app/state';
	import { auth } from '#lib/firebase/firebase.client.js';
	import { toast } from 'svelte-sonner';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import { toggleMode } from 'mode-watcher';
	import { signOut } from 'firebase/auth';
	import { authState } from '#lib/stores/auth.svelte.js';
	import InstallButton from '../pwa/InstallButton.svelte';
	import { getLocale, setLocale, localizeHref, deLocalizeHref } from '#lib/paraglide/runtime.js';
	import { ConfettiCannon } from 'svelte-canvas-confetti';
	import { playConfettiSound } from '#lib/utils/confetti-sound.js';
	import { tick } from 'svelte';
	import { navLinks } from '@/lib/config/navlinks';
	import { m } from '#lib/paraglide/messages.js';
	import MapLogo from '../map/map-logo.svelte';

	let { resolvedResumeUrls = { en: '', id: '' } } = $props<{
		resolvedResumeUrls?: { en: string; id: string };
	}>();

	const locale = getLocale();
	const links = navLinks[locale] || navLinks['id'];

	let fallbackResumeUrl = $derived(
		`https://raw.githubusercontent.com/mikeu-dev/portfolio-assets/main/docs/cv/riki-ruswandi-resume-(${locale}).pdf`
	);
	let resumeUrl = $derived(
		(locale === 'id' ? resolvedResumeUrls.id : resolvedResumeUrls.en) || fallbackResumeUrl
	);

	let menuOpen = $state(false);
	let confettiCannon = $state(false);
	let isLoggedIn = $derived(Boolean(authState.user));
	let currentPath = $derived(deLocalizeHref(page.url.pathname || '/'));

	// Close the mobile sheet whenever the route changes.
	$effect(() => {
		void page.url.pathname;
		menuOpen = false;
	});

	function isActive(href: string) {
		return href === '/' ? currentPath === '/' : currentPath.startsWith(href);
	}

	const makeConfettiCannon = async () => {
		confettiCannon = false;
		await tick();
		confettiCannon = true;
		playConfettiSound();
	};

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

{#snippet localeSwitch(size: 'sm' | 'lg')}
	<div
		role="group"
		aria-label={m.gis_nav_language()}
		class={size === 'sm'
			? 'mx-1.5 flex items-center gap-0.5 rounded-full bg-secondary p-1 font-mono text-xs font-semibold'
			: 'flex gap-2 font-mono font-semibold'}
	>
		{#each ['id', 'en'] as const as loc (loc)}
			<button
				type="button"
				onclick={() => setLocale(loc)}
				aria-pressed={locale === loc}
				class={size === 'sm'
					? `rounded-full px-2.5 py-2 uppercase ${locale === loc ? 'bg-card text-foreground' : 'text-muted-foreground hover:text-foreground'}`
					: `flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-card uppercase ${locale === loc ? 'border-[1.5px] border-primary text-foreground' : 'border border-border text-muted-foreground'}`}
			>
				{loc}
			</button>
		{/each}
	</div>
{/snippet}

{#snippet themeToggle()}
	<button
		type="button"
		onclick={toggleMode}
		aria-label={m.gis_nav_theme()}
		class="relative flex size-11 items-center justify-center rounded-full text-ink-soft hover:bg-secondary hover:text-foreground"
	>
		<SunIcon
			class="size-[18px] scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90"
		/>
		<MoonIcon
			class="absolute size-[18px] scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0"
		/>
	</button>
{/snippet}

{#snippet resumeCta(block: boolean)}
	{#if isLoggedIn}
		<button
			type="button"
			onclick={handleSignOut}
			class="btn-pill-line min-h-11 px-5 text-base {block ? 'w-full' : ''}"
		>
			Sign out
		</button>
	{:else}
		<a
			href={resumeUrl}
			onclick={makeConfettiCannon}
			download
			class="btn-pill-solid px-[22px] text-base {block ? 'min-h-[54px] w-full' : ''}"
		>
			{m.nav_cv_button()}
		</a>
	{/if}
{/snippet}

<header class="pointer-events-none absolute inset-x-0 top-0 z-40">
	<nav
		aria-label="Main navigation"
		class="pointer-events-auto mx-4 mt-3 flex items-center justify-between gap-3 rounded-full border border-border bg-card py-2 pr-2 pl-4 shadow-float sm:mx-[clamp(16px,3vw,40px)] sm:mt-5 sm:py-2.5 sm:pr-3 sm:pl-5"
	>
		<a href={localizeHref('/')} class="flex min-h-11 items-center gap-2.5 text-foreground">
			<MapLogo />
		</a>

		<!-- Desktop -->
		<div class="hidden flex-wrap items-center gap-0.5 xl:flex">
			{#each links as link (link.href)}
				<a
					href={localizeHref(link.href)}
					aria-current={isActive(link.href) ? 'page' : undefined}
					class="rounded-full px-3.5 py-3 text-base font-bold transition-colors {isActive(link.href)
						? 'bg-accent text-primary'
						: 'text-ink-soft hover:bg-secondary hover:text-foreground'}"
				>
					{link.label}
				</a>
			{/each}
			{@render localeSwitch('sm')}
			{@render themeToggle()}
			<InstallButton />
			{@render resumeCta(false)}
		</div>

		<!-- Mobile / tablet -->
		<div class="flex items-center gap-1 xl:hidden">
			{@render themeToggle()}
			<button
				type="button"
				onclick={() => (menuOpen = !menuOpen)}
				aria-expanded={menuOpen}
				aria-controls="mobile-menu"
				aria-label={menuOpen ? m.gis_nav_menu_close() : m.gis_nav_menu_open()}
				class="flex size-12 items-center justify-center rounded-2xl border border-border bg-card"
			>
				<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
					{#if menuOpen}
						<path
							d="M5 5l10 10M15 5L5 15"
							stroke="currentColor"
							stroke-width="2.2"
							stroke-linecap="round"
						/>
					{:else}
						<path
							d="M3 6h14M3 10h14M3 14h9"
							stroke="currentColor"
							stroke-width="2.2"
							stroke-linecap="round"
						/>
					{/if}
				</svg>
			</button>
		</div>
	</nav>

	{#if menuOpen}
		<div
			id="mobile-menu"
			class="sheet pointer-events-auto mx-4 mt-2 flex flex-col gap-1.5 rounded-[28px] border border-border bg-background p-3 pb-5 shadow-card xl:hidden"
		>
			{#each links as link (link.href)}
				<a
					href={localizeHref(link.href)}
					aria-current={isActive(link.href) ? 'page' : undefined}
					class="flex min-h-14 items-center justify-between rounded-[18px] px-[18px] text-xl font-black {isActive(
						link.href
					)
						? 'bg-accent text-primary'
						: 'text-foreground hover:bg-secondary'}"
				>
					{link.label}
					<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
						<path
							d="M7 4l5 5-5 5"
							fill="none"
							stroke="currentColor"
							stroke-width="2.2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</a>
			{/each}
			<div class="mt-2">{@render localeSwitch('lg')}</div>
			<InstallButton class="w-full" />
			{@render resumeCta(true)}
		</div>
	{/if}
</header>

<style>
	.sheet {
		animation: sheet 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both;
	}
	@keyframes sheet {
		from {
			opacity: 0;
			transform: translateY(-12px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.sheet {
			animation: none;
		}
	}
</style>
