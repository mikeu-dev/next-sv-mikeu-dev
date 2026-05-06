<script lang="ts">
	import type { BlogPost } from '$lib/server/services/blog.service';
	import Icon from '$lib/components/ui/icon.svelte';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
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
<article
	class="group relative overflow-hidden border-2 border-foreground bg-card transition-all duration-500 hover:border-primary/50"
	style="clip-path: polygon(0 0, 98% 0, 100% 100%, 2% 100%);"
>
	<a href={localizeHref(`/blog/${post.slug}`)} class="flex flex-col md:flex-row">
		<!-- Image Section -->
		<div
			class="relative h-72 overflow-hidden md:h-auto md:w-1/2"
			style="clip-path: polygon(0 0, 100% 0, 95% 100%, 0 100%);"
		>
			<img
				src={post.thumbnailUrl || '/images/placeholder-blog.jpg'}
				alt={post.title}
				class="h-full w-full object-cover grayscale transition-all duration-700 ease-out group-hover:scale-110 group-hover:grayscale-0"
			/>
			<div
				class="absolute inset-0 bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100"
			></div>

			<!-- Featured Label -->
			<div class="absolute top-6 left-6">
				<div
					class="bg-primary px-4 py-1 font-mono text-[10px] font-black tracking-[0.2em] text-primary-foreground uppercase shadow-[4px_4px_0_var(--foreground)]"
				>
					[FEATURED_ENTRY]
				</div>
			</div>
		</div>

		<!-- Content Section -->
		<div class="flex flex-col justify-center p-8 md:w-1/2 md:p-12 lg:p-16">
			<div class="mb-6 flex flex-wrap gap-3">
				{#each post.tags || [] as tag (tag)}
					<span
						class="border border-foreground/10 px-3 py-1 font-mono text-[9px] font-black tracking-widest text-primary uppercase transition-all group-hover:border-primary/50"
					>
						#{tag}
					</span>
				{/each}
			</div>

			<h2
				class="font-poppins text-3xl leading-tight font-black tracking-tighter transition-colors group-hover:text-primary md:text-5xl lg:text-6xl"
			>
				{post.title}
			</h2>

			<p
				class="mt-8 line-clamp-3 font-mono text-xs leading-relaxed tracking-tight text-muted-foreground uppercase md:text-sm"
			>
				// {post.description}
			</p>

			<div class="mt-10 flex flex-wrap items-center gap-8 border-t border-foreground/10 pt-8">
				<div
					class="flex items-center gap-2 font-mono text-[10px] font-black tracking-widest text-foreground/40 uppercase"
				>
					<Icon iconName="BsCalendar3" size={12} />
					<span>[STAMP: {formattedDate}]</span>
				</div>
				{#if post.readingTime}
					<div
						class="flex items-center gap-2 font-mono text-[10px] font-black tracking-widest text-foreground/40 uppercase"
					>
						<Icon iconName="BsClock" size={12} />
						<span>[LOAD: {post.readingTime} MIN]</span>
					</div>
				{/if}
			</div>

			<div class="mt-10">
				<div
					class="inline-flex items-center gap-4 border-2 border-foreground bg-foreground px-6 py-3 font-mono text-[10px] font-black tracking-widest text-background uppercase transition-all group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:bg-primary group-hover:text-white group-hover:shadow-[4px_4px_0_var(--foreground)]"
				>
					{m.blog_card_button()}
					<Icon
						iconName="BsArrowRight"
						size={14}
						class="transition-transform group-hover:translate-x-1"
					/>
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

	@media (max-width: 768px) {
		article {
			clip-path: none !important;
		}
	}
</style>
