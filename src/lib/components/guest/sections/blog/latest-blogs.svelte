<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import BlogCard from '../../blog/blog-card.svelte';
	import type { BlogPost } from '$lib/server/services/blog.service';
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import Icon from '$lib/components/ui/icon.svelte';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { Hash, Command, Terminal } from '@lucide/svelte';

	let { posts = [] } = $props<{ posts: BlogPost[] }>();

	let section = $state<HTMLElement>();

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		const ctx = gsap.context(() => {
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: section,
					start: 'top 80%',
					toggleActions: 'play none none none'
				}
			});

			// Origami Reveal
			tl.from('.origami-shard', {
				rotateX: -90,
				opacity: 0,
				duration: 1.2,
				stagger: 0.1,
				ease: 'power4.out'
			})
			.from('.blog-stagger', {
				y: 50,
				opacity: 0,
				duration: 1,
				stagger: 0.2,
				ease: 'expo.out'
			}, '-=0.8');

			// Mouse Parallax
			const handleMouseMove = (e: MouseEvent) => {
				const { clientX, clientY } = e;
				const x = (clientX / window.innerWidth - 0.5) * 10;
				const y = (clientY / window.innerHeight - 0.5) * 10;

				gsap.to('.parallax-layer', {
					rotateY: x,
					rotateX: -y,
					duration: 1.2,
					ease: 'power2.out'
				});
			};

			window.addEventListener('mousemove', handleMouseMove);
			return () => window.removeEventListener('mousemove', handleMouseMove);
		}, section);

		return () => ctx.revert();
	});
</script>

<section id="latest-blog" bind:this={section} class="relative overflow-hidden bg-background py-24 md:py-32">
	<!-- Grain Texture Overlay -->
	<div
		class="pointer-events-none absolute inset-0 z-50 opacity-[0.03] mix-blend-overlay contrast-150 grayscale"
		style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E');"
	></div>

	<div class="container relative mx-auto px-6">
		<div class="parallax-layer relative">
			
			<!-- Decorative Shards -->
			<div 
				class="origami-shard absolute -top-24 -right-24 size-96 bg-primary/5 dark:bg-primary/10"
				style="clip-path: polygon(20% 0%, 100% 20%, 80% 100%, 0% 80%);"
			></div>
			<div 
				class="origami-shard absolute -bottom-24 -left-24 size-80 bg-foreground/5"
				style="clip-path: polygon(0% 10%, 90% 0%, 100% 90%, 10% 100%);"
			></div>

			<!-- Header -->
			<div class="blog-stagger mb-16 border-b-2 border-foreground pb-12">
				<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
					<div class="flex items-center gap-2 font-mono text-[10px] font-black text-primary uppercase tracking-[0.2em]">
						<Terminal class="size-3" /> ARCHIVE_SCAN: RECENT_ENTRIES
					</div>
					<div class="flex items-center gap-2 font-mono text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">
						<Command class="size-3 animate-pulse" /> [READY_FOR_READING]
					</div>
				</div>

				<h2 class="font-poppins text-5xl font-black tracking-tighter sm:text-7xl lg:text-8xl">
					{m.blog_latest_header()} <span class="text-primary italic">{m.blog_title()}</span><span class="text-primary">.</span>
				</h2>
				
				<p class="mt-8 max-w-2xl font-mono text-xs leading-relaxed text-muted-foreground uppercase sm:text-sm">
					{m.blog_subtitle()}
				</p>
			</div>

			{#if posts.length > 0}
				<!-- Grid -->
				<div class="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
					{#each posts as post (post.slug)}
						<div class="blog-stagger h-full">
							<BlogCard {post} />
						</div>
					{/each}
				</div>

				<!-- CTA -->
				<div class="blog-stagger mt-24 text-center">
					<a
						href={localizeHref('/blog')}
						class="group relative inline-flex h-20 items-center justify-center overflow-hidden bg-foreground px-12 text-background transition-all hover:bg-primary hover:text-primary-foreground sm:w-80"
						style="clip-path: polygon(0% 15%, 100% 0%, 95% 100%, 5% 85%);"
					>
						<div class="flex items-center gap-4">
							<span class="font-poppins text-xl font-black tracking-tighter uppercase">
								{m.blog_card_button()}
							</span>
							<Icon
								iconName="BsArrowRight"
								size={20}
								class="transition-transform duration-300 group-hover:translate-x-2"
							/>
						</div>
					</a>
				</div>
			{:else}
				<div class="blog-stagger py-24 text-center">
					<div class="mx-auto mb-6 flex size-16 items-center justify-center border-2 border-foreground/10">
						<Hash class="size-8 text-foreground/20" />
					</div>
					<p class="font-mono text-sm font-black text-muted-foreground uppercase tracking-widest">{m.blog_empty()}</p>
				</div>
			{/if}

			<!-- Footer Technicality -->
			<div class="mt-24 flex items-center justify-between border-t-2 border-foreground/10 pt-8 font-mono text-[8px] font-black tracking-[0.3em] text-foreground/30 uppercase">
				<p>PROTOCOL: BLOG_ARCHIVE_SECURED</p>
				<p>ENTRIES_TOTAL: {posts.length.toString().padStart(2, '0')}</p>
			</div>
		</div>
	</div>
</section>

<style lang="postcss">
	@reference "tailwindcss";

	#latest-blog {
		perspective: 1200px;
	}

	.parallax-layer {
		transform-style: preserve-3d;
	}

	.blog-stagger {
		transform: translateZ(30px);
	}

	.origami-shard {
		pointer-events: none;
	}
</style>

