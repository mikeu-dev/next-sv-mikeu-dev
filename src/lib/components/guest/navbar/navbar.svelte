<script lang="ts">
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import { toggleMode } from 'mode-watcher';
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
	// Session from the server (hooks verify the __session cookie). Reading it
	// here instead of Firebase Auth keeps the Firebase SDK — and the
	// apis.google.com script it pulls in — off every public page.
	let isLoggedIn = $derived(Boolean(page.data.user));
	let currentPath = $derived(deLocalizeHref(page.url.pathname || '/'));
	// On the home page (desktop) the hero draws the glass shards behind this
	// navbar, so the navbar itself stays transparent there.
	let overlay = $derived(page.route.id === '/');

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
			const [{ auth }, { signOut }] = await Promise.all([
				import('#lib/firebase/firebase.client.js'),
				import('firebase/auth')
			]);
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

	// Shard surface: solid panel on inner pages; transparent on the desktop home hero.
	let surface = $derived(
		overlay ? 'bg-card/95 lg:bg-transparent' : 'bg-card/95 supports-[backdrop-filter]:bg-card/90'
	);
</script>

{#if confettiCannon}
	<ConfettiCannon
		origin={[window.innerWidth / 2, window.innerHeight]}
		angle={-90}
		spread={35}
		force={35}
	/>
{/if}

{#snippet themeToggle()}
	<button
		type="button"
		onclick={toggleMode}
		aria-label={m.gis_nav_theme()}
		class="relative flex size-11 flex-none items-center justify-center rounded-leaf-sm-r text-foreground hover:bg-white/75 dark:hover:bg-white/10"
	>
		<SunIcon
			class="size-[18px] scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90"
		/>
		<MoonIcon
			class="absolute size-[18px] scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0"
		/>
	</button>
{/snippet}

{#snippet localeSwitch(big: boolean)}
	<div
		role="group"
		aria-label={m.gis_nav_language()}
		class={big
			? 'flex gap-2 font-mono font-semibold'
			: 'flex items-center gap-0.5 font-mono text-xs font-semibold'}
	>
		{#each ['id', 'en'] as const as loc, i (loc)}
			<button
				type="button"
				onclick={() => setLocale(loc)}
				aria-pressed={locale === loc}
				class={big
					? `flex min-h-12 flex-1 items-center justify-center uppercase ${i ? 'rounded-leaf-r' : 'rounded-leaf'} ${locale === loc ? 'bg-card text-foreground shadow-[inset_0_0_0_1.5px_var(--primary)]' : 'bg-well text-muted-foreground'}`
					: `flex h-8 items-center px-2.5 uppercase ${i ? 'rounded-[6px_12px_6px_12px]' : 'rounded-leaf-xs'} ${locale === loc ? 'bg-white/85 text-[#25272b]' : 'text-muted-foreground hover:text-foreground'}`}
			>
				{loc}
			</button>
		{/each}
	</div>
{/snippet}

{#snippet resumeCta(block: boolean)}
	{#if isLoggedIn}
		<button
			type="button"
			onclick={handleSignOut}
			class="btn-pill-line min-h-[46px] flex-none px-5 text-[15px] {block ? 'w-full' : ''}"
		>
			Sign out
		</button>
	{:else}
		<a
			href={resumeUrl}
			onclick={makeConfettiCannon}
			download
			class="btn-pill-solid min-h-[46px] flex-none gap-2 px-5 text-[15px] whitespace-nowrap {block
				? 'min-h-[54px] w-full'
				: ''}"
		>
			<svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
				<path
					d="M10 3v9M6 8l4 4 4-4M4 15h12"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			{m.nav_cv_button()}
		</a>
	{/if}
{/snippet}

<header class="intro-hide pointer-events-none absolute inset-x-0 top-0 z-40 [--in:500ms]">
	<div class="flex items-start gap-2.5 p-3 sm:p-4 {overlay ? 'shard lg:[filter:none]' : 'shard'}">
		<!-- Logo shard -->
		<a
			href={localizeHref('/')}
			aria-label="mikeu.gis"
			class="pointer-events-auto flex h-16 w-16 flex-none items-center justify-center rounded-[24px_10px_24px_24px] sm:h-[76px] sm:w-[100px] sm:rounded-[30px_12px_30px_30px] {surface}"
		>
			<MapLogo size={40} text={false} dot />
		</a>

		<!-- Nav shard -->
		<nav
			aria-label="Main navigation"
			class="pointer-events-auto flex h-16 min-w-0 flex-1 items-center gap-1 rounded-[10px_24px_24px_24px] pr-2 pl-4 sm:h-[76px] sm:pr-3.5 sm:pl-[22px] lg:rounded-[12px_0_30px_30px] {surface}"
		>
			<span
				class="mr-3.5 text-[19px] font-black tracking-[-0.01em] whitespace-nowrap sm:text-[21px]"
				>mikeu<span class="text-primary">.gis</span></span
			>
			<div class="hidden min-w-0 flex-1 items-center gap-0.5 overflow-hidden lg:flex">
				{#each links as link, i (link.href)}
					<a
						href={localizeHref(link.href)}
						aria-current={isActive(link.href) ? 'page' : undefined}
						class="flex min-h-11 items-center px-3.5 text-base transition-colors {i % 2
							? 'rounded-leaf-sm-r'
							: 'rounded-leaf-sm'} {isActive(link.href)
							? 'bg-primary/12 font-extrabold text-primary'
							: 'font-bold text-foreground hover:bg-white/75 dark:hover:bg-white/10'}"
					>
						{link.label}
					</a>
				{/each}
			</div>
			<div class="ml-auto flex items-center gap-1">
				{@render themeToggle()}
				<div class="hidden items-center gap-1 lg:flex">
					<InstallButton />
					{@render resumeCta(false)}
				</div>
				<button
					type="button"
					onclick={() => (menuOpen = !menuOpen)}
					aria-expanded={menuOpen}
					aria-controls="mobile-menu"
					aria-label={menuOpen ? m.gis_nav_menu_close() : m.gis_nav_menu_open()}
					class="flex size-12 items-center justify-center rounded-leaf-sm bg-well lg:hidden"
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

		<!-- Language shard (desktop) -->
		<div
			class="pointer-events-auto -ml-2.5 hidden h-10 w-[110px] flex-none items-center justify-center rounded-[0_30px_30px_0] lg:flex {overlay
				? 'lg:bg-transparent'
				: 'ext-down bg-card/95'}"
		>
			{@render localeSwitch(false)}
		</div>
	</div>

	{#if menuOpen}
		<div
			id="mobile-menu"
			class="sheet glass pointer-events-auto mx-3 flex flex-col gap-1.5 rounded-[30px] p-3 pb-4 sm:mx-4 lg:hidden"
		>
			{#each links as link, i (link.href)}
				<a
					href={localizeHref(link.href)}
					aria-current={isActive(link.href) ? 'page' : undefined}
					class="flex min-h-14 items-center justify-between px-[18px] text-xl font-black {i % 2
						? 'rounded-leaf-r'
						: 'rounded-leaf'} {isActive(link.href)
						? 'bg-primary/12 text-primary'
						: 'text-foreground hover:bg-white/60 dark:hover:bg-white/10'}"
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
			<div class="mt-2">{@render localeSwitch(true)}</div>
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
