<script lang="ts">
	import Breadcrumb from '$lib/components/ui/breadcrumb.svelte';
	import type { PageData } from './$types';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { ArrowLeft, Clock, Calendar, Database, BookOpen } from '@lucide/svelte';
	import MarkdownRenderer from '$lib/components/ui/markdown-renderer.svelte';
	import ReadingProgress from '$lib/components/blog/reading-progress.svelte';
	import TableOfContents from '$lib/components/blog/table-of-contents.svelte';
	import RelatedPosts from '$lib/components/blog/related-posts.svelte';
	import BlogReactions from '$lib/components/blog/blog-reactions.svelte';
	import BlogShare from '$lib/components/blog/blog-share.svelte';
	import { page } from '$app/state';
	import SEO from '$lib/components/seo/seo.svelte';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	let { data }: { data: PageData } = $props();

	let breadcrumbItems = $derived([
		{ label: 'Blog', href: '/blog' },
		{ label: data.meta.title, href: page.url.pathname }
	]);

	let container: HTMLElement;

	onMount(() => {
		const ctx = gsap.context(() => {
			const tl = gsap.timeline();
			
			tl.from('.header-origami', {
				clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
				duration: 1,
				ease: 'power4.inOut'
			})
			.from('.stagger-item', {
				y: 30,
				rotateX: -10,
				opacity: 0,
				duration: 0.8,
				stagger: 0.1,
				ease: 'expo.out'
			}, '-=0.4')
			.from('.content-stagger', {
				opacity: 0,
				y: 20,
				duration: 0.6,
				stagger: 0.1,
				ease: 'power2.out'
			}, '-=0.2');
		});

		return () => ctx.revert();
	});
</script>

<SEO
	title={data.meta.title}
	description={data.meta.description}
	image={data.meta.image}
	type="article"
	article={{
		publishedTime: data.meta.date,
		author: 'Mikeu',
		tags: data.meta.tags
	}}
/>

<ReadingProgress />

<div bind:this={container} class="relative mt-28 min-h-screen pb-32">
	<!-- Industrial Background -->
	<div class="pointer-events-none fixed inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]" 
		style="background-image: radial-gradient(var(--foreground) 1px, transparent 1px); background-size: 32px 32px;">
	</div>

	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<!-- Navigation HUD -->
		<div class="mb-12 flex flex-col gap-6 border-b-2 border-foreground/10 pb-8 md:flex-row md:items-center md:justify-between">
			<Breadcrumb items={breadcrumbItems} />
			<a
				href={localizeHref('/blog')}
				class="group flex items-center border-2 border-foreground bg-background px-4 py-2 font-mono text-[10px] font-black tracking-widest uppercase transition-all hover:bg-foreground hover:text-background"
			>
				<ArrowLeft class="mr-2 size-3 transition-transform group-hover:-translate-x-1" />
				[RETURN_TO_DATABASE]
			</a>
		</div>

		<div class="grid grid-cols-1 gap-16 xl:grid-cols-[1fr_300px]">
			<article class="min-w-0">
				<!-- Hero Section -->
				<header class="header-origami relative mb-20 border-x-4 border-foreground bg-card/50 p-8 md:p-16"
					style="clip-path: polygon(0 0, 100% 0, 98% 100%, 2% 100%);">
					<div class="max-w-4xl space-y-8">
						<div class="stagger-item">
							<div class="inline-block border-2 border-foreground bg-primary px-3 py-1 font-mono text-[9px] font-black tracking-[0.2em] text-primary-foreground uppercase mb-4 shadow-[3px_3px_0_var(--foreground)]">
								[KNOWLEDGE_NODE_v1.0]
							</div>
							<h1 class="font-poppins text-4xl font-black tracking-tighter md:text-7xl italic uppercase leading-tight">
								{data.meta.title}<span class="text-primary">_</span>
							</h1>
						</div>

						<div class="stagger-item flex flex-wrap items-center gap-8 border-t-2 border-foreground/10 pt-8">
							{#if data.meta.date}
								<div class="flex items-center gap-3">
									<Calendar class="size-4 text-primary" />
									<time datetime={data.meta.date} class="font-mono text-xs font-black uppercase">
										{new Date(data.meta.date).toLocaleDateString(getLocale(), {
											year: 'numeric',
											month: 'long',
											day: 'numeric'
										})}
									</time>
								</div>
							{/if}

							{#if data.meta.readingTime}
								<div class="flex items-center gap-3">
									<Clock class="size-4 text-primary" />
									<span class="font-mono text-xs font-black uppercase">{data.meta.readingTime} MIN_READ</span>
								</div>
							{/if}

							<div class="flex items-center gap-3 border-l-2 border-foreground/10 pl-8">
								<Database class="size-4 text-muted-foreground" />
								<span class="font-mono text-[10px] font-black uppercase tracking-widest text-muted-foreground">ID: BLOG-{data.meta.title.slice(0, 4).toUpperCase()}</span>
							</div>
						</div>
					</div>

					<!-- Industrial Tags -->
					<div class="absolute -top-4 -right-4 border-2 border-foreground bg-black px-4 py-1 font-mono text-[10px] font-black text-white shadow-[4px_4px_0_var(--primary)] dark:bg-white dark:text-black">
						[LIVE_ARCHIVE]
					</div>
				</header>

				<div class="content-stagger">
					<MarkdownRenderer content={data.content} isRendered={true} />
				</div>

				<div class="content-stagger mt-20 flex flex-col gap-8 border-t-4 border-foreground pt-12 pb-4 md:flex-row md:items-center md:justify-between">
					<BlogReactions reactions={data.reactions} />
					<BlogShare title={data.meta.title} />
				</div>

				<div class="content-stagger">
					<RelatedPosts posts={data.relatedPosts} />
				</div>
			</article>

			<!-- Sidebar -->
			<aside class="content-stagger hidden xl:block">
				<div class="sticky top-32 space-y-12">
					<div class="border-4 border-foreground bg-card p-6 shadow-[6px_6px_0_var(--foreground)]">
						<div class="mb-6 flex items-center gap-3 border-b-2 border-foreground/10 pb-3">
							<BookOpen class="size-4 text-primary" />
							<h4 class="font-poppins text-xs font-black uppercase tracking-widest">[NAV_HUD]</h4>
						</div>
						<TableOfContents headings={data.headings || []} />
					</div>

					<!-- System Status Widget -->
					<div class="border-4 border-foreground bg-foreground/5 p-6">
						<div class="space-y-4">
							<div class="flex items-center justify-between">
								<span class="font-mono text-[9px] font-black uppercase">SYNC_STATUS</span>
								<span class="font-mono text-[9px] font-black text-green-500 uppercase">ONLINE</span>
							</div>
							<div class="h-1 bg-foreground/10">
								<div class="h-full w-full bg-primary animate-pulse"></div>
							</div>
							<p class="font-mono text-[8px] tracking-tight text-muted-foreground uppercase">
								// KNOWLEDGE_STREAM_ACTIVE_ID: 0x{Math.random().toString(16).slice(2, 8).toUpperCase()}
							</p>
						</div>
					</div>
				</div>
			</aside>
		</div>
	</div>
</div>

<style lang="postcss">
	@reference "tailwindcss";

	.header-origami {
		transform-style: preserve-3d;
		perspective: 1000px;
	}
</style>
