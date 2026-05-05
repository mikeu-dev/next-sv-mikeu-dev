<script lang="ts">
	import { ArrowLeft, ExternalLink, Github, Layers, Calendar } from '@lucide/svelte';
	import { Splide, SplideSlide } from '@splidejs/svelte-splide';
	import { Button } from '@/lib/components/ui/button';
	import Icon from '@/lib/components/ui/icon.svelte';
	import { m } from '@/lib/paraglide/messages.js';
	import SEO from '@/lib/components/seo/seo.svelte';
	import Breadcrumb from '$lib/components/ui/breadcrumb.svelte';
	import ProjectReactions from '$lib/components/project/project-reactions.svelte';
	import ProjectShare from '$lib/components/project/project-share.svelte';
	import ProjectCard from '@/lib/components/guest/card/project-card.svelte';

	import { getLocalizedProject } from '$lib/utils/project-mapper';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import type { Project } from '$lib/types';

	interface ProjectPageData {
		project: Project;
		reactions: { likes: number; views: number };
		relatedProjects: Project[];
	}

	let { data }: { data: ProjectPageData } = $props();
	let project = $derived(getLocalizedProject(data.project, getLocale()));
	let reactions = $derived(data.reactions);
	let relatedProjects = $derived(
		(data.relatedProjects || []).map((p) => getLocalizedProject(p, getLocale()))
	);

	let breadcrumbItems = $derived([
		{ label: 'Projects', href: '/projects' },
		{ label: project.title, href: page.url.pathname }
	]);

	onMount(() => {
		const tl = gsap.timeline();
		tl.from('.hero-stagger', {
			y: 40,
			opacity: 0,
			duration: 0.8,
			stagger: 0.1,
			ease: 'power3.out'
		}).from(
			'.content-stagger',
			{
				y: 20,
				opacity: 0,
				duration: 0.6,
				stagger: 0.1,
				ease: 'power2.out'
			},
			'-=0.4'
		);
	});
</script>

<SEO title={project.title} description={project.description} image={project.thumbnailUrl} />

<div class="mx-auto mt-28 max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
	<!-- Breadcrumb & Back -->
	<div class="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
		<Breadcrumb items={breadcrumbItems} />
		<a
			href={localizeHref('/projects')}
			class="inline-flex items-center text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
		>
			<ArrowLeft class="mr-2 size-4" />
			{m.project_button_back()}
		</a>
	</div>

	<!-- Hero Section -->
	<header class="mb-16 space-y-8">
		<div class="max-w-4xl space-y-6">
			<h1
				class="hero-stagger font-poppins text-5xl leading-tight font-black tracking-tight md:text-7xl"
			>
				{project.title}<span class="text-primary">.</span>
			</h1>
			<p class="hero-stagger text-xl leading-relaxed text-muted-foreground md:text-2xl">
				{project.description}
			</p>

			<div class="hero-stagger flex flex-wrap items-center gap-6 pt-4">
				<ProjectReactions {reactions} />
				<div class="hidden h-6 w-px bg-border md:block"></div>
				<ProjectShare title={project.title} />
			</div>
		</div>

		<!-- Featured Media -->
		<div
			class="hero-stagger overflow-hidden rounded-3xl border border-border/50 bg-card shadow-2xl"
		>
			{#if project.imagesUrl && project.imagesUrl.length > 0}
				<Splide
					aria-label="Project Images"
					options={{
						rewind: true,
						autoplay: true,
						interval: 4000,
						type: 'fade',
						speed: 1000,
						arrows: project.imagesUrl.length > 1,
						pagination: project.imagesUrl.length > 1
					}}
				>
					{#each project.imagesUrl as url (url)}
						<SplideSlide>
							<img src={url} alt={project.title} class="aspect-video w-full object-cover" />
						</SplideSlide>
					{/each}
				</Splide>
			{:else}
				<img
					src={project.thumbnailUrl}
					alt={project.title}
					class="aspect-video w-full object-cover"
				/>
			{/if}
		</div>
	</header>

	<!-- Main Content Grid -->
	<div class="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_350px]">
		<!-- Project Content -->
		<div class="content-stagger space-y-12">
			<article class="prose prose-lg max-w-none dark:prose-invert">
				{#if project.content}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html project.content}
				{:else}
					<div class="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
						<Icon iconName="FileText" size={48} class="mx-auto mb-4 opacity-20" />
						<p>{m.project_content_not_found()}</p>
					</div>
				{/if}
			</article>
		</div>

		<!-- Sidebar Info -->
		<aside class="content-stagger space-y-10">
			<!-- Project Links -->
			<div class="space-y-4 rounded-3xl border border-border/50 bg-card/50 p-8 shadow-sm">
				<h3 class="font-poppins text-lg font-black">{m.project_button_demo()} & Code</h3>
				<div class="flex flex-col gap-3">
					{#if project.demoUrl}
						<Button
							href={project.demoUrl}
							target="_blank"
							class="w-full rounded-xl py-6 font-bold shadow-lg shadow-primary/20"
						>
							<ExternalLink class="mr-2 size-5" />
							Live Preview
						</Button>
					{/if}
					{#if project.repoUrl}
						<Button
							href={project.repoUrl}
							target="_blank"
							variant="outline"
							class="w-full rounded-xl py-6 font-bold"
						>
							<Github class="mr-2 size-5" />
							View Source
						</Button>
					{/if}
				</div>
			</div>

			<!-- Meta Data -->
			<div class="space-y-6 rounded-3xl border border-border/50 bg-card/50 p-8 shadow-sm">
				<div class="flex items-start gap-4">
					<div
						class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
					>
						<Layers class="size-5" />
					</div>
					<div>
						<p class="text-xs font-bold tracking-widest text-muted-foreground uppercase">
							Tech Stack
						</p>
						<div class="mt-3 flex flex-wrap gap-2">
							{#each project.tags || [] as tag (tag.name)}
								<span
									class="rounded-lg bg-muted px-3 py-1.5 text-xs font-bold transition-colors hover:bg-primary/10 hover:text-primary"
								>
									{tag.name}
								</span>
							{/each}
						</div>
					</div>
				</div>

				<div class="flex items-center gap-4">
					<div
						class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
					>
						<Calendar class="size-5" />
					</div>
					<div>
						<p class="text-xs font-bold tracking-widest text-muted-foreground uppercase">
							Project Date
						</p>
						<p class="font-bold">
							{project.createdAt
								? new Date(project.createdAt).toLocaleDateString(getLocale(), {
										month: 'long',
										year: 'numeric'
									})
								: 'N/A'}
						</p>
					</div>
				</div>
			</div>
		</aside>
	</div>

	<!-- Related Projects Section -->
	{#if relatedProjects && relatedProjects.length > 0}
		<section class="content-stagger mt-24 space-y-10 border-t border-border/50 pt-16">
			<div class="flex items-end justify-between">
				<div>
					<h3 class="font-poppins text-3xl font-black tracking-tight md:text-4xl">
						Related Projects<span class="text-primary">.</span>
					</h3>
					<p class="mt-2 text-muted-foreground">
						Explore other projects that you might find interesting.
					</p>
				</div>
			</div>
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each relatedProjects as related (related.id)}
					<ProjectCard project={related} />
				{/each}
			</div>
		</section>
	{/if}
</div>
