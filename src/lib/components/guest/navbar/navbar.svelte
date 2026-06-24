<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Select from '$lib/components/ui/select';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

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
	import { setupGsapPendulum, createMenuTimeline } from './navbar.svelte.js';
	import { ConfettiCannon } from 'svelte-canvas-confetti';
	import { playConfettiSound } from '$lib/utils/confetti-sound';
	import { onMount, tick } from 'svelte';
	import { navLinks } from '@/lib/config/navlinks';
	import { m } from '$lib/paraglide/messages';
	import { ArrowUpRight, X, Grid3x3 } from '@lucide/svelte';
	import gsap from 'gsap';

	let { resolvedResumeUrls = { en: '', id: '' } } = $props<{
		resolvedResumeUrls?: { en: string; id: string };
	}>();

	let locale = $state(getLocale());
	let isMenuOpen = $state(false);

	let navLinksData = $derived(navLinks[locale] || navLinks['en']);
	let fallbackResumeUrl = $derived(
		`https://raw.githubusercontent.com/mikeu-dev/portfolio-assets/main/docs/cv/riki-ruswandi-resume-(${locale}).pdf`
	);
	let resumeUrl = $derived(
		(locale === 'id' ? resolvedResumeUrls.id : resolvedResumeUrls.en) || fallbackResumeUrl
	);

	let anchorElement: HTMLAnchorElement;
	let headerElement: HTMLElement;
	let devSpan: HTMLElement;
	let menuOverlay: HTMLElement;
	let menuGridBg: HTMLElement;
	let menuControls: HTMLElement;
	let navItemEls: HTMLElement[] = $state([]);
	let menuTimeline: gsap.core.Timeline | null = null;

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

	$effect(() => {
		if (anchorElement && headerElement && devSpan) {
			const cleanup = setupGsapPendulum(anchorElement, headerElement, devSpan);
			return cleanup;
		}
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

		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isMenuOpen) closeMenu();
		};

		window.addEventListener('scroll', handleScroll);
		window.addEventListener('keydown', handleKeydown);

		menuTimeline = createMenuTimeline(menuOverlay, navItemEls, menuGridBg, menuControls);

		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('keydown', handleKeydown);
			clearTimeout(scrollTimeout);
		};
	});

	function openMenu() {
		isMenuOpen = true;
		document.body.style.overflow = 'hidden';
		menuTimeline?.play();
	}

	function closeMenu() {
		if (!menuTimeline) {
			isMenuOpen = false;
			document.body.style.overflow = '';
			return;
		}
		menuTimeline.eventCallback('onReverseComplete', () => {
			isMenuOpen = false;
			document.body.style.overflow = '';
			menuTimeline?.eventCallback('onReverseComplete', null);
		});
		menuTimeline.reverse();
	}

	function handleNavClick() {
		gsap.to(menuOverlay, { autoAlpha: 0, duration: 0.18, ease: 'power2.in' });
		isMenuOpen = false;
		document.body.style.overflow = '';
	}

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

<!-- Minimal fixed header -->
<header
	bind:this={headerElement}
	class="fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-out"
	class:translate-y-[-100%]={hideHeader}
>
	<div class="relative border-b-2 border-foreground bg-background/85 backdrop-blur-xl">
		<div
			class="pointer-events-none absolute inset-0 z-[-1] opacity-[0.02] mix-blend-overlay grayscale"
			style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
		></div>

		<div class="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-6 lg:px-12">
			<!-- Logo with pendulum -->
			<a
				href={localizeHref('/')}
				bind:this={anchorElement}
				class="group relative flex items-center gap-3"
			>
				<div
					class="relative size-9 overflow-hidden border-2 border-foreground"
					style="clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);"
				>
					<Avatar.Root class="size-full rounded-none!">
						<Avatar.Image
							src="https://github.com/mikeu-dev.png"
							alt="@mikeu-dev"
							class="rounded-none!"
						/>
						<Avatar.Fallback class="rounded-none!">RR</Avatar.Fallback>
					</Avatar.Root>
				</div>
				<div class="flex flex-col">
					<span class="font-poppins text-base leading-none font-black tracking-tighter uppercase">
						Mikeu<span class="text-primary">.</span>
					</span>
					<span
						bind:this={devSpan}
						class="mt-0.5 inline-block origin-bottom-right bg-primary px-2.5 py-0.5 font-mono text-[9px] font-black tracking-widest text-primary-foreground uppercase"
						style="clip-path: polygon(5% 0, 100% 0, 95% 100%, 0 100%);"
					>
						Dev
						<span class="absolute right-0.5 bottom-0.5 size-1 rounded-full bg-white"></span>
					</span>
				</div>
			</a>

			<!-- Right controls -->
			<div class="flex items-center gap-3">
				<!-- Desktop only: theme + locale -->
				<div class="hidden items-center gap-3 md:flex">
					<DropdownMenu.Root>
						<DropdownMenu.Trigger
							class="flex size-9 items-center justify-center border-2 border-foreground bg-background transition-all hover:bg-foreground hover:text-background"
							style="clip-path: polygon(15% 0, 100% 0, 85% 100%, 0 100%);"
						>
							<SunIcon class="size-3.5 scale-100 transition-transform dark:scale-0" />
							<MoonIcon class="absolute size-3.5 scale-0 transition-transform dark:scale-100" />
						</DropdownMenu.Trigger>
						<DropdownMenu.Content
							align="end"
							class="rounded-none! border-2 border-foreground font-mono text-[10px] font-black tracking-widest uppercase"
						>
							<DropdownMenu.Item
								onclick={() => setMode('light')}
								class="cursor-pointer hover:bg-primary! hover:text-primary-foreground!"
								>Light</DropdownMenu.Item
							>
							<DropdownMenu.Item
								onclick={() => setMode('dark')}
								class="cursor-pointer hover:bg-primary! hover:text-primary-foreground!"
								>Dark</DropdownMenu.Item
							>
							<DropdownMenu.Item
								onclick={() => resetMode()}
								class="cursor-pointer hover:bg-primary! hover:text-primary-foreground!"
								>System</DropdownMenu.Item
							>
						</DropdownMenu.Content>
					</DropdownMenu.Root>

					<Select.Root type="single" bind:value={locale}>
						<Select.Trigger
							class="h-9 w-20 border-2 border-foreground bg-background font-mono text-[10px] font-black tracking-widest! uppercase"
							style="clip-path: polygon(0 0, 85% 0, 100% 100%, 15% 100%);"
						>
							<div class="flex items-center gap-1.5">
								{#if locale === 'id'}<Id class="size-3" />ID{:else}<GbNir class="size-3" />EN{/if}
							</div>
						</Select.Trigger>
						<Select.Content
							class="rounded-none! border-2 border-foreground font-mono text-[10px] font-black tracking-widest uppercase"
						>
							<Select.Item value="id" class="cursor-pointer">ID</Select.Item>
							<Select.Item value="en" class="cursor-pointer">EN</Select.Item>
						</Select.Content>
					</Select.Root>

					<div class="h-6 w-px bg-foreground/15"></div>
				</div>

				<!-- MENU trigger -->
				<button
					onclick={openMenu}
					aria-label="Open navigation"
					aria-expanded={isMenuOpen}
					class="menu-trigger group flex h-9 items-center gap-2.5 border-2 border-foreground bg-background px-4 transition-all hover:bg-foreground hover:text-background"
				>
					<Grid3x3 class="size-3.5 transition-transform duration-300 group-hover:rotate-45" />
					<span class="font-mono text-[10px] font-black tracking-[0.25em] uppercase">Menu</span>
				</button>
			</div>
		</div>
	</div>
</header>

<!-- Flying scatter menu overlay — always in DOM, GSAP drives visibility -->
<div
	bind:this={menuOverlay}
	class="fixed inset-0 z-60 flex flex-col bg-background"
	style="visibility: hidden; opacity: 0;"
	role="dialog"
	aria-modal="true"
	aria-label="Navigation menu"
>
	<!-- Blueprint grid background -->
	<div bind:this={menuGridBg} class="pointer-events-none absolute inset-0" style="opacity: 0;">
		<svg class="h-full w-full text-foreground" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<pattern id="nav-grid-sm" width="32" height="32" patternUnits="userSpaceOnUse">
					<path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" stroke-width="0.3"></path>
				</pattern>
				<pattern id="nav-grid-lg" width="160" height="160" patternUnits="userSpaceOnUse">
					<rect width="160" height="160" fill="url(#nav-grid-sm)"></rect>
					<path d="M 160 0 L 0 0 0 160" fill="none" stroke="currentColor" stroke-width="0.8"></path>
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill="url(#nav-grid-lg)" opacity="0.06"></rect>
		</svg>
		<div
			class="absolute -top-32 -right-32 size-80 bg-primary/5"
			style="clip-path: polygon(0 0, 100% 0, 80% 100%, 0 80%);"
		></div>
		<div
			class="absolute -bottom-48 -left-48 size-125 bg-foreground/3"
			style="clip-path: polygon(20% 0, 100% 20%, 100% 100%, 0 100%);"
		></div>
	</div>

	<!-- Top bar -->
	<div
		class="relative z-10 flex shrink-0 items-center justify-between border-b-2 border-foreground px-6 py-4 lg:px-12"
	>
		<div class="flex items-center gap-3">
			<div
				class="h-2 w-2 bg-primary"
				style="clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);"
			></div>
			<span class="font-mono text-[10px] font-black tracking-[0.3em] text-primary uppercase">
				MIKEU.DEV // NAVIGATION
			</span>
		</div>
		<button
			onclick={closeMenu}
			aria-label="Close navigation"
			class="group flex size-10 items-center justify-center border-2 border-foreground transition-all hover:bg-foreground hover:text-background"
		>
			<X class="size-5 transition-transform duration-300 group-hover:rotate-90" />
		</button>
	</div>

	<!-- Nav items: each bound for GSAP stagger -->
	<nav class="relative z-10 flex flex-1 flex-col justify-center overflow-hidden px-6 lg:px-12">
		{#each navLinksData as link, i (link.href)}
			<a
				href={localizeHref(link.href)}
				onclick={handleNavClick}
				bind:this={navItemEls[i]}
				class="nav-item group flex items-center gap-5 border-b border-foreground/10 py-3 transition-all duration-300 hover:translate-x-3 lg:py-4"
				class:is-active={currentPath === link.href}
			>
				<span
					class="w-7 shrink-0 font-mono text-[10px] font-black text-muted-foreground transition-colors group-hover:text-primary"
				>
					0{i + 1}
				</span>
				<div
					class="h-5 w-px shrink-0 bg-foreground/20 transition-colors group-hover:bg-primary/40"
				></div>
				<span
					class="flex-1 font-poppins text-3xl font-black tracking-tighter uppercase transition-colors sm:text-4xl lg:text-5xl xl:text-6xl"
				>
					{link.label}
				</span>
				<div
					class="shrink-0 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100"
				>
					<ArrowUpRight class="size-6 lg:size-8" />
				</div>
			</a>
		{/each}
	</nav>

	<!-- Bottom controls -->
	<div
		bind:this={menuControls}
		class="relative z-10 shrink-0 border-t-2 border-foreground px-6 py-5 lg:px-12"
		style="opacity: 0; transform: translateY(28px);"
	>
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div class="flex flex-wrap items-center gap-2">
				<button
					onclick={() => setMode('light')}
					class="flex size-9 items-center justify-center border border-foreground/40 transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
				>
					<SunIcon class="size-3.5" />
				</button>
				<button
					onclick={() => setMode('dark')}
					class="flex size-9 items-center justify-center border border-foreground/40 transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
				>
					<MoonIcon class="size-3.5" />
				</button>
				<button
					onclick={() => resetMode()}
					class="h-9 border border-foreground/40 px-3 font-mono text-[9px] font-black tracking-widest uppercase transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
				>
					SYS
				</button>
				<div class="mx-1 h-5 w-px bg-foreground/20"></div>
				<button
					onclick={() => (locale = 'id')}
					class="flex h-9 items-center gap-1.5 border px-3 font-mono text-[9px] font-black uppercase transition-colors {locale ===
					'id'
						? 'border-primary bg-primary text-primary-foreground'
						: 'border-foreground/40'}"
				>
					<Id class="size-3" /> ID
				</button>
				<button
					onclick={() => (locale = 'en')}
					class="flex h-9 items-center gap-1.5 border px-3 font-mono text-[9px] font-black uppercase transition-colors {locale ===
					'en'
						? 'border-primary bg-primary text-primary-foreground'
						: 'border-foreground/40'}"
				>
					<GbNir class="size-3" /> EN
				</button>
			</div>

			<div class="flex items-center gap-3">
				<InstallButton />
				{#if isLoggedIn}
					<button
						onclick={handleSignOut}
						class="hover:text-destructive-foreground h-9 border-2 border-destructive px-4 font-mono text-[9px] font-black tracking-widest text-destructive uppercase transition-all hover:bg-destructive"
					>
						Sign Out
					</button>
				{:else}
					<a
						href={resumeUrl}
						onclick={makeConfettiCannon}
						download
						class="resume-btn-origami flex h-10 items-center gap-2 bg-primary px-5 font-poppins text-[10px] font-black tracking-tighter text-primary-foreground uppercase transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-foreground hover:shadow-[4px_4px_0_var(--primary)] active:translate-x-0 active:translate-y-0 active:shadow-none"
					>
						{m.nav_cv_button()}
						<ArrowUpRight class="size-3.5" />
					</a>
				{/if}
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	@reference "tailwindcss";

	header {
		perspective: 1000px;
	}

	.menu-trigger {
		clip-path: polygon(5% 0, 100% 0, 95% 100%, 0 100%);
		transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
	}

	.menu-trigger:hover {
		clip-path: polygon(0 0, 95% 5%, 100% 100%, 5% 95%);
	}

	/* Active nav item: color the number and label */
	.nav-item.is-active > span:first-child,
	.nav-item.is-active > span:nth-child(3) {
		color: var(--color-primary);
	}

	.resume-btn-origami {
		clip-path: polygon(5% 0, 100% 0, 95% 100%, 0 100%);
		transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
	}

	.resume-btn-origami:hover {
		clip-path: polygon(0 0, 95% 5%, 100% 100%, 5% 95%);
	}
</style>
