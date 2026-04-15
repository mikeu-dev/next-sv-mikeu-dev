<script lang="ts">
	import type { BlogPost } from '$lib/server/services/blog.service';
	import { base } from '$app/paths';
	import Icon from '$lib/components/ui/icon.svelte';
	import { getLocale } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	let { post } = $props<{ post: BlogPost }>();

	const formattedDate = $derived(
		new Date(post.date).toLocaleDateString(getLocale(), {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<article class="group relative overflow-hidden rounded-3xl border bg-card shadow-xl transition-all duration-500 hover:border-primary/30">
	<a href={`${base}/blog/${post.slug}`} class="flex flex-col md:flex-row">
		<div class="h-64 overflow-hidden md:h-auto md:w-1/2">
			<img
				src={post.thumbnailUrl || '/images/placeholder-blog.jpg'}
				alt={post.title}
				class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
			/>
		</div>

		<div class="flex flex-col justify-center p-8 md:w-1/2 md:p-12">
			<div class="mb-4 flex flex-wrap gap-2">
				<span class="rounded-full bg-primary/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary">
					Featured Post
				</span>
				{#each post.tags || [] as tag (tag)}
					<span class="rounded-full bg-muted px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
						{tag}
					</span>
				{/each}
			</div>

			<h2 class="font-poppins text-3xl font-black leading-tight tracking-tighter md:text-5xl group-hover:text-primary transition-colors">
				{post.title}
			</h2>
			
			<p class="mt-6 line-clamp-3 text-lg leading-relaxed text-muted-foreground">
				{post.description}
			</p>

			<div class="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
				<div class="flex items-center gap-2">
					<Icon iconName="BsCalendar3" size={14} />
					<span>{formattedDate}</span>
				</div>
				{#if post.readingTime}
					<div class="flex items-center gap-2">
						<Icon iconName="BsClock" size={14} />
						<span>{post.readingTime} min read</span>
					</div>
				{/if}
			</div>

			<div class="mt-8">
				<span class="inline-flex items-center gap-2 font-bold text-primary group-hover:gap-4 transition-all uppercase tracking-widest text-xs">
					{m.blog_card_button()}
					<Icon iconName="BsArrowRight" size={16} />
				</span>
			</div>
		</div>
	</a>
</article>
