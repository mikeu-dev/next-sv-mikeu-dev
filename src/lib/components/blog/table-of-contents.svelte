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
		<div class="space-y-4">
			<ul class="space-y-1">
				{#each headings as heading (heading.id)}
					<li class={`${heading.depth === 3 ? 'pl-4' : ''}`}>
						<button
							onclick={() => scrollTo(heading.id)}
							class={`group relative flex w-full items-center border-2 border-transparent px-3 py-2 text-left font-mono text-[10px] font-black tracking-widest uppercase transition-all ${
								activeId === heading.id
									? 'border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0_var(--foreground)]'
									: 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
							}`}
						>
							{#if activeId === heading.id}
								<span class="mr-2">[X]</span>
							{:else}
								<span class="mr-2 text-foreground/20 group-hover:text-primary">[-]</span>
							{/if}
							{heading.text}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</nav>
{/if}
