<script lang="ts">
	import type { BlogHeading } from '$lib/server/utils/markdown';
	import { onMount } from 'svelte';

	let {
		headings = [],
		title,
		titleId = 'post-title'
	}: { headings: BlogHeading[]; title?: string; titleId?: string } = $props();

	// The markdown parser only collects H2/H3 from the article body, so the
	// list would otherwise start mid-article with no way to jump back to the
	// top — prepend the post title itself as the first, unindented entry.
	let items = $derived<BlogHeading[]>(
		title ? [{ depth: 2, text: title, id: titleId }, ...headings] : headings
	);

	let activeId = $state('');

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						activeId = entry.target.id;
					}
				});
			},
			{ rootMargin: '-100px 0% -80% 0%' }
		);

		items.forEach((item) => {
			const el = document.getElementById(item.id);
			if (el) observer.observe(el);
		});

		return () => observer.disconnect();
	});

	function scrollTo(id: string) {
		const el = document.getElementById(id);
		if (el) {
			const offset = 100;
			const bodyRect = document.body.getBoundingClientRect().top;
			const elementRect = el.getBoundingClientRect().top;
			const elementPosition = elementRect - bodyRect;
			const offsetPosition = elementPosition - offset;

			window.scrollTo({
				top: offsetPosition,
				behavior: 'smooth'
			});
		}
	}
</script>

{#if items.length > 0}
	<nav class="hidden xl:block">
		<div class="space-y-4">
			<!-- Scrolls internally instead of growing past the viewport — the list
			     sits inside a `sticky` box, so once it's genuinely pinned in place
			     any overflow can no longer be reached by scrolling the page. -->
			<ul class="max-h-[calc(100vh-14rem)] space-y-1 overflow-y-auto pr-1">
				{#each items as item (item.id)}
					<li class={`${item.depth === 3 ? 'pl-4' : ''}`}>
						<button
							onclick={() => scrollTo(item.id)}
							class={`group relative flex w-full items-center border-2 border-transparent px-3 py-2 text-left font-mono text-[10px] font-black tracking-widest uppercase transition-all ${
								activeId === item.id
									? 'border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0_var(--foreground)]'
									: 'text-card-foreground/60 hover:bg-card-foreground/5 hover:text-card-foreground'
							}`}
						>
							{#if activeId === item.id}
								<span class="mr-2">[X]</span>
							{:else}
								<span class="mr-2 text-card-foreground/30 group-hover:text-primary">[-]</span>
							{/if}
							{item.text}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</nav>
{/if}
