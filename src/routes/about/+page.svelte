<script lang="ts">
	import { onMount } from 'svelte';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import {
		Atom,
		Box,
		Braces,
		CodeXml,
		Cog,
		Container,
		Database,
		Globe,
		MapPin,
		Mouse,
		Server,
		Type,
		Wind
	} from '@lucide/svelte';
	import { gsap } from '@/lib/utils';

	let container: HTMLElement;
	let journeySection: HTMLElement;
	let wavingHand: HTMLElement;

	const techStack = [
		{
			category: 'Core Expertise',
			description: 'Technologies I use daily and know inside-out.',
			items: [
				{ name: 'SvelteKit', icon: Braces },
				{ name: 'Next.js', icon: CodeXml },
				{ name: 'TypeScript', icon: Type },
				{ name: 'Laravel', icon: Server },
				{ name: 'Tailwind CSS', icon: Wind }
			]
		},
		{
			category: 'Comfortable With',
			description: 'Tools I have significant experience with.',
			items: [
				{ name: 'React', icon: Atom },
				{ name: 'Leaflet', icon: MapPin },
				{ name: 'OpenLayers', icon: Globe },
				{ name: 'MySQL', icon: Database },
				{ name: 'Docker', icon: Container }
			]
		},
		{
			category: 'Exploring',
			description: 'What I am currently learning and experimenting with.',
			items: [
				{ name: 'Go', icon: Mouse },
				{ name: 'Rust', icon: Cog },
				{ name: 'WebAssembly', icon: Box }
			]
		}
	];

	const journey = [
		{
			year: '2021',
			title: 'The Spark',
			description:
				'Began my web development journey, diving into the fundamentals of HTML, CSS, and JavaScript.'
		},
		{
			year: '2022',
			title: 'First Professional Steps',
			description:
				'Landed my first freelance projects, focusing on building interactive Web GIS applications with Leaflet and Laravel.'
		},
		{
			year: '2023',
			title: 'Framework Mastery',
			description:
				'Deepened my expertise in modern frameworks, embracing SvelteKit and Next.js for building high-performance applications.'
		},
		{
			year: 'Present',
			title: 'Continuous Growth',
			description:
				'Currently studying at STMIK Mardira Indonesia while actively contributing to open-source and exploring advanced concepts like WebAssembly and Go.'
		}
	];

	onMount(() => {
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

<div bind:this={container} class="mx-auto max-w-4xl space-y-20 py-12 md:space-y-28 md:py-20">
	<section class="text-center">
		<h1 class="font-poppins text-4xl font-bold tracking-tight md:text-5xl">About Me</h1>
		<p class="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
			A little more about my journey, my skills, and what I'm passionate about.
		</p>
	</section>

	<section class="grid grid-cols-1 items-center gap-12 md:grid-cols-5">
		<div class="md:col-span-1">
			<!-- Placeholder for a profile picture -->
			<div
				class="aspect-square rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 shadow-lg"
			></div>
		</div>
		<div class="md:col-span-3">
			<h2 class="font-poppins mb-4 text-3xl font-bold tracking-tight">
				Hi there <span bind:this={wavingHand} class="inline-block">👋</span>, I'm Riki Ruswandi
				(Mikeu)
			</h2>
			<div class="prose lg:prose-lg max-w-none space-y-4 text-muted-foreground">
				<p>
					As a developer based in Indonesia, I'm driven by a passion for exploring the ever-evolving
					worlds of programming and web technology. I have a particular interest in the geospatial
					domain, and my work is currently centered on building innovative
					<strong>web-based GIS solutions</strong>.
				</p>
				<p>
					My professional philosophy is built on three pillars: <em>consistency</em>, a
					<em>curious mind</em>, and a commitment to <em>sharing knowledge</em>. This approach is
					fundamental to growth in tech, motivating me to dive into new tools and share what I learn
					with the community.
				</p>
			</div>
		</div>
	</section>

	<section bind:this={journeySection}>
		<h2 class="font-poppins mb-12 text-center text-3xl font-bold tracking-tight">My Journey</h2>
		<div class="relative">
			<!-- Vertical line -->
			<div class="absolute top-0 left-1/2 h-full w-0.5 -translate-x-1/2 bg-border"></div>

			<div class="space-y-16">
				{#each journey as item, i}
					<div class="journey-item relative flex items-center" class:text-right={i % 2 === 0}>
						<div class="flex w-1/2 justify-end pr-8 text-right">
							{#if i % 2 === 0}
								<div class="max-w-sm">
									<h3 class="font-poppins text-xl font-bold">{item.title}</h3>
									<p class="mt-1 text-muted-foreground">{item.description}</p>
								</div>
							{/if}
						</div>

						<!-- Dot and Year -->
						<div class="absolute left-1/2 z-10 -translate-x-1/2">
							<div
								class="flex size-16 flex-col items-center justify-center rounded-full border-2 border-primary bg-background"
							>
								<span class="font-poppins text-lg font-bold text-primary">{item.year}</span>
							</div>
						</div>

						<div class="flex w-1/2 justify-start pl-8">
							{#if i % 2 !== 0}
								<div class="max-w-sm">
									<h3 class="font-poppins text-xl font-bold">{item.title}</h3>
									<p class="mt-1 text-muted-foreground">{item.description}</p>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section>
		<h2 class="font-poppins mb-8 text-center text-3xl font-bold tracking-tight">My Tech Stack</h2>
		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			{#each techStack as skillCategory}
				<div class="rounded-lg border bg-card p-6 text-card-foreground">
					<h3 class="font-poppins mb-2 text-xl font-bold">{skillCategory.category}</h3>
					<p class="mb-4 text-sm text-muted-foreground">{skillCategory.description}</p>
					<div class="flex flex-wrap gap-2">
						{#each skillCategory.items as tech}
							<span
								class="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
							>
								<svelte:component this={tech.icon} class="size-4" />
								{tech.name}
							</span>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</section>
</div>
