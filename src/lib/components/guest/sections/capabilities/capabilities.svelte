<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import SectionHead from '../../map/section-head.svelte';

	const grid = Array.from({ length: 16 }, (_, i) => ({ col: Math.floor(i / 4), row: i % 4 }));
</script>

<section
	aria-labelledby="cap-h"
	class="mx-auto box-border max-w-[1440px] px-[clamp(16px,4vw,56px)] pb-[clamp(56px,6vw,88px)]"
>
	<SectionHead id="cap-h" eyebrow={m.gis_cap_eyebrow()} title={m.gis_cap_title()} />
	<div class="grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-5">
		<!-- WebGIS: stacked map layers separating -->
		<article class="map-card map-reveal flex flex-col gap-4 px-4 pt-4 pb-7">
			<svg
				viewBox="0 0 320 200"
				aria-hidden="true"
				class="h-auto w-full rounded-[20px] bg-secondary"
			>
				<g transform="translate(160 130)">
					<g class="sep3">
						<path
							d="M0 -40 L110 0 L0 40 L-110 0Z"
							fill="#E4DED3"
							stroke="#CFC7B8"
							stroke-width="1.5"
						/>
						<path
							d="M-60 -18 L50 22 M-30 -29 L80 11 M-75 5 L-20 -15 M10 30 L70 8"
							stroke="#FFFFFF"
							stroke-width="5"
							stroke-linecap="round"
						/>
					</g>
					<g transform="translate(0 -38)">
						<path
							d="M0 -40 L110 0 L0 40 L-110 0Z"
							fill="#CDE8C2"
							fill-opacity=".85"
							stroke="#9CCB8B"
							stroke-width="1.5"
						/>
						<path
							d="M-40 -6 L10 -24 L46 -6 L0 14Z"
							fill="var(--primary)"
							fill-opacity=".25"
							stroke="var(--primary)"
							stroke-width="2"
						/>
					</g>
					<g class="sep1">
						<g transform="translate(0 -76)">
							<path
								d="M0 -40 L110 0 L0 40 L-110 0Z"
								fill="#FFFFFF"
								fill-opacity=".9"
								stroke="#CFC7B8"
								stroke-width="1.5"
							/>
							<circle cx="-30" cy="0" r="6" fill="var(--primary)" />
							<circle cx="22" cy="-12" r="6" fill="var(--route)" />
							<circle cx="30" cy="14" r="6" fill="var(--primary)" />
						</g>
					</g>
				</g>
			</svg>
			<div class="flex flex-col gap-2.5 px-3">
				<h3 class="m-0 text-2xl font-black">{m.gis_cap_gis_title()}</h3>
				<p class="m-0 text-[17px] leading-relaxed text-ink-soft">{m.gis_cap_gis_desc()}</p>
			</div>
		</article>

		<!-- ERP / systems: vector tiles being served -->
		<article class="map-card map-reveal flex flex-col gap-4 px-4 pt-4 pb-7">
			<svg
				viewBox="0 0 320 200"
				aria-hidden="true"
				class="h-auto w-full rounded-[20px] bg-secondary"
			>
				<g transform="translate(36 30)">
					{#each grid as t (`${t.col}-${t.row}`)}
						{@const x = t.col * 34}
						{@const y = t.row * 34}
						<rect {x} {y} width="30" height="30" rx="6" fill="#E4DED3" />
						<rect
							class="tl"
							style="animation-delay: {(t.col + t.row) * 0.22}s"
							{x}
							{y}
							width="30"
							height="30"
							rx="6"
							fill="var(--primary)"
							fill-opacity=".85"
						/>
						<path
							d="M{x + 4} {y + 20} L{x + 26} {y + 10}"
							stroke="#FFFFFF"
							stroke-width="2.5"
							stroke-linecap="round"
						/>
					{/each}
				</g>
				<rect x="196" y="74" width="104" height="52" rx="14" fill="#17212B" />
				<text
					x="248"
					y="98"
					text-anchor="middle"
					font-family="Red Hat Mono, monospace"
					font-size="11"
					fill="#FFFFFF">GET /tiles</text
				>
				<text
					x="248"
					y="114"
					text-anchor="middle"
					font-family="Red Hat Mono, monospace"
					font-size="11"
					fill="#FFFFFF">{'{z}/{x}/{y}.pbf'}</text
				>
				<path
					class="map-dash"
					d="M176 100 H194"
					stroke="var(--primary)"
					stroke-width="3"
					stroke-linecap="round"
				/>
			</svg>
			<div class="flex flex-col gap-2.5 px-3">
				<h3 class="m-0 text-2xl font-black">{m.gis_cap_erp_title()}</h3>
				<p class="m-0 text-[17px] leading-relaxed text-ink-soft">{m.gis_cap_erp_desc()}</p>
			</div>
		</article>

		<!-- AI: object detection on a street -->
		<article class="map-card map-reveal flex flex-col gap-4 px-4 pt-4 pb-7">
			<svg
				viewBox="0 0 320 200"
				aria-hidden="true"
				class="h-auto w-full rounded-[20px] bg-secondary"
			>
				<rect x="0" y="118" width="320" height="56" fill="#FFFFFF" />
				<path class="map-dash" d="M0 146 H320" stroke="#E2DCCF" stroke-width="3" />
				<rect x="40" y="30" width="60" height="80" rx="6" fill="#E4DED3" />
				<rect x="112" y="50" width="48" height="60" rx="6" fill="#E4DED3" />
				<rect x="226" y="22" width="70" height="88" rx="6" fill="#E4DED3" />
				<g class="cvcar">
					<rect x="44" y="124" width="76" height="30" rx="12" fill="var(--primary)" />
					<rect x="58" y="114" width="44" height="16" rx="7" fill="var(--primary)" />
					<circle cx="62" cy="156" r="7" fill="#17212B" />
					<circle cx="104" cy="156" r="7" fill="#17212B" />
					<rect x="66" y="136" width="30" height="10" rx="3" fill="#FFFFFF" />
					<rect
						x="34"
						y="104"
						width="96"
						height="64"
						rx="6"
						fill="none"
						stroke="var(--route)"
						stroke-width="2.5"
					/>
					<rect x="34" y="86" width="74" height="18" rx="5" fill="var(--route)" />
					<text
						x="40"
						y="99"
						font-family="Red Hat Mono, monospace"
						font-size="10"
						font-weight="600"
						fill="#FFFFFF">{m.gis_cap_vehicle()}</text
					>
				</g>
			</svg>
			<div class="flex flex-col gap-2.5 px-3">
				<h3 class="m-0 text-2xl font-black">{m.gis_cap_ai_title()}</h3>
				<p class="m-0 text-[17px] leading-relaxed text-ink-soft">{m.gis_cap_ai_desc()}</p>
			</div>
		</article>
	</div>
</section>

<style>
	.sep1 {
		animation: sep1 4s ease-in-out infinite;
	}
	.sep3 {
		animation: sep3 4s ease-in-out infinite;
	}
	.tl {
		opacity: 0;
		animation: tl 4.5s ease infinite;
	}
	.cvcar {
		animation: cvcar 5s ease-in-out infinite alternate;
	}
	@keyframes sep1 {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-16px);
		}
	}
	@keyframes sep3 {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(16px);
		}
	}
	@keyframes tl {
		0% {
			opacity: 0;
		}
		12%,
		75% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}
	@keyframes cvcar {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(150px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.sep1,
		.sep3,
		.cvcar {
			animation: none;
		}
		.tl {
			animation: none;
			opacity: 0.6;
		}
	}
</style>
