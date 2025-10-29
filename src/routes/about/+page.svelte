<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { techStack } from '@/lib/data/techstack';
	import { getLocale } from '@/lib/paraglide/runtime';
	import { Icon } from 'svelte-icons-pack';
	import { journey } from '@/lib/data/journey';
	import * as m from '$lib/paraglide/messages';
	let initialLocale = $state(getLocale());
	let techstack = $derived(techStack[initialLocale] || techStack['en']);
	let myJourney = $derived(journey[initialLocale] || journey['en']);
	let container: HTMLElement;
	let journeySection: HTMLElement;
	let wavingHand: HTMLElement;

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		// Animate container elements on scroll
		if (container) {
			gsap.from(container.children, {
				y: 30,
				opacity: 0,
				duration: 0.5,
				ease: 'power2.out',
				stagger: 0.2
			});
		}

		// Animate waving hand emoji
		if (wavingHand) {
			gsap.to(wavingHand, {
				rotation: 15,
				transformOrigin: '70% 70%',
				duration: 0.4,
				ease: 'power1.inOut',
				yoyo: true,
				repeat: -1
			});
		}

		// Animate journey items on scroll
		const journeyItems = journeySection.querySelectorAll('.journey-item');
		journeyItems.forEach((item) => {
			gsap.from(item, {
				opacity: 0,
				x: item.classList.contains('text-right') ? 50 : -50,
				duration: 0.6,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: item,
					start: 'top 90%'
				}
			});
		});
	});
</script>

<div bind:this={container} class="mx-auto max-w-5xl space-y-20 py-12 md:space-y-28 md:py-20 mt-20">
	<section class="text-center">
		<h1 class="font-poppins text-4xl font-bold tracking-tight md:text-5xl">{m.about_title()}</h1>
		<p class="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
			{m.about_subtitle()}
		</p>
	</section>

	<section class="grid grid-cols-1 items-center gap-12 md:grid-cols-5">
		<div class="md:col-span-1">
			<!-- Placeholder for a profile picture -->
			<!-- <div
				class="aspect-square rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 shadow-lg"
			></div> -->
			<img
				src="https://github.com/mikeu-dev.png"
				alt="@mikeu-dev"
				srcset=""
				class="aspect-square rounded"
			/>
		</div>
		<div class="md:col-span-3">
			<h2 class="font-poppins mb-4 text-3xl font-bold tracking-tight">
				{m.about_begin_first_part()} <span bind:this={wavingHand} class="inline-block">👋</span>, {m.about_begin_second_part(
					{
						name: 'Riki Ruswandi (Mikeu)'
					}
				)}
			</h2>
			<div class="prose max-w-none space-y-4 text-muted-foreground lg:prose-lg">
				<p>
					{@html m.about_desc_first_part()}
				</p>
				<p>
					{@html m.about_desc_second_part()}
				</p>
			</div>
		</div>
	</section>

	<section bind:this={journeySection} class="py-16">
		<h2 class="font-poppins mb-12 text-center text-3xl font-bold tracking-tight">
			{m.about_jurney_title()}
		</h2>

		<div class="relative mx-auto max-w-5xl px-4">
			<!-- Garis tengah (desktop) -->
			<div
				class="absolute top-0 left-1/2 hidden h-full w-0.5 -translate-x-1/2 bg-border md:block"
			></div>

			<!-- Timeline Items -->
			<div class="space-y-16">
				{#each myJourney as item, i}
					<div class="relative flex flex-col md:flex-row md:items-center">
						<!-- Kolom kiri -->
						<div class="hidden w-1/2 justify-end pr-12 text-right md:flex">
							{#if i % 2 === 0}
								<div class="max-w-sm">
									<h3 class="font-poppins text-xl font-bold">{item.title}</h3>
									<p class="mt-1 text-muted-foreground">{item.description}</p>
								</div>
							{/if}
						</div>

						<!-- Titik tengah (hanya desktop) -->
						<div
							class="absolute left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center md:flex"
						>
							<div
								class="flex size-16 flex-col items-center justify-center rounded-full border-2 border-primary bg-background"
							>
								<span class="font-poppins text-lg font-bold text-primary">
									{item.year}
								</span>
							</div>
						</div>

						<!-- Kolom kanan -->
						<div class="hidden w-1/2 justify-start pl-12 text-left md:flex">
							{#if i % 2 !== 0}
								<div class="max-w-sm">
									<h3 class="font-poppins text-xl font-bold">{item.title}</h3>
									<p class="mt-1 text-muted-foreground">{item.description}</p>
								</div>
							{/if}
						</div>

						<!-- Versi mobile (satu kolom) -->
						<div class="flex flex-col md:hidden">
							<div class="absolute top-8 left-[1.3rem] h-full w-0.5 bg-border"></div>
							<div
								class="z-10 mb-4 flex size-12 flex-col items-center justify-center rounded-full border-2 border-primary bg-background text-primary"
							>
								<span class="font-poppins text-sm font-bold">{item.year}</span>
							</div>
							<div class="pl-10">
								<h3 class="font-poppins text-xl font-bold">{item.title}</h3>
								<p class="mt-1 text-muted-foreground">{item.description}</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section>
		<h2 class="font-poppins mb-8 text-center text-3xl font-bold tracking-tight">
			{m.about_teckstack_title()}
		</h2>
		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			{#each techstack as skillCategory}
				<div class="rounded-lg border bg-card p-6 text-card-foreground">
					<h3 class="font-poppins mb-2 text-xl font-bold">{skillCategory.category}</h3>
					<p class="mb-4 text-sm text-muted-foreground">{skillCategory.description}</p>
					<div class="flex flex-wrap gap-2">
						{#each skillCategory.items as tech}
							<span
								class="group-hover:bg-opacity-20 flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold transition-colors"
								style="background-color: {tech.color}1A; color: {tech.color};"
							>
								{#if tech.icon}
									<Icon src={tech.icon} size={16} />
								{/if}
								{tech.name}
							</span>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</section>
</div>
