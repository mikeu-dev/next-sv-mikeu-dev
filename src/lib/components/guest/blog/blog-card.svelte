<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { BlogPost } from '$lib/server/services/blog.service';
	import Icon from '$lib/components/ui/icon.svelte';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { page } from '$app/state';

	let { post } = $props<{ post: BlogPost }>();

	const formattedDate = $derived(
		new Date(post.date).toLocaleDateString(page.data.locale || getLocale(), {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<article class="group relative h-full">
	<a
		href={localizeHref(`/blog/${post.slug}`)}
		class="block h-full overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
	>
		<div class="aspect-video overflow-hidden">
			<img
				src={post.thumbnailUrl || '/images/placeholder-blog.jpg'}
				alt={post.title}
				class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
				loading="lazy"
			/>
		</div>

		<Card.Header class="p-6">
			<div class="mb-3 flex flex-wrap gap-2">
				{#each post.tags || [] as tag (tag)}
					<span
						class="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold tracking-wider text-primary uppercase"
					>
						{tag}
					</span>
				{/each}
			</div>

			<Card.Title
				class="line-clamp-2 font-poppins text-xl leading-tight font-bold transition-colors group-hover:text-primary"
			>
				{post.title}
			</Card.Title>
			<Card.Description class="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
				{post.description}
			</Card.Description>
		</Card.Header>

		<Card.Footer
			class="mt-auto flex items-center justify-between border-t p-6 text-xs text-muted-foreground"
		>
			<div class="flex items-center gap-2">
				<Icon iconName="BsCalendar3" size={12} />
				<span>{formattedDate}</span>
			</div>
			{#if post.readingTime}
				<div class="flex items-center gap-2">
					<Icon iconName="BsClock" size={12} />
					<span>{post.readingTime} min read</span>
				</div>
			{/if}
		</Card.Footer>
	</a>
</article>

<style>
	article {
		perspective: 1000px;
	}
</style>
