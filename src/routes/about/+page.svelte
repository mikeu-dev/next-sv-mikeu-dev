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
	import PageHeader from '#lib/components/guest/map/page-header.svelte';
	import routeScene from '#lib/assets/scenes/about-route.svg?raw';

	let { data }: { data: PageData } = $props();
	const locale = getLocale();
	const email = PUBLIC_CONTACT_EMAIL || 'rikiruswandi28@gmail.com';

	let resumeUrl = $derived(
		(locale === 'id' ? data.resumeUrls.id : data.resumeUrls.en) ||
			`https://raw.githubusercontent.com/mikeu-dev/portfolio-assets/main/docs/cv/riki-ruswandi-resume-(${locale}).pdf`
	);

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

<PageHeader
	eyebrow={m.gis_about_eyebrow()}
	title={m.gis_about_title()}
	lead={m.gis_about_lead()}
	scene={routeScene}
>
	<div class="flex flex-wrap gap-2.5">
		<a href={resumeUrl} download class="btn-pill-solid min-h-[52px] px-[26px]"
			>{m.about_hero_resume()}</a
		>
		<button type="button" onclick={copyEmail} class="btn-pill-line min-h-[52px] rounded-leaf-r">
			{copied ? m.gis_email_copied() : m.gis_copy_email()}
		</button>
	</div>
	{#snippet aside()}
		<div class="shard flex min-w-0 flex-[0_1_360px] flex-col self-end">
			<div class="tab tab-l flex h-[50px] items-center gap-1.5 self-end px-3.5">
				<span
					class="rounded-leaf-sm bg-primary/12 px-3 py-1.5 text-[13px] font-extrabold text-primary"
					>Svelte expert</span
				>
				<span
					class="rounded-leaf-sm-r bg-primary/12 px-3 py-1.5 text-[13px] font-extrabold text-primary"
					>GIS engineer</span
				>
			</div>
			<div class="flex flex-col gap-3.5 rounded-[30px_0_30px_30px] bg-card p-[22px]">
				<div class="flex items-center gap-3.5">
					<span class="relative flex-none">
						<img
							src={optimizeImage('https://github.com/mikeu-dev.png', { width: 160, quality: 80 })}
							alt="Riki Ruswandi"
							width="72"
							height="72"
							class="size-[72px] rounded-[24px_12px_24px_12px] bg-primary object-cover"
						/>
						<span
							aria-hidden="true"
							class="absolute -top-1 -right-1 size-5 rounded-[7px_3px_7px_3px] border-[3px] border-card bg-route"
						></span>
					</span>
					<span class="flex flex-col gap-0.5">
						<span class="text-[22px] font-black">Mikeu</span>
						<span class="font-mono text-[13px] text-muted-foreground">{m.gis_about_alias()}</span>
					</span>
				</div>
				<dl class="m-0 grid grid-cols-2 gap-1.5 font-mono text-[13px]">
					{#each [[m.gis_role(), m.seo_job_title()], [m.gis_base(), 'Purwakarta, ID'], [m.gis_coords(), '6.5569° S, 107.4431° E']] as [k, v], i (k)}
						<div
							class="flex flex-col gap-1 bg-well px-3 py-2.5 {i % 2
								? 'rounded-leaf-sm-r'
								: 'rounded-leaf-sm'}"
						>
							<dt class="text-[11px] text-muted-foreground uppercase">{k}</dt>
							<dd class="m-0 font-semibold">{v}</dd>
						</div>
					{/each}
					<div class="flex flex-col gap-1 rounded-leaf-sm-r bg-well px-3 py-2.5">
						<dt class="text-[11px] text-muted-foreground uppercase">{m.gis_status()}</dt>
						<dd class="m-0 flex items-start gap-1.5 font-semibold">
							<span class="relative mt-1 size-2.5 flex-none rounded-[4px_2px_4px_2px] bg-success">
								<span
									class="absolute inset-0 animate-ping rounded-[4px_2px_4px_2px] bg-success motion-reduce:animate-none"
								></span>
							</span>
							{m.gis_status_open()}
						</dd>
					</div>
				</dl>
			</div>
		</div>
	{/snippet}
</PageHeader>

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
			<div class="flex flex-wrap items-start gap-2.5">
				<div class="shard flex min-w-0 flex-[1_1_280px] flex-col">
					<span
						class="tab tab-r flex h-11 items-center self-start px-5 font-mono text-xs font-semibold text-ink-soft uppercase"
						>{m.gis_skill_layers()}</span
					>
					<div
						role="group"
						aria-label={m.gis_skill_layers()}
						class="flex flex-col gap-2 rounded-[0_30px_30px_30px] bg-card p-3"
					>
						{#each techstack as c, i (c.category)}
							{@const on = !hidden[c.category]}
							<button
								type="button"
								aria-pressed={on}
								onclick={() => (hidden[c.category] = on)}
								class="flex min-h-14 items-center gap-3 px-2 py-2 text-left text-foreground transition-[background-color,box-shadow] {i %
								2
									? 'rounded-leaf-r'
									: 'rounded-leaf'} {on
									? 'bg-white shadow-[inset_0_0_0_1.5px_var(--primary)] dark:bg-white/10'
									: 'hover:bg-white/60 dark:hover:bg-white/5'}"
							>
								<span
									class="flex size-9 flex-none items-center justify-center {i % 2
										? 'rounded-leaf-sm'
										: 'rounded-leaf-sm-r'} {on
										? 'bg-primary text-primary-foreground'
										: 'bg-well text-muted-foreground'}"
								>
									<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
										<path
											d={ICONS[i % ICONS.length]}
											fill="none"
											stroke="currentColor"
											stroke-width="2.2"
											stroke-linejoin="round"
											stroke-linecap="round"
										/>
									</svg>
								</span>
								<span class="flex-1 text-base leading-tight font-black">{c.category}</span>
								<span class="font-mono text-xs text-muted-foreground">{c.items.length}</span>
								<span
									class="relative h-5 w-[34px] flex-none rounded-[10px_5px_10px_5px] transition-colors {on
										? 'bg-primary'
										: 'bg-line-strong'}"
								>
									<span
										class="absolute top-[3px] size-3.5 rounded-[6px_3px_6px_3px] bg-white transition-[left] duration-200"
										style="left: {on ? 17 : 3}px"
									></span>
								</span>
							</button>
						{/each}
					</div>
				</div>
				<div class="flex min-w-0 flex-[999_1_560px] flex-col gap-2.5">
					{#each shown as c, i (c.category)}
						<div
							class="shard flex flex-col gap-3 bg-card px-[22px] py-5 {i % 2
								? 'rounded-[12px_30px_12px_30px]'
								: 'rounded-[30px_12px_30px_12px]'}"
						>
							<span class="flex items-center gap-2.5 text-lg font-black">
								<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
									<path
										d={ICONS[techstack.indexOf(c) % ICONS.length]}
										fill="none"
										stroke="var(--route)"
										stroke-width="2.2"
										stroke-linejoin="round"
										stroke-linecap="round"
									/>
								</svg>
								{c.category}
							</span>
							{#if c.description}<p class="m-0 text-[15px] text-ink-soft">{c.description}</p>{/if}
							<span class="flex flex-wrap gap-1.5">
								{#each c.items as item, j (item.name)}
									<span
										class="flex items-center gap-2 bg-well px-3.5 py-2 text-[15px] font-extrabold {j %
										2
											? 'rounded-leaf-sm-r'
											: 'rounded-leaf-sm'}"
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
				class="map-reveal shard m-0 rounded-[34px_14px_34px_14px] bg-primary px-8 py-7 text-[clamp(20px,2vw,26px)] leading-[1.45] font-extrabold text-primary-foreground"
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
			<div class="map-card map-reveal shard flex flex-col gap-3 p-6">
				<span class="text-xl font-black">{m.gis_fun_growth()}</span>
				<span class="text-base leading-normal text-ink-soft">{m.gis_fun_growth_desc()}</span>
			</div>
			<div class="map-card map-reveal shard flex flex-col gap-3 p-6">
				<span class="text-xl font-black">{m.gis_fun_detail()}</span>
				<span class="text-base leading-normal text-ink-soft">{m.gis_fun_detail_desc()}</span>
			</div>
			<div class="map-card map-reveal shard flex flex-col gap-3 p-6">
				<span class="font-mono text-xs text-muted-foreground">{m.gis_fun_caffeine()}</span>
				<span class="text-[34px] font-black">95%</span>
				<span class="h-2.5 overflow-hidden rounded-full bg-well">
					<span class="block h-full w-[95%] rounded-full bg-route"></span>
				</span>
			</div>
			<div class="map-card map-reveal shard flex flex-col gap-3 p-6">
				<span class="font-mono text-xs text-muted-foreground">{m.gis_fun_ping()}</span>
				<span class="text-[34px] font-black">12ms</span>
				<span class="flex items-center gap-2 font-mono text-xs text-success">
					<span class="size-2.5 rounded-full bg-success"></span>LIVE
				</span>
			</div>
			<div class="map-card map-reveal shard flex flex-col gap-3 p-6">
				<span class="font-mono text-xs text-muted-foreground">{m.gis_fun_music()}</span>
				<span class="text-[34px] font-black">24/7</span>
				<span aria-hidden="true" class="flex h-6 items-end gap-1">
					{#each [0, 1, 2, 3, 4] as i (i)}
						<span
							class="eq h-full w-1.5 rounded-[3px] {i % 2 ? 'bg-route' : 'bg-primary'}"
							style="animation-delay: {i * 0.15}s"
						></span>
					{/each}
				</span>
			</div>
		</div>
	</section>

	<a
		href={localizeHref('/contact')}
		class="map-reveal shard lift flex flex-wrap items-center justify-between gap-5 rounded-[36px_14px_36px_36px] bg-[#25272b] p-[clamp(28px,4vw,48px)] text-white no-underline"
	>
		<span class="max-w-[760px] text-[clamp(28px,3.4vw,46px)] leading-[1.1] font-black"
			>{m.gis_about_cta()}</span
		>
		<span
			class="flex items-center gap-3 rounded-leaf bg-white py-3 pr-6 pl-3 text-[17px] font-extrabold text-[#25272b]"
		>
			<span
				class="flex size-[34px] items-center justify-center rounded-leaf-sm-r bg-route text-white"
			>
				<svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
					<path
						d="M3 5h14v10H3zM3 5l7 6 7-6"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</span>
			{m.hero_button_text()}
		</span>
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
