<script lang="ts">
	import HeroSection from '#lib/components/guest/sections/hero/hero.svelte';
	import TechMarquee from '#lib/components/guest/sections/hero/tech-marquee.svelte';
	import SEO from '#lib/components/seo/seo.svelte';
	import WorkSection from '#lib/components/guest/sections/work/work.svelte';
	import Capabilities from '#lib/components/guest/sections/capabilities/capabilities.svelte';
	import JourneyRoute from '#lib/components/guest/sections/journey/journey-route.svelte';
	import LatestBlogsSection from '#lib/components/guest/sections/blog/latest-blogs.svelte';
	import ContactSection from '#lib/components/guest/sections/contact/contact.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { JourneyItem } from '#lib/types.js';

	let { data } = $props();
	let journey = $derived(((data as { journey?: JourneyItem[] }).journey ?? []) as JourneyItem[]);
</script>

<SEO />

<HeroSection />

<TechMarquee skills={data.skills} />

<div id="work" class="scroll-mt-24">
	<WorkSection projects={data.projects} />
</div>

<Capabilities />

{#if journey.length}
	<section
		aria-labelledby="journey-h"
		class="mx-auto box-border max-w-[1440px] px-[clamp(16px,4vw,56px)] pb-[clamp(56px,6vw,88px)]"
	>
		<div class="flex flex-wrap items-start gap-x-14 gap-y-8">
			<div class="map-reveal flex flex-[1_1_320px] flex-col gap-4">
				<p class="eyebrow">{m.gis_journey_eyebrow()}</p>
				<h2
					id="journey-h"
					class="m-0 text-[clamp(34px,4.2vw,58px)] leading-[1.05] font-black tracking-[-0.025em]"
				>
					{m.gis_journey_title()}
				</h2>
				<p class="m-0 text-[17px] leading-relaxed text-ink-soft">{m.gis_journey_lead()}</p>
				<blockquote
					class="mt-2 mb-0 rounded-[22px] border border-border bg-card px-[22px] py-5 text-[17px] leading-normal font-bold"
				>
					{m.gis_quote()}
				</blockquote>
			</div>
			<div class="map-reveal flex-[2_1_480px]">
				<JourneyRoute items={journey} />
			</div>
		</div>
	</section>
{/if}

<LatestBlogsSection posts={data.latestPosts} />

<div id="contact">
	<ContactSection />
</div>
