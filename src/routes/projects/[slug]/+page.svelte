<script lang="ts">
	import { ArrowLeft } from '@lucide/svelte';
	import { Splide, SplideSlide } from '@splidejs/svelte-splide';
	import { Button } from '@/lib/components/ui/button';
	import Icon from '@/lib/components/ui/icon.svelte';
	import * as m from '@/lib/paraglide/messages.js';
	import SEO from '@/lib/components/seo/seo.svelte';
	import Breadcrumb from '$lib/components/ui/breadcrumb.svelte';

	import { getLocalizedProject } from '$lib/utils/project-mapper';
	import { getLocale } from '$lib/paraglide/runtime';
	import { base } from '$app/paths';
	import { page } from '$app/state';

	let { data } = $props();
	// Transform the raw project data into the localized version immediately
	let project = $derived(getLocalizedProject(data.project, getLocale()));

	let breadcrumbItems = $derived([
		{ label: 'Projects', href: '/projects' },
		{ label: project.title, href: page.url.pathname }
	]);
</script>

<SEO title={project.title} description={project.description} image={project.thumbnailUrl} />

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<div class="mx-auto mt-20 max-w-4xl py-12 md:py-16">
	<Breadcrumb items={breadcrumbItems} />
	
	<div class="mb-8">
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a
			href="{base}/projects"
			class="inline-flex items-center text-sm text-muted-foreground no-underline hover:text-foreground"
		>
			<ArrowLeft class="mr-2 size-4" />
			{m.project_button_back()}
		</a>
	</div>

	<article>
		<header class="mb-8">
			<h1 class="font-poppins mb-2 text-4xl font-black tracking-tight md:text-5xl">
				{project.title}<span class="text-primary">.</span>
			</h1>
			<p class="mt-4 text-lg leading-relaxed text-muted-foreground">{project.description}</p>

			<div class="mt-4 flex flex-wrap gap-2">
				{#if project.tags && project.tags.length > 0}
					{#each project.tags as tag (tag.name)}
						<span
							class={`group-hover:bg-opacity-20 flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold transition-colors ${tag.color === '#171d26' ? 'dark:text-white!' : ''}`}
							style="background-color: {tag.color}1A; color: {tag.color};"
						>
							{#if tag.icon}
								<Icon src={tag.icon} size={16} />
							{/if}
							{tag.name}
						</span>
					{/each}
				{/if}
			</div>
		</header>

		{#if project.imagesUrl && project.imagesUrl.length > 0}
			<Splide aria-label="Project Images" class="mb-8" options={{ rewind: true, autoplay: true }}>
				{#each project.imagesUrl as url (url)}
					<SplideSlide>
						<img src={url} alt={project.title} />
					</SplideSlide>
				{/each}
			</Splide>
		{:else}
			<img
				src={project.thumbnailUrl}
				alt="Project thumbnail for {project.title}"
				class="mb-8 w-full rounded-lg border object-cover shadow-md"
			/>
		{/if}

		<div class="prose prose-lg max-w-none dark:prose-invert">
			{#if project.content}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html project.content}
			{:else}
				<p>{m.project_content_not_found()}</p>
			{/if}
		</div>

		<footer class="mt-12 flex items-center gap-4 border-t pt-8">
			{#if project.repoUrl}
				<Button href={project.repoUrl} target="_blank" variant="outline">
					<Icon iconName="Github" size={16} class="mr-2" />
					{m.project_button_view_code()}
				</Button>
			{/if}
			{#if project.demoUrl}
				<Button href={project.demoUrl} target="_blank">
					<Icon iconName="ExternalLink" size={16} class="mr-2" />
					{m.project_button_demo()}
				</Button>
			{/if}
		</footer>
	</article>
</div>
