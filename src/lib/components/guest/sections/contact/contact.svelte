<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import isochrone from '#lib/assets/scenes/contact-isochrone.svg?raw';

	const EMAIL = 'rikiruswandi28@gmail.com';
	const LINKS = [
		{ href: 'https://github.com/mikeu-dev', label: 'GitHub' },
		{ href: 'https://www.linkedin.com/in/rikiruswandi/', label: 'LinkedIn' },
		{ href: 'https://www.instagram.com/reekey.rushonethe/', label: 'Instagram' }
	];
</script>

<section
	aria-labelledby="contact-h"
	class="relative flex min-h-[640px] flex-col items-center justify-center overflow-hidden"
>
	<!-- Stepped isochrones: 5–25 minutes from Purwakarta -->
	<div
		aria-hidden="true"
		class="map-art absolute inset-0 overflow-hidden bg-[#dcdad4] [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
	>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- static SVG bundled with the app -->
		{@html isochrone}
	</div>
	<div
		class="map-reveal shard relative mx-4 my-[72px] flex w-[min(760px,calc(100%-32px))] flex-col"
	>
		<p class="tab tab-r eyebrow flex h-[50px] items-center self-start px-[22px]">
			{m.gis_contact_eyebrow()}
		</p>
		<div class="flex flex-col gap-5 rounded-[0_36px_36px_36px] bg-card p-[clamp(26px,4vw,48px)]">
			<h2
				id="contact-h"
				class="m-0 text-[clamp(36px,5vw,64px)] leading-[1.02] font-black tracking-[-0.03em]"
			>
				{m.gis_contact_title()}
			</h2>
			<p class="m-0 text-lg leading-relaxed text-ink-soft">{m.gis_contact_lead()}</p>
			<div class="flex flex-wrap gap-2">
				<a href="mailto:{EMAIL}" class="btn-pill-solid min-h-[54px] px-[26px] break-all">{EMAIL}</a>
				<a
					href={localizeHref('/contact')}
					class="btn-pill-line min-h-[54px] rounded-leaf-r px-5 text-base"
					>{m.contact_page_button()}</a
				>
				{#each LINKS as l, i (l.href)}
					<a
						href={l.href}
						target="_blank"
						rel="noopener noreferrer"
						class="btn-pill-line min-h-[54px] px-5 text-base {i % 2 ? 'rounded-leaf-r' : ''}"
						>{l.label}</a
					>
				{/each}
			</div>
		</div>
	</div>
</section>
