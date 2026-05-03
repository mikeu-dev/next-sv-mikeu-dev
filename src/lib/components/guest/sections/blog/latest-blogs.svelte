<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import BlogCard from '../../blog/blog-card.svelte';
	import type { BlogPost } from '$lib/server/services/blog.service';
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import Icon from '$lib/components/ui/icon.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';

	let { posts = [] } = $props<{ posts: BlogPost[] }>();

	let section: HTMLElement;

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		const ctx = gsap.context(() => {
			gsap.from('.blog-stagger', {
				scrollTrigger: {
					trigger: section,
					start: 'top 80%'
				},
				y: 30,
				opacity: 0,
				duration: 0.8,
				stagger: 0.2,
				ease: 'power3.out'
			});
		}, section);

		return () => ctx.revert();
	});
</script>

<section id="latest-blog" bind:this={section} class="relative overflow-hidden py-24 md:py-32">
	<div class="relative container mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="blog-stagger mb-16 text-center">
			<h2 class="font-poppins text-4xl font-black tracking-tight md:text-6xl">
				{m.blog_latest_header()} <span class="text-primary italic">{m.blog_title()}</span>.
			</h2>
			<p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
				{m.blog_subtitle()}
			</p>
		</div>

		{#if posts.length > 0}
			<!-- Grid -->
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each posts as post (post.slug)}
					<div class="blog-stagger h-full">
						<BlogCard {post} />
					</div>
				{/each}
			</div>

			<!-- CTA -->
			<div class="blog-stagger mt-20 text-center">
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a
					href={localizeHref('/blog')}
					class="group inline-flex items-center gap-3 rounded-full bg-primary/10 px-8 py-4 text-sm font-bold tracking-widest text-primary uppercase shadow-lg shadow-primary/10 transition-all hover:bg-primary hover:text-primary-foreground"
				>
					{m.blog_card_button()}
					<Icon
						iconName="BsArrowRight"
						size={16}
						class="transition-transform group-hover:translate-x-2"
					/>
				</a>
			</div>
		{:else}
			<div class="blog-stagger py-12 text-center">
				<p class="text-muted-foreground italic">{m.blog_empty()}</p>
			</div>
		{/if}
	</div>
</section>

<style>
	:global(.font-poppins) {
		font-family: 'Poppins', sans-serif;
	}
</style>
