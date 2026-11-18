<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';

	const EMAIL = 'rikiruswandi28@gmail.com';
	const LINKS = [
		{ href: 'https://github.com/mikeu-dev', label: 'GitHub' },
		{ href: 'https://www.linkedin.com/in/rikiruswandi/', label: 'LinkedIn' },
		{ href: 'https://www.instagram.com/reekey.rushonethe/', label: 'Instagram' }
	];
</script>

<section
	aria-labelledby="contact-h"
	class="relative flex min-h-[640px] flex-col items-center justify-center overflow-hidden bg-secondary"
>
	<img
		aria-hidden="true"
		src="/images/map/band-basemap.svg"
		alt=""
		class="map-art absolute inset-0 block size-full object-cover"
	/>
	<img
		aria-hidden="true"
		src="/images/map/band-buildings.svg"
		alt=""
		class="map-art map-rise absolute inset-0 block size-full object-cover"
		style="animation-delay: 1.2s"
	/>
	<div
		class="map-reveal relative mx-4 my-[72px] flex max-w-[760px] flex-col items-center gap-[22px] rounded-[36px] border border-border bg-card p-[clamp(28px,4vw,52px)] text-center shadow-card"
	>
		<p class="eyebrow">{m.gis_contact_eyebrow()}</p>
		<h2
			id="contact-h"
			class="m-0 text-[clamp(36px,5vw,64px)] leading-[1.02] font-black tracking-[-0.03em]"
		>
			{m.gis_contact_title()}
		</h2>
		<p class="m-0 text-lg leading-relaxed text-ink-soft">{m.gis_contact_lead()}</p>
		<div class="flex flex-wrap justify-center gap-2.5">
			<a href="mailto:{EMAIL}" class="btn-pill-solid min-h-14 px-7 break-all">{EMAIL}</a>
			<a href={localizeHref('/contact')} class="btn-pill-line min-h-14 text-base"
				>{m.contact_page_button()}</a
			>
			{#each LINKS as l (l.href)}
				<a
					href={l.href}
					target="_blank"
					rel="noopener noreferrer"
					class="btn-pill-line min-h-14 text-base">{l.label}</a
				>
			{/each}
		</div>
	</div>
</section>
