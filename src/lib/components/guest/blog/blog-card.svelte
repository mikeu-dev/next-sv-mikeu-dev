<script lang="ts">
	import type { BlogPost } from '$lib/server/services/blog.service';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { page } from '$app/state';
	import { ArrowUpRight, Calendar, Clock, Sparkles, Hash } from '@lucide/svelte';

	let { post } = $props<{ post: BlogPost }>();

	const formattedDate = $derived(
		new Date(post.date).toLocaleDateString(page.data.locale || getLocale(), {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		})
	);

	const isNew = $derived(
		new Date().getTime() - new Date(post.date).getTime() < 7 * 24 * 60 * 60 * 1000
	);
</script>

<article class="group relative h-full">
	<a
		href={localizeHref(`/blog/${post.slug}`)}
		class="blog-card-container flex h-full flex-col bg-card transition-all duration-500 hover:bg-primary/5 dark:hover:bg-primary/10"
	>
		<!-- Image Wrapper with Clip-Path -->
		<div
			class="relative aspect-video overflow-hidden"
			style="clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);"
		>
			<img
				src={post.thumbnailUrl || '/images/placeholder-blog.jpg'}
				alt={post.title}
				class="h-full w-full object-cover grayscale transition-all duration-700 ease-out group-hover:scale-110 group-hover:grayscale-0"
				loading="lazy"
			/>

			<!-- Technical Overlay -->
			<div class="absolute top-4 left-4 flex flex-col gap-2">
				{#if isNew}
					<div
						class="flex items-center gap-1 bg-primary px-3 py-1 font-mono text-[9px] font-black tracking-widest text-primary-foreground uppercase"
					>
						<Sparkles class="size-3" /> [NEW_ENTRY]
					</div>
				{/if}
				<div
					class="flex items-center gap-1 bg-foreground/90 px-3 py-1 font-mono text-[9px] font-black tracking-widest text-background uppercase"
				>
					<Calendar class="size-3" />
					{formattedDate}
				</div>
			</div>
		</div>

		<!-- Content -->
		<div class="flex flex-1 flex-col p-6">
			<!-- Tags -->
			<div class="mb-4 flex flex-wrap gap-3">
				{#each post.tags || [] as tag (tag)}
					<span
						class="flex items-center gap-1 font-mono text-[9px] font-bold tracking-widest text-primary uppercase"
					>
						<Hash class="size-2" />
						{tag}
					</span>
				{/each}
			</div>

			<div class="flex items-start justify-between gap-4">
				<h3
					class="font-poppins text-xl leading-tight font-black tracking-tighter transition-colors group-hover:text-primary lg:text-2xl"
				>
					{post.title}
				</h3>
				<div class="shrink-0 transition-transform duration-300 group-hover:rotate-45">
					<ArrowUpRight class="size-6 text-primary" />
				</div>
			</div>

			<p
				class="mt-4 line-clamp-2 font-mono text-xs leading-relaxed text-muted-foreground/80 uppercase"
			>
				{post.description}
			</p>

			<!-- Reading Time & CTA -->
			<div class="mt-auto flex items-center justify-between border-t border-foreground/10 pt-6">
				{#if post.readingTime}
					<div
						class="flex items-center gap-2 font-mono text-[10px] font-black text-foreground/50 uppercase"
					>
						<Clock class="size-3" />
						<span>{post.readingTime} MIN_READ</span>
					</div>
				{/if}

				<div
					class="flex items-center gap-1 font-mono text-[10px] font-black text-primary opacity-0 transition-all duration-300 group-hover:opacity-100"
				>
					<span>VIEW_ARCHIVE_ENTRY</span>
				</div>
			</div>
		</div>
	</a>
</article>

<style lang="postcss">
	@reference "tailwindcss";

	article {
		perspective: 1000px;
	}

	.blog-card-container {
		transform-style: preserve-3d;
		border: 2px solid var(--foreground);
		clip-path: polygon(0 0, 98% 0, 100% 100%, 2% 100%);
		transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
	}

	.group:hover .blog-card-container {
		transform: translateZ(20px);
		border-color: var(--primary);
	}

	@media (max-width: 1024px) {
		.blog-card-container {
			clip-path: none !important;
		}
	}
</style>
