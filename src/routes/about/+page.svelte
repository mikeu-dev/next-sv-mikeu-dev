<script lang="ts">
	import type { PageData } from './$types';
	import type { TechStackCategory, JourneyItem } from '#lib/types.js';
	import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocalizedTag } from '#lib/utils/project-mapper.js';
	import { optimizeImage } from '#lib/utils/image.util.js';
	import { toast } from 'svelte-sonner';
	import Icon from '#lib/components/ui/icon.svelte';
	import SEO from '#lib/components/seo/seo.svelte';
	import JourneyRoute from '#lib/components/guest/sections/journey/journey-route.svelte';
	import { PUBLIC_CONTACT_EMAIL } from '$app/env/public';

	let { data }: { data: PageData } = $props();
	const locale = getLocale();
	const email = PUBLIC_CONTACT_EMAIL || 'rikiruswandi28@gmail.com';

	let resumeUrl = $state(
		`https://raw.githubusercontent.com/mikeu-dev/portfolio-assets/main/docs/cv/riki-ruswandi-resume-(${locale}).pdf`
	);
	$effect(() => {
		data.resumeUrls.then((urls) => {
			const url = locale === 'id' ? urls.id : urls.en;
			if (url) resumeUrl = url;
		});
	});

	let techstack = $derived(
		((data?.techStack?.[locale] || data?.techStack?.['id'] || []) as TechStackCategory[]).map(
			(category) => ({
				...category,
				items: (category.items || []).map((item) => getLocalizedTag(item))
			})
		)
	);
	let journey = $derived((data?.journey?.[locale] || data?.journey?.['id'] || []) as JourneyItem[]);

	// Skill-layer toggles: every category starts visible.
	let hidden = $state<Record<string, boolean>>({});
	let shown = $derived(techstack.filter((c) => !hidden[c.category]));
	const ICONS = [
		'M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4',
		'M12 3l8 4v10l-8 4-8-4V7z',
		'M4 18l5-8 4 5 7-11',
		'M12 4v16M4 12h16'
	];

	let copied = $state(false);
	async function copyEmail() {
		try {
			await navigator.clipboard.writeText(email);
			copied = true;
			toast.success(m.gis_email_copied());
		} catch {
			toast.error('Failed to copy email');
		}
	}
</script>

<SEO title={m.about_title()} description={m.about_subtitle()} />

<header class="relative overflow-hidden bg-secondary pt-24 pb-10 sm:pt-28">
	<img
		src="/images/map/band-basemap.svg"
		alt=""
		aria-hidden="true"
		class="map-art absolute inset-0 block size-full object-cover object-[50%_30%]"
	/>
	<img
		src="/images/map/band-buildings.svg"
		alt=""
		aria-hidden="true"
		class="map-art map-rise absolute inset-0 block size-full object-cover object-[50%_30%]"
		style="animation-delay: .3s"
	/>
	<div class="relative mx-[clamp(16px,4vw,56px)] mt-4 flex flex-wrap items-stretch gap-5 sm:mt-10">
		<div
			class="flex flex-[1_1_520px] flex-col gap-[18px] rounded-[32px] border border-border bg-card p-[clamp(24px,3vw,40px)] shadow-card"
		>
			<p class="eyebrow">{m.gis_about_eyebrow()}</p>
			<h1 class="m-0 text-[clamp(40px,5vw,68px)] leading-[1.02] font-black tracking-[-0.03em]">
				{m.gis_about_title()}
			</h1>
			<p class="m-0 text-lg leading-[1.65] text-ink-soft">{m.gis_about_lead()}</p>
			<div class="flex flex-wrap gap-2.5">
				<a href={resumeUrl} download class="btn-pill-solid min-h-[52px] px-[26px]"
					>{m.about_hero_resume()}</a
				>
				<button type="button" onclick={copyEmail} class="btn-pill-line min-h-[52px]">
					{copied ? m.gis_email_copied() : m.gis_copy_email()}
				</button>
			</div>
		</div>
		<div
			class="flex flex-[0_1_360px] flex-col gap-3.5 rounded-[32px] border border-border bg-card p-[22px] shadow-card"
		>
			<div class="flex items-center gap-3.5">
				<img
					src={optimizeImage('https://github.com/mikeu-dev.png', { width: 160, quality: 80 })}
					alt="Riki Ruswandi"
					width="72"
					height="72"
					class="size-[72px] flex-none rounded-3xl bg-primary object-cover"
				/>
				<span class="flex flex-col gap-0.5">
					<span class="text-[22px] font-black">Mikeu</span>
					<span class="font-mono text-[13px] text-muted-foreground">{m.gis_about_alias()}</span>
				</span>
			</div>
			<dl class="m-0 flex flex-col gap-2.5 font-mono text-sm">
				<div class="flex justify-between gap-3">
					<dt class="text-muted-foreground">{m.gis_role()}</dt>
					<dd class="m-0 text-right font-semibold">Software Engineer</dd>
				</div>
				<div class="flex justify-between gap-3">
					<dt class="text-muted-foreground">{m.gis_base()}</dt>
					<dd class="m-0 text-right font-semibold">{m.gis_base_value()}</dd>
				</div>
				<div class="flex justify-between gap-3">
					<dt class="text-muted-foreground">{m.gis_coords()}</dt>
					<dd class="m-0 text-right font-semibold">6.5569° S, 107.4431° E</dd>
				</div>
				<div class="flex items-center justify-between gap-3">
					<dt class="text-muted-foreground">{m.gis_status()}</dt>
					<dd class="m-0 flex items-center gap-2 font-semibold">
						<span class="relative size-2.5 rounded-full bg-success">
							<span
								class="absolute inset-0 animate-ping rounded-full bg-success motion-reduce:animate-none"
							></span>
						</span>
						{m.gis_status_open()}
					</dd>
				</div>
			</dl>
			<div class="flex flex-wrap gap-1.5">
				<span class="rounded-full bg-accent px-3 py-1.5 text-[13px] font-extrabold text-primary"
					>Svelte expert</span
				>
				<span class="rounded-full bg-accent px-3 py-1.5 text-[13px] font-extrabold text-primary"
					>GIS engineer</span
				>
			</div>
		</div>
	</div>
</header>

<div
	class="mx-auto box-border flex max-w-[1440px] flex-col gap-20 px-[clamp(16px,4vw,56px)] pt-[72px] pb-24"
>
	{#if techstack.length}
		<section aria-labelledby="craft" class="flex flex-col gap-7">
			<div class="map-reveal flex max-w-[720px] flex-col gap-3.5">
				<p class="eyebrow">{m.gis_craft_eyebrow()}</p>
				<h2
					id="craft"
					class="m-0 text-[clamp(34px,4.2vw,56px)] leading-[1.05] font-black tracking-[-0.025em]"
				>
					{m.gis_craft_title()}
				</h2>
				<p class="m-0 text-[17px] leading-relaxed text-ink-soft">{m.gis_craft_lead()}</p>
			</div>
			<div class="flex flex-wrap items-start gap-5">
				<div
					role="group"
					aria-label={m.gis_skill_layers()}
					class="map-card flex flex-[1_1_280px] flex-col gap-1.5 p-3"
				>
					{#each techstack as c (c.category)}
						{@const on = !hidden[c.category]}
						<button
							type="button"
							aria-pressed={on}
							onclick={() => (hidden[c.category] = on)}
							class="flex min-h-14 items-center gap-3 rounded-[18px] px-3 py-2 text-left text-foreground transition-colors {on
								? 'bg-accent'
								: 'hover:bg-secondary'}"
						>
							<span
								class="relative h-5 w-[34px] flex-none rounded-full {on
									? 'bg-primary'
									: 'bg-line-strong'}"
							>
								<span
									class="absolute top-[3px] size-3.5 rounded-full bg-white transition-[left] duration-200"
									style="left: {on ? 17 : 3}px"
								></span>
							</span>
							<span class="flex-1 text-base font-black">{c.category}</span>
							<span class="font-mono text-xs text-muted-foreground">{c.items.length}</span>
						</button>
					{/each}
				</div>
				<div class="flex min-w-0 flex-[999_1_560px] flex-col gap-4">
					{#each shown as c (c.category)}
						<div
							class="flex flex-col gap-3 rounded-3xl border border-border bg-card px-[22px] py-5"
						>
							<span class="flex items-center gap-2.5 text-lg font-black">
								<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
									<path
										d={ICONS[techstack.indexOf(c) % ICONS.length]}
										fill="none"
										stroke="var(--primary)"
										stroke-width="2.2"
										stroke-linejoin="round"
										stroke-linecap="round"
									/>
								</svg>
								{c.category}
							</span>
							{#if c.description}<p class="m-0 text-[15px] text-ink-soft">{c.description}</p>{/if}
							<span class="flex flex-wrap gap-2">
								{#each c.items as item (item.name)}
									<span
										class="flex items-center gap-2 rounded-full bg-secondary px-3.5 py-2 text-[15px] font-extrabold"
									>
										{#if item.icon}<Icon src={item.icon} size={15} label={item.name} />{/if}
										{item.name}
									</span>
								{/each}
							</span>
						</div>
					{/each}
				</div>
			</div>
			<blockquote
				class="map-reveal m-0 rounded-[28px] bg-primary px-8 py-7 text-[clamp(20px,2vw,26px)] leading-[1.45] font-extrabold text-primary-foreground"
			>
				{m.gis_quote()}
			</blockquote>
		</section>
	{/if}

	{#if journey.length}
		<section aria-labelledby="jrn" class="flex flex-col gap-7">
			<h2
				id="jrn"
				class="map-reveal m-0 text-[clamp(34px,4.2vw,56px)] leading-[1.05] font-black tracking-[-0.025em]"
			>
				{m.gis_journey_page_title()}
			</h2>
			<div class="max-w-[900px]"><JourneyRoute items={journey} /></div>
		</section>
	{/if}

	<section aria-labelledby="fun" class="flex flex-col gap-7">
		<div class="map-reveal flex max-w-[760px] flex-col gap-3.5">
			<p class="eyebrow">{m.gis_fun_eyebrow()}</p>
			<h2
				id="fun"
				class="m-0 text-[clamp(34px,4.2vw,56px)] leading-[1.05] font-black tracking-[-0.025em]"
			>
				{m.gis_fun_title()}
			</h2>
		</div>
		<div class="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-4">
			<div class="map-card map-reveal flex flex-col gap-3 rounded-3xl p-6">
				<span class="text-xl font-black">{m.gis_fun_growth()}</span>
				<span class="text-base leading-normal text-ink-soft">{m.gis_fun_growth_desc()}</span>
			</div>
			<div class="map-card map-reveal flex flex-col gap-3 rounded-3xl p-6">
				<span class="text-xl font-black">{m.gis_fun_detail()}</span>
				<span class="text-base leading-normal text-ink-soft">{m.gis_fun_detail_desc()}</span>
			</div>
			<div class="map-card map-reveal flex flex-col gap-3 rounded-3xl p-6">
				<span class="font-mono text-xs text-muted-foreground">{m.gis_fun_caffeine()}</span>
				<span class="text-[34px] font-black">95%</span>
				<span class="h-2.5 overflow-hidden rounded-full bg-secondary">
					<span class="block h-full w-[95%] rounded-full bg-route"></span>
				</span>
			</div>
			<div class="map-card map-reveal flex flex-col gap-3 rounded-3xl p-6">
				<span class="font-mono text-xs text-muted-foreground">{m.gis_fun_ping()}</span>
				<span class="text-[34px] font-black">12ms</span>
				<span class="flex items-center gap-2 font-mono text-xs text-success">
					<span class="size-2.5 rounded-full bg-success"></span>LIVE
				</span>
			</div>
			<div class="map-card map-reveal flex flex-col gap-3 rounded-3xl p-6">
				<span class="font-mono text-xs text-muted-foreground">{m.gis_fun_music()}</span>
				<span class="text-[34px] font-black">24/7</span>
				<span aria-hidden="true" class="flex h-6 items-end gap-1">
					{#each [0, 1, 2, 3, 4] as i (i)}
						<span
							class="eq h-full w-1.5 rounded-[3px] bg-primary"
							style="animation-delay: {i * 0.15}s"
						></span>
					{/each}
				</span>
			</div>
		</div>
	</section>

	<a
		href={localizeHref('/contact')}
		class="map-reveal lift flex flex-wrap items-center justify-between gap-5 rounded-[36px] bg-[#17212B] p-[clamp(28px,4vw,48px)] text-white"
	>
		<span class="max-w-[760px] text-[clamp(28px,3.4vw,46px)] leading-[1.1] font-black"
			>{m.gis_about_cta()}</span
		>
		<span
			class="rounded-full bg-primary px-7 py-4 text-[17px] font-extrabold text-primary-foreground"
			>{m.gis_contact_me()}</span
		>
	</a>
</div>

<style>
	.eq {
		transform-origin: bottom;
		animation: eq 0.9s ease-in-out infinite alternate;
	}
	@keyframes eq {
		from {
			transform: scaleY(0.25);
		}
		to {
			transform: scaleY(1);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.eq {
			animation: none;
			transform: scaleY(0.6);
		}
	}
</style>
