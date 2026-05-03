<script lang="ts">
	import type { BlogHeading } from '$lib/server/utils/markdown';
	import { onMount } from 'svelte';

	let { headings = [] } = $props<{ headings: BlogHeading[] }>();

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

		headings.forEach((heading: BlogHeading) => {
			const el = document.getElementById(heading.id);
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

{#if headings.length > 0}
	<nav class="hidden xl:block">
		<div class="sticky top-32 max-h-[calc(100vh-160px)] overflow-y-auto">
			<h4 class="mb-4 text-sm font-bold tracking-wider text-foreground uppercase">
				On This Page
			</h4>
			<ul class="space-y-3 border-l text-sm">
				{#each headings as heading (heading.id)}
					<li class={`${heading.depth === 3 ? 'pl-6' : 'pl-4'}`}>
						<button
							onclick={() => scrollTo(heading.id)}
							class={`text-left transition-colors hover:text-primary ${
								activeId === heading.id
									? 'border-l-2 border-primary -ml-[17px] pl-[15px] font-bold text-primary'
									: 'text-muted-foreground'
							}`}
						>
							{heading.text}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</nav>
{/if}
