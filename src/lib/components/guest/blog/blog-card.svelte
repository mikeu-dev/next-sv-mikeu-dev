<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { BlogPost } from '$lib/server/services/blog.service';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { page } from '$app/state';
	import { ArrowUpRight, Calendar, Clock, Sparkles } from '@lucide/svelte';

	let { post } = $props<{ post: BlogPost }>();

	const formattedDate = $derived(
		new Date(post.date).toLocaleDateString(page.data.locale || getLocale(), {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		})
	);

	// Check if post is new (less than 7 days old)
	const isNew = $derived(
		new Date().getTime() - new Date(post.date).getTime() < 7 * 24 * 60 * 60 * 1000
	);
</script>

<article class="group relative h-full">
	<a
		href={localizeHref(`/blog/${post.slug}`)}
		class="flex h-full flex-col overflow-hidden rounded-3xl border border-border/50 bg-card transition-all duration-500 hover:border-primary/50 hover:shadow-[0_20px_50px_-12px_rgba(var(--primary-rgb),0.15)]"
	>
		<!-- Image Wrapper -->
		<div class="relative aspect-video overflow-hidden">
			<img
				src={post.thumbnailUrl || '/images/placeholder-blog.jpg'}
				alt={post.title}
				class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
				loading="lazy"
			/>
			
			<!-- Overlay Gradient -->
			<div class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

			<!-- Floating Badges -->
			<div class="absolute top-4 left-4 flex flex-wrap gap-2">
				{#if isNew}
					<div class="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-black text-white shadow-lg animate-pulse">
						<Sparkles class="size-3" />
						NEW
					</div>
				{/if}
				<div class="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md border border-white/20 shadow-xl">
					<Calendar class="size-3" />
					{formattedDate}
				</div>
			</div>
		</div>

		<Card.Header class="flex-1 p-5">
			<div class="mb-3 flex flex-wrap gap-2">
				{#each post.tags || [] as tag (tag)}
					<span class="text-[10px] font-black tracking-widest text-primary uppercase opacity-60 group-hover:opacity-100 transition-opacity">
						#{tag}
					</span>
				{/each}
			</div>

			<div class="flex items-start justify-between gap-4">
				<Card.Title class="font-poppins text-lg leading-[1.3] font-black transition-colors group-hover:text-primary md:text-xl">
					{post.title}
				</Card.Title>
				<div class="mt-1 shrink-0 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
					<ArrowUpRight class="size-5 text-primary" />
				</div>
			</div>

			<Card.Description class="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground/80">
				{post.description}
			</Card.Description>
		</Card.Header>

		<Card.Footer class="flex items-center gap-6 border-t border-border/30 px-6 py-4 text-xs font-medium text-muted-foreground">
			{#if post.readingTime}
				<div class="flex items-center gap-2">
					<Clock class="size-4 text-primary" />
					<span>{post.readingTime} min read</span>
				</div>
			{/if}
			
			<div class="ml-auto flex items-center gap-1 text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
				<span class="font-bold">Read More</span>
			</div>
		</Card.Footer>
	</a>
</article>

<style>
	article {
		perspective: 1000px;
	}
	
	:global(.group:hover) {
		transform: translateY(-4px);
		transition: transform 0.3s ease;
	}
</style>
