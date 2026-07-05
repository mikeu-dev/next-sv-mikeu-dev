<script lang="ts">
	import type { BlogPost } from '$lib/types';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { ArrowUpRight, Calendar } from '@lucide/svelte';
	import { optimizeImage } from '$lib/utils/image.util';
	import { tornPaperClipPath } from '$lib/utils/torn-paper-shape';
	import { seededRandom } from '$lib/utils/seeded-random';

	let { post }: { post: BlogPost } = $props();

	const formattedDate = $derived(
		new Date(post.date).toLocaleDateString(getLocale(), {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		})
	);
	const primaryTag = $derived(post.tags?.[0]);

	// A gentler, larger tear for the paper backing peeking out behind the photo,
	// and a busier one for the clipping itself — same idea as two sheets of
	// paper torn separately, then the smaller one glued slightly off from the
	// larger one's edge.
	const backingClip = $derived(tornPaperClipPath(`${post.slug}-back`, { segments: 5, jitter: 2 }));
	const frontClip = $derived(tornPaperClipPath(`${post.slug}-front`));

	const PIN_COLORS = ['#d94f45', '#2f6e52', '#fcec62', '#3b6ea5'];

	// Deterministic per-post quirks — slight tilt and a pushpin that lands in a
	// different spot/color each time, seeded off the slug so it's stable
	// across SSR/hydration instead of reshuffling like `Math.random()` would.
	const decor = $derived.by(() => {
		const rand = seededRandom(post.slug);
		const rotate = (rand() - 0.5) * 7;
		const pinLeft = 22 + rand() * 56;
		const pinColor = PIN_COLORS[Math.floor(rand() * PIN_COLORS.length)];
		return { rotate, pinLeft, pinColor };
	});
</script>

<div class="blog-item group relative h-full" style="transform: rotate({decor.rotate}deg);">
	<!-- Aged-paper backing, peeking out around the clipping's own torn edge -->
	<div
		class="pointer-events-none absolute inset-0 bg-[#f0e6cc]"
		style="clip-path: {backingClip}; filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.25));"
	></div>

	<!-- The clipping itself -->
	<article
		class="absolute overflow-hidden bg-muted transition-transform duration-300 group-hover:-translate-y-1"
		style="inset: 10px; clip-path: {frontClip};"
	>
		<a href={localizeHref(`/blog/${post.slug}`)} class="absolute inset-0">
			{#if post.thumbnailUrl}
				<img
					src={optimizeImage(post.thumbnailUrl, { width: 700, quality: 75 })}
					alt={post.title}
					class="h-full w-full object-cover grayscale transition-all duration-500 ease-out group-hover:scale-105 group-hover:grayscale-0"
					loading="lazy"
				/>
			{/if}

			<!-- Bottom gradient scrim for caption legibility -->
			<div
				class="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/85 via-black/15 to-transparent"
			></div>

			<!-- Arrow badge -->
			<div
				class="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-md transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
			>
				<ArrowUpRight class="size-4" />
			</div>

			<!-- Caption -->
			<div class="absolute inset-x-0 bottom-0 z-10 p-5">
				<div class="flex items-center gap-2 font-mono text-[10px] text-white/60">
					<Calendar class="size-3" />
					<span>{formattedDate}</span>
				</div>
				<h3 class="mt-1 font-poppins text-xl font-bold tracking-tight text-white sm:text-2xl">
					{post.title}
				</h3>
				{#if primaryTag}
					<p class="mt-1 font-mono text-xs tracking-wide text-white/70 uppercase">{primaryTag}</p>
				{/if}
			</div>
		</a>
	</article>

	<!-- Pushpin -->
	<div
		class="pointer-events-none absolute top-0 z-20 size-4 -translate-y-1/2 rounded-full"
		style="left: {decor.pinLeft}%; background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.9), {decor.pinColor} 55%, rgba(0, 0, 0, 0.35) 100%); box-shadow: 0 3px 4px rgba(0, 0, 0, 0.4);"
	></div>
</div>
