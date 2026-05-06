<script lang="ts">
	import { ArrowLeft, ExternalLink, Github, Layers, Calendar, Zap } from '@lucide/svelte';
	import { Splide, SplideSlide } from '@splidejs/svelte-splide';
	import Icon from '@/lib/components/ui/icon.svelte';
	import SEO from '@/lib/components/seo/seo.svelte';
	import ProjectCard from '@/lib/components/guest/card/project-card.svelte';
	import Breadcrumb from '$lib/components/ui/breadcrumb.svelte';
	import ProjectReactions from '$lib/components/project/project-reactions.svelte';
	import ProjectShare from '$lib/components/project/project-share.svelte';

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
		const ctx = gsap.context(() => {
			const tl = gsap.timeline();

			tl.from('.header-origami', {
				clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
				duration: 1,
				ease: 'power4.inOut'
			})
				.from(
					'.hero-stagger',
					{
						y: 30,
						rotateX: -10,
						opacity: 0,
						duration: 0.8,
						stagger: 0.1,
						ease: 'expo.out'
					},
					'-=0.4'
				)
				.from(
					'.content-stagger',
					{
						opacity: 0,
						y: 20,
						duration: 0.6,
						stagger: 0.1,
						ease: 'power2.out'
					},
					'-=0.2'
				);
		});

		return () => ctx.revert();
	});
</script>

<SEO title={project.title} description={project.description} image={project.thumbnailUrl} />

<div class="relative mt-28 min-h-screen pb-32">
	<!-- Industrial Background -->
	<div
		class="pointer-events-none fixed inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]"
		style="background-image: radial-gradient(var(--foreground) 1px, transparent 1px); background-size: 32px 32px;"
	></div>

	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<!-- Navigation HUD -->
		<div
			class="mb-12 flex flex-col gap-6 border-b-2 border-foreground/10 pb-8 md:flex-row md:items-center md:justify-between"
		>
			<Breadcrumb items={breadcrumbItems} />
			<a
				href={localizeHref('/projects')}
				class="group flex items-center border-2 border-foreground bg-background px-4 py-2 font-mono text-[10px] font-black tracking-widest uppercase transition-all hover:bg-foreground hover:text-background"
			>
				<ArrowLeft class="mr-2 size-3 transition-transform group-hover:-translate-x-1" />
				[RETURN_TO_ARCHIVE]
			</a>
		</div>

		<!-- Hero Section -->
		<header
			class="header-origami relative mb-20 border-x-4 border-foreground bg-card/50 p-8 md:p-16"
			style="clip-path: polygon(0 0, 100% 0, 98% 100%, 2% 100%);"
		>
			<div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
				<div class="max-w-4xl space-y-8 lg:col-span-8">
					<div class="hero-stagger">
						<div
							class="mb-4 inline-block border-2 border-foreground bg-primary px-3 py-1 font-mono text-[9px] font-black tracking-[0.2em] text-primary-foreground uppercase shadow-[3px_3px_0_var(--foreground)]"
						>
							[PROJECT_SPEC_v2.0]
						</div>
						<h1
							class="font-poppins text-5xl font-black tracking-tighter uppercase italic md:text-8xl"
						>
							{project.title}<span class="text-primary">_</span>
						</h1>
					</div>

					<p
						class="hero-stagger font-mono text-sm leading-relaxed tracking-wider text-muted-foreground uppercase md:text-lg"
					>
						// {project.description}
					</p>

					<div class="hero-stagger flex flex-wrap items-center gap-8 pt-4">
						<ProjectReactions {reactions} />
						<div class="hidden h-8 w-0.5 bg-foreground/10 md:block"></div>
						<ProjectShare title={project.title} />
					</div>
				</div>

				<!-- Secondary HUD Stats -->
				<div class="hero-stagger hidden lg:col-span-4 lg:block">
					<div class="space-y-6 border-l-2 border-foreground/10 pl-8">
						<div class="space-y-1">
							<p
								class="font-mono text-[9px] font-black tracking-widest text-muted-foreground uppercase"
							>
								[KERNEL_ID]
							</p>
							<p class="font-mono text-xs font-black uppercase">PID-{project.id.slice(0, 8)}</p>
						</div>
						<div class="space-y-1">
							<p
								class="font-mono text-[9px] font-black tracking-widest text-muted-foreground uppercase"
							>
								[DEPLOY_STATUS]
							</p>
							<div class="flex items-center gap-2">
								<div class="size-2 animate-pulse bg-green-500"></div>
								<p class="font-mono text-xs font-black uppercase">OPERATIONAL</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</header>

		<!-- Featured Media -->
		<section class="hero-stagger mb-24">
			<div
				class="relative border-4 border-foreground bg-card p-2 shadow-[12px_12px_0_var(--foreground)]"
				style="clip-path: polygon(0 1%, 100% 0, 99% 100%, 1% 99%);"
			>
				<div
					class="absolute -top-4 -left-4 border-2 border-foreground bg-primary px-3 py-1 font-mono text-[10px] font-black text-white"
				>
					[VISUAL_DATA_STREAM]
				</div>

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
								<img
									src={url}
									alt={project.title}
									class="aspect-video w-full object-cover grayscale transition-all duration-700 hover:grayscale-0"
								/>
							</SplideSlide>
						{/each}
					</Splide>
				{:else}
					<img
						src={project.thumbnailUrl}
						alt={project.title}
						class="aspect-video w-full object-cover grayscale transition-all duration-700 hover:grayscale-0"
					/>
				{/if}
			</div>
		</section>

		<!-- Main Content Grid -->
		<div class="grid grid-cols-1 gap-20 lg:grid-cols-[1fr_380px]">
			<!-- Project Content -->
			<div class="content-stagger space-y-16">
				<article class="prose-origami prose prose-lg max-w-none dark:prose-invert">
					{#if project.content}
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html project.content}
					{:else}
						<div class="border-4 border-dashed border-foreground/10 p-20 text-center">
							<Icon iconName="FileText" size={64} class="mx-auto mb-6 opacity-10" />
							<p class="font-mono text-sm tracking-widest text-muted-foreground uppercase">
								[CONTENT_NOT_LOCALIZED_OR_MISSING]
							</p>
						</div>
					{/if}
				</article>
			</div>

			<!-- Sidebar Info -->
			<aside class="content-stagger space-y-12">
				<!-- Project Links -->
				<div
					class="group relative border-4 border-foreground bg-card p-8 transition-all hover:shadow-[8px_8px_0_var(--primary)]"
				>
					<div class="mb-8 flex items-center justify-between border-b-2 border-foreground/10 pb-4">
						<h3 class="font-poppins text-lg font-black uppercase italic">[ACCESS_PANEL]</h3>
						<Zap class="size-5 text-primary" />
					</div>

					<div class="flex flex-col gap-4">
						{#if project.demoUrl}
							<a
								href={project.demoUrl}
								target="_blank"
								class="group/btn relative flex items-center justify-center border-4 border-foreground bg-primary px-6 py-4 font-mono text-xs font-black tracking-widest text-primary-foreground uppercase transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_var(--foreground)] active:translate-x-0 active:translate-y-0 active:shadow-none"
							>
								<ExternalLink class="mr-3 size-4 transition-transform group-hover/btn:rotate-12" />
								LIVE_PREVIEW
							</a>
						{/if}
						{#if project.repoUrl}
							<a
								href={project.repoUrl}
								target="_blank"
								class="group/btn relative flex items-center justify-center border-2 border-foreground bg-background px-6 py-4 font-mono text-xs font-black tracking-widest uppercase transition-all hover:bg-foreground hover:text-background"
							>
								<Github class="mr-3 size-4 transition-transform group-hover/btn:scale-110" />
								VIEW_SOURCE
							</a>
						{/if}
					</div>
				</div>

				<!-- Meta Data -->
				<div class="space-y-8 border-4 border-foreground bg-foreground/5 p-8">
					<div class="space-y-6">
						<div class="flex items-start gap-4">
							<div
								class="flex size-10 shrink-0 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground"
							>
								<Layers class="size-5" />
							</div>
							<div class="min-w-0 flex-1">
								<p
									class="mb-3 font-mono text-[9px] font-black tracking-widest text-muted-foreground uppercase"
								>
									[TECH_STACK_INVENTORY]
								</p>
								<div class="flex flex-wrap gap-2">
									{#each project.tags || [] as tag (tag.name)}
										<span
											class="border border-foreground/20 bg-background px-3 py-1 font-mono text-[10px] font-black uppercase transition-colors hover:bg-primary hover:text-white"
										>
											{tag.name}
										</span>
									{/each}
								</div>
							</div>
						</div>

						<div class="flex items-center gap-4">
							<div
								class="flex size-10 shrink-0 items-center justify-center border-2 border-foreground bg-foreground text-background"
							>
								<Calendar class="size-5" />
							</div>
							<div>
								<p
									class="mb-1 font-mono text-[9px] font-black tracking-widest text-muted-foreground uppercase"
								>
									[TEMPORAL_MARK]
								</p>
								<p class="font-mono text-xs font-black uppercase">
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

					<!-- Integrity Check -->
					<div class="border-t-2 border-foreground/10 pt-6">
						<div class="flex items-center gap-3">
							<div class="h-2 flex-1 bg-foreground/10">
								<div class="h-full w-full animate-pulse bg-primary"></div>
							</div>
							<span class="font-mono text-[8px] font-black uppercase">INTEGRITY_CHECK: PASSED</span>
						</div>
					</div>
				</div>
			</aside>
		</div>

		<!-- Related Projects Section -->
		{#if relatedProjects && relatedProjects.length > 0}
			<section class="content-stagger mt-32 space-y-16 border-t-4 border-foreground pt-20">
				<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
					<div>
						<div
							class="mb-4 inline-block border-2 border-foreground bg-foreground px-3 py-1 font-mono text-[9px] font-black text-background uppercase"
						>
							[RELATED_DATA_NODES]
						</div>
						<h3 class="font-poppins text-4xl font-black tracking-tighter uppercase italic">
							Related Projects<span class="text-primary">_</span>
						</h3>
					</div>
					<p class="max-w-md font-mono text-xs tracking-wider text-muted-foreground uppercase">
						// EXPLORE_OTHER_ARTIFACTS_IN_THE_ARCHIVE
					</p>
				</div>
				<div class="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
					{#each relatedProjects as related (related.id)}
						<ProjectCard project={related} />
					{/each}
				</div>
			</section>
		{/if}
	</div>
</div>

<style lang="postcss">
	@reference "tailwindcss";

	:global(.prose-origami) {
		& :global(h2) {
			@apply mt-16 mb-8 border-l-4 pl-6 text-3xl font-black tracking-tighter uppercase italic;
			border-color: var(--primary);
			font-family: var(--font-poppins);
		}
		& :global(p) {
			@apply mb-6 font-mono text-sm leading-relaxed tracking-tight uppercase;
			color: var(--muted-foreground);
		}
		& :global(strong) {
			@apply font-black underline decoration-2 underline-offset-4;
			color: var(--foreground);
			text-decoration-color: var(--primary);
		}
		& :global(ul) {
			@apply mb-8 space-y-3;
		}
		& :global(li) {
			@apply flex items-start gap-4 font-mono text-sm uppercase;
			&:before {
				content: '[+]';
				@apply shrink-0 font-black;
				color: var(--primary);
			}
		}
		& :global(img) {
			@apply mx-auto my-12;
			border-width: 4px;
			border-color: var(--foreground);
			box-shadow: 8px 8px 0 var(--foreground);
		}
	}

	.header-origami {
		transform-style: preserve-3d;
		perspective: 1000px;
	}
</style>
