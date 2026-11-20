<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { m } from '#lib/paraglide/messages.js';
	import { ConfettiCannon } from 'svelte-canvas-confetti';
	import { playConfettiSound } from '#lib/utils/confetti-sound.js';
	import { tick } from 'svelte';
	import { PUBLIC_CONTACT_EMAIL } from '$app/env/public';
	import SEO from '#lib/components/seo/seo.svelte';
	import PageHeader from '#lib/components/guest/map/page-header.svelte';
	import reachScene from '#lib/assets/scenes/contact-reach.svg?raw';
	import type { SocialLink } from '#lib/types.js';

	type ActionData = { success: boolean; message: string };

	let { data }: { data: import('./$types').PageData } = $props();
	const email = PUBLIC_CONTACT_EMAIL || 'rikiruswandi28@gmail.com';

	const NEEDS = [m.gis_need_webgis, m.gis_need_erp, m.gis_need_ai, m.gis_need_other];
	let need = $state(0);
	let sent = $state(false);
	let isSubmitting = $state(false);
	let isCopied = $state(false);
	let confettiCannon = $state(false);

	const triggerConfetti = async () => {
		confettiCannon = false;
		await tick();
		confettiCannon = true;
		playConfettiSound();
	};

	async function copyEmail() {
		try {
			await navigator.clipboard.writeText(email);
			isCopied = true;
			toast.success(m.gis_email_copied());
			setTimeout(() => (isCopied = false), 2000);
		} catch {
			toast.error('Failed to copy email');
		}
	}

	const field =
		'min-h-[52px] rounded-leaf border-0 bg-well px-4 text-base font-semibold text-foreground outline-none placeholder:text-muted-foreground focus:shadow-[inset_0_0_0_1.5px_var(--primary)]';
</script>

<SEO title={m.contact_page_title()} description={m.contact_page_subtitle()} />

{#if confettiCannon}
	<ConfettiCannon
		origin={[window.innerWidth / 2, window.innerHeight]}
		angle={-90}
		spread={35}
		force={35}
	/>
{/if}

<PageHeader
	eyebrow={m.gis_contact_page_eyebrow()}
	title={m.gis_contact_title()}
	lead={m.gis_contact_page_lead()}
	scene={reachScene}
/>

<div
	class="mx-auto box-border flex max-w-[1440px] flex-wrap items-start gap-2.5 px-[clamp(16px,4vw,56px)] pt-10 pb-24"
>
	<div class="flex flex-[1_1_360px] flex-col gap-2.5">
		<div class="shard flex flex-col">
			<span
				class="tab tab-r flex h-11 items-center self-start px-5 font-mono text-xs font-semibold text-ink-soft"
				>{m.gis_email_label()}</span
			>
			<div class="flex flex-col gap-3 rounded-[0_30px_30px_30px] bg-card px-6 pt-4 pb-6">
				<a
					href="mailto:{email}"
					class="text-[22px] font-black break-all text-primary hover:text-foreground">{email}</a
				>
				<button
					type="button"
					onclick={copyEmail}
					class="btn-pill-line min-h-11 self-start px-[18px] text-[15px]"
				>
					{isCopied ? m.gis_email_copied() : m.gis_copy_email()}
				</button>
			</div>
		</div>
		<div class="grid grid-cols-2 gap-2.5">
			<div class="shard flex flex-col gap-1.5 rounded-[30px_12px_30px_12px] bg-card p-5">
				<span class="font-mono text-xs text-muted-foreground">{m.gis_base_label()}</span>
				<span class="text-xl font-black">{m.gis_base_country()}</span>
			</div>
			<div class="shard flex flex-col gap-1.5 rounded-[12px_30px_12px_30px] bg-card p-5">
				<span class="font-mono text-xs text-muted-foreground">{m.gis_reply_label()}</span>
				<span class="text-xl font-black">{m.gis_reply_value()}</span>
			</div>
		</div>
		<div
			role="img"
			aria-label={m.gis_location_label()}
			class="shard relative aspect-[4/3] overflow-hidden rounded-[30px] border-[10px] border-card bg-secondary"
		>
			<img
				src="/images/map/flat-basemap.svg"
				alt=""
				class="map-art map-mute absolute max-w-none"
				style="width: 200%; height: 200%; left: -30%; top: -60%"
			/>
			<svg
				viewBox="0 0 400 300"
				preserveAspectRatio="xMidYMid slice"
				aria-hidden="true"
				class="absolute inset-0 size-full"
			>
				{#each [0, 1.2] as d (d)}
					<circle
						class="map-pulse"
						style="animation-delay: {d}s"
						cx="200"
						cy="150"
						r="70"
						fill="var(--primary)"
						fill-opacity=".18"
						stroke="var(--primary)"
						stroke-width="2"
					/>
				{/each}
				<g class="map-drop">
					<path
						transform="translate(182 102)"
						d="M18 1C8.6 1 1 8.4 1 17.6 1 30 18 47 18 47s17-17 17-29.4C35 8.4 27.4 1 18 1z"
						fill="var(--route)"
						stroke="#FFFFFF"
						stroke-width="3"
					/>
					<circle cx="200" cy="120" r="6" fill="#FFFFFF" />
				</g>
			</svg>
			<div class="glass absolute bottom-3 left-3 flex flex-col rounded-leaf px-4 py-2.5">
				<span class="font-black">Purwakarta, Jawa Barat</span>
				<span class="font-mono text-xs text-muted-foreground">6.5569° S, 107.4431° E · UTC+7</span>
			</div>
		</div>
		{#await data.socials then socialsData}
			{@const socials = (socialsData as SocialLink[]).filter((s) => s?.href)}
			{#if socials.length}
				<div class="flex flex-wrap gap-2">
					{#each socials as s (s.href)}
						<a
							href={s.href}
							target="_blank"
							rel="noopener noreferrer"
							class="shard btn-pill-line min-h-12 bg-card px-5 text-base hover:bg-white"
							>{s.label}</a
						>
					{/each}
				</div>
			{/if}
		{/await}
	</div>

	<div class="shard flex min-w-0 flex-[999_1_560px] flex-col">
		<span
			class="tab tab-l flex h-11 items-center gap-2 self-end px-5 font-mono text-[13px] font-semibold text-primary"
		>
			<svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
				<path
					d="M3 5h14v10H3zM3 5l7 6 7-6"
					fill="none"
					stroke="var(--route)"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			{m.gis_reply_badge()}
		</span>
		<div class="rounded-[30px_0_30px_30px] bg-card p-[clamp(24px,3vw,40px)]">
			{#if !sent}
				<form
					method="POST"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ result, update }) => {
							isSubmitting = false;
							let ok = false;
							if (result.type === 'success') {
								const res = result.data as ActionData;
								if (res?.success === false) toast.error(res?.message ?? m.contact_form_failure());
								else {
									ok = true;
									toast.success(res?.message ?? m.contact_form_success());
									await triggerConfetti();
								}
							} else if (result.type === 'failure') {
								const res = result.data as ActionData;
								toast.error(res?.message ?? m.contact_form_failure());
							}
							await update({ reset: ok });
							if (ok) sent = true;
						};
					}}
					class="flex flex-col gap-5"
				>
					<h2 class="m-0 text-[30px] font-black">{m.gis_send_title()}</h2>
					<div class="flex flex-wrap gap-4">
						<label class="flex flex-[1_1_240px] flex-col gap-2 font-extrabold">
							{m.contact_field_name()}
							<input
								type="text"
								name="name"
								required
								autocomplete="name"
								placeholder={m.gis_name_placeholder()}
								class={field}
							/>
						</label>
						<label class="flex flex-[1_1_240px] flex-col gap-2 font-extrabold">
							{m.contact_field_email()}
							<input
								type="email"
								name="email"
								required
								autocomplete="email"
								placeholder={m.gis_email_placeholder()}
								class={field}
							/>
						</label>
					</div>
					<fieldset class="m-0 flex flex-col gap-2.5 border-0 p-0">
						<legend class="mb-2 font-extrabold">{m.gis_need()}</legend>
						<input type="hidden" name="need" value={NEEDS[need]()} />
						<div class="flex flex-wrap gap-2">
							{#each NEEDS as label, i (i)}
								<button
									type="button"
									aria-pressed={need === i}
									onclick={() => (need = i)}
									class="min-h-11 px-4 text-[15px] font-extrabold transition-colors {i % 2
										? 'rounded-leaf-r'
										: 'rounded-leaf'} {need === i
										? 'bg-primary text-primary-foreground'
										: 'bg-well text-foreground hover:bg-white dark:hover:bg-white/10'}"
									>{label()}</button
								>
							{/each}
						</div>
					</fieldset>
					<label class="flex flex-col gap-2 font-extrabold">
						{m.contact_field_message()}
						<textarea
							name="message"
							rows="6"
							required
							placeholder={m.gis_message_placeholder()}
							class="{field} resize-y py-3.5 leading-relaxed"
						></textarea>
					</label>
					<button
						type="submit"
						disabled={isSubmitting}
						class="btn-pill-solid min-h-14 self-start px-[30px] disabled:opacity-60"
					>
						{isSubmitting ? m.gis_sending() : m.contact_page_button()}
						<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
							<path
								d="M4 9h10M10 5l4 4-4 4"
								fill="none"
								stroke="currentColor"
								stroke-width="2.2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</button>
				</form>
			{:else}
				<div role="status" class="flex flex-col items-center gap-4 px-4 py-12 text-center">
					<svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
						<circle
							class="map-pulse"
							cx="48"
							cy="48"
							r="30"
							fill="var(--primary)"
							fill-opacity=".2"
						/>
						<circle cx="48" cy="48" r="30" fill="var(--primary)" />
						<path
							d="M35 49l9 9 17-19"
							fill="none"
							stroke="#FFFFFF"
							stroke-width="5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					<h2 class="m-0 text-[30px] font-black">{m.gis_sent_title()}</h2>
					<p class="m-0 text-[17px] text-ink-soft">{m.gis_sent_desc()}</p>
					<button
						type="button"
						onclick={() => (sent = false)}
						class="btn-pill-line min-h-11 text-[15px]"
					>
						{m.gis_send_again()}
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>
