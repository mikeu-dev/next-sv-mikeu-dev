<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import BlogClippingTile from './blog-clipping-tile.svelte';
	import type { BlogPost } from '$lib/types';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import Icon from '$lib/components/ui/icon.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { Hash, Terminal } from '@lucide/svelte';

	let { posts = [] }: { posts: BlogPost[] } = $props();

	let section = $state<HTMLElement>();

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		const sectionEl = section;
		if (!sectionEl) return;

		const ctx = gsap.context(() => {
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: sectionEl,
					start: 'top 80%',
					toggleActions: 'play none none none'
				}
			});

			tl.from('.blog-header-stagger', {
				y: 30,
				opacity: 0,
				duration: 0.8,
				ease: 'power3.out'
			});

			gsap.from('.blog-item', {
				y: 30,
				opacity: 0,
				duration: 0.6,
				stagger: 0.1,
				ease: 'power3.out',
				scrollTrigger: {
					trigger: '.blog-list',
					start: 'top 85%',
					toggleActions: 'play none none none'
				}
			});
		}, sectionEl);

		return () => ctx.revert();
	});
</script>

<section
	id="latest-blog"
	bind:this={section}
	class="blog-section relative overflow-hidden bg-background py-20 md:py-32"
>
	<!-- Grain Texture Overlay -->
	<div
		class="pointer-events-none absolute inset-0 z-50 opacity-[0.03] mix-blend-overlay contrast-150 grayscale"
		style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
	></div>

	<!-- Origami shard decorations — same language as the work section's. -->
	<div
		class="origami-shard-blog pointer-events-none absolute -top-24 -right-24 size-96 bg-primary/5 dark:bg-primary/10"
		style="clip-path: polygon(20% 0%, 100% 20%, 80% 100%, 0% 80%);"
	></div>
	<div
		class="origami-shard-blog pointer-events-none absolute -bottom-24 -left-24 size-80 bg-foreground/5"
		style="clip-path: polygon(0% 10%, 90% 0%, 100% 90%, 10% 100%);"
	></div>

	<div class="max-w-screen-4xl relative mx-auto px-6">
		<div class="blog-header-stagger mb-12 text-left md:mb-16">
			<div
				class="mb-4 flex items-center gap-2 font-mono text-[10px] font-black tracking-[0.2em] text-primary uppercase md:mb-6"
			>
				<Terminal class="size-3" /> ARCHIVE_SCAN: RECENT_ENTRIES
			</div>
			<h2 class="font-poppins text-4xl leading-none font-black tracking-tighter sm:text-5xl">
				{m.blog_latest_header()} <span class="text-primary italic">{m.blog_title()}</span><span
					class="text-primary">.</span
				>
			</h2>
			<p class="mt-4 max-w-lg font-mono text-sm text-muted-foreground">
				{m.blog_subtitle()}
			</p>
		</div>

		{#if posts.length > 0}
			<div
				class="blog-list grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 sm:gap-y-20 lg:grid-cols-3"
			>
				{#each posts as post (post.slug)}
					<div class="aspect-4/5">
						<BlogClippingTile {post} />
					</div>
				{/each}
			</div>
		{:else}
			<div class="blog-header-stagger py-24 text-center">
				<div
					class="mx-auto mb-6 flex size-16 items-center justify-center border-2 border-foreground/10"
				>
					<Hash class="size-8 text-foreground/20" />
				</div>
				<p class="font-mono text-sm font-black tracking-widest text-muted-foreground uppercase">
					{m.blog_empty()}
				</p>
			</div>
		{/if}

		{#if posts.length > 0}
			<div class="mt-16 flex justify-center md:mt-20">
				<a
					href={localizeHref('/blog')}
					class="tape-cta inline-flex items-center gap-1.5 px-6 py-2.5 font-mono text-sm font-bold tracking-wide"
				>
					{m.blog_card_button()}
					<Icon iconName="BsArrowRight" size={16} />
				</a>
			</div>
		{/if}

		<!-- Footer technicality -->
		<div
			class="mt-8 flex items-center justify-between border-t-2 border-foreground/10 pt-4 font-mono text-[8px] font-black tracking-[0.3em] text-foreground/30 uppercase lg:mt-16 lg:pt-6"
		>
			<div class="flex items-center gap-4">
				<Hash class="size-3" />
				<span>MIKEU_DEV // BLOG_ARCHIVE</span>
			</div>
			<span>ENTRIES_TOTAL: {posts.length.toString().padStart(2, '0')}</span>
		</div>
	</div>
</section>

<style lang="postcss">
	@reference "tailwindcss";

	.origami-shard-blog {
		pointer-events: none;
	}

	/* Same glossy tape treatment as the hero/work CTAs — reuses the global
	   --tape-* tokens from app.css so every section's primary CTA reads as one brand. */
	.tape-cta {
		background: var(--tape-bg-grad);
		color: var(--tape-color);
		clip-path: polygon(0% 12%, 100% 0%, 96% 100%, 4% 88%);
		box-shadow: 0 6px 12px var(--tape-shadow);
		transition:
			box-shadow 0.3s ease,
			transform 0.3s ease;
	}

	.tape-cta:hover {
		box-shadow: 0 10px 16px var(--tape-shadow-hover);
		transform: translateY(-2px);
	}
</style>
