<script lang="ts">
	import type { BlogHeading } from '#lib/server/utils/markdown.js';
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
	<!-- Scrolls internally instead of growing past the viewport — the list sits
	     inside a sticky box, so overflow could otherwise never be reached. -->
	<ul class="m-0 flex max-h-[calc(100vh-18rem)] list-none flex-col gap-1 overflow-y-auto p-0 pr-1">
		{#each items as item (item.id)}
			{@const on = activeId === item.id}
			<li class={item.depth === 3 ? 'pl-4' : ''}>
				<button
					type="button"
					onclick={() => scrollTo(item.id)}
					aria-current={on ? 'true' : undefined}
					class="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-[15px] leading-snug font-extrabold text-foreground transition-colors {on
						? 'bg-accent'
						: 'hover:bg-secondary'}"
				>
					<span
						class="size-3 flex-none rounded-full border-[2.5px] {on
							? 'border-primary bg-primary'
							: 'border-line-strong bg-card'}"
					></span>
					<span class="line-clamp-2">{item.text}</span>
				</button>
			</li>
		{/each}
	</ul>
{/if}
