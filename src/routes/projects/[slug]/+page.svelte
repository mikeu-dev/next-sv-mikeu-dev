<script lang="ts">
	import SEO from '@/lib/components/seo/seo.svelte';
	import Icon from '@/lib/components/ui/icon.svelte';
	import ProjectReactions from '#lib/components/project/project-reactions.svelte';
	import ProjectShare from '#lib/components/project/project-share.svelte';
	import MapThumb from '#lib/components/guest/map/map-thumb.svelte';
	import { toMapProjects } from '#lib/components/guest/map/project-geo.js';
	import { getLocalizedProject } from '#lib/utils/project-mapper.js';
	import { optimizeImage } from '#lib/utils/image.util.js';
	import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
	import { m } from '#lib/paraglide/messages.js';
	import type { Project } from '#lib/types.js';

	interface ProjectPageData {
		project: Project;
		reactions: { likes: number; views: number };
		relatedProjects: Project[];
	}

	let { data }: { data: ProjectPageData } = $props();
	const locale = getLocale();

	let project = $derived(getLocalizedProject(data.project, locale));
	let geo = $derived(toMapProjects([data.project], locale, localizeHref)[0]);
	let related = $derived(toMapProjects(data.relatedProjects || [], locale, localizeHref));
	let gallery = $derived(
		project.imagesUrl?.length
			? project.imagesUrl
			: project.thumbnailUrl
				? [project.thumbnailUrl]
				: []
	);

	const dateFmt = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'id-ID', {
		month: 'long',
		year: 'numeric'
	});
	let released = $derived(project.createdAt ? dateFmt.format(new Date(project.createdAt)) : '—');

	// Illustrative bounding-box query: hits inside the box are blue, the rest grey.
	const HITS = [
		[40, 36],
		[47, 52],
		[56, 40],
		[60, 60],
		[44, 62]
	];
	const MISSES = [
		[20, 30],
		[78, 22],
		[84, 76],
		[14, 80]
	];
</script>

<SEO title={project.title} description={project.description} image={project.thumbnailUrl} />

<div
	class="mx-auto box-border flex max-w-[1440px] flex-col gap-14 px-[clamp(16px,4vw,56px)] pt-28 pb-24 sm:pt-32"
>
	<div class="flex flex-col gap-6">
		<ol
			aria-label={m.gis_breadcrumb()}
			class="m-0 flex list-none flex-wrap gap-2 p-0 font-mono text-sm text-muted-foreground"
		>
			<li>
				<a href={localizeHref('/')} class="underline hover:text-foreground">{m.gis_home()}</a>
			</li>
			<li aria-hidden="true">/</li>
			<li>
				<a href={localizeHref('/projects')} class="underline hover:text-foreground"
					>{m.gis_projects()}</a
				>
			</li>
			<li aria-hidden="true">/</li>
			<li aria-current="page" class="font-semibold text-foreground">{project.title}</li>
		</ol>
		<div class="flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
			<div class="flex max-w-[860px] flex-[1_1_560px] flex-col gap-[18px]">
				{#if geo.category}
					<p
						class="m-0 inline-flex items-center gap-2.5 self-start rounded-full bg-accent px-3.5 py-[7px] font-mono text-[13px] font-semibold text-primary"
					>
						{geo.category}
					</p>
				{/if}
				<h1 class="m-0 text-[clamp(40px,5.4vw,76px)] leading-[1.02] font-black tracking-[-0.035em]">
					{project.title}
				</h1>
				<p class="m-0 text-[19px] leading-relaxed text-ink-soft">{project.description}</p>
			</div>
			<dl
				class="m-0 grid flex-[0_1_380px] grid-cols-2 overflow-hidden rounded-3xl border border-border bg-card"
			>
				<div class="border-r border-b border-border px-5 py-4">
					<dt class="font-mono text-xs text-muted-foreground">{m.gis_work_released()}</dt>
					<dd class="m-0 mt-1 font-extrabold">{released}</dd>
				</div>
				<div class="border-b border-border px-5 py-4">
					<dt class="font-mono text-xs text-muted-foreground">{m.blog_views()}</dt>
					<dd class="m-0 mt-1 font-extrabold">{data.reactions?.views ?? 0}</dd>
				</div>
				<div class="border-r border-border px-5 py-4">
					<dt class="font-mono text-xs text-muted-foreground">{m.gis_status()}</dt>
					<dd class="m-0 mt-1 flex items-center gap-2 font-extrabold">
						<span class="size-2.5 rounded-full bg-success"></span>
						{project.demoUrl ? m.gis_status_live() : m.gis_status_code()}
					</dd>
				</div>
				<div class="px-5 py-4">
					<dt class="font-mono text-xs text-muted-foreground">Layer</dt>
					<dd class="m-0 mt-1 font-mono font-extrabold">PID-{project.id.slice(0, 6)}</dd>
				</div>
			</dl>
		</div>
		<div class="flex flex-wrap gap-2.5">
			{#if project.demoUrl}
				<a
					href={project.demoUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="btn-pill-solid min-h-[52px] px-[26px]"
				>
					{m.gis_live_preview()}
					<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
						<path
							d="M6 3h9v9M15 3L4 14"
							fill="none"
							stroke="currentColor"
							stroke-width="2.2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</a>
			{/if}
			{#if project.repoUrl}
				<a
					href={project.repoUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="btn-pill-line min-h-[52px]"
				>
					{m.project_button_view_code()}
				</a>
			{/if}
			<a href={localizeHref('/projects')} class="btn-pill-line min-h-[52px]"
				>{m.gis_back_archive()}</a
			>
		</div>
	</div>

	<!-- Illustrative bbox query on the project's layer -->
	<figure class="m-0">
		<div
			role="img"
			aria-label={project.title}
			class="relative aspect-[16/8] min-h-[300px] overflow-hidden rounded-[32px] border border-border"
		>
			<MapThumb x={geo.x} y={geo.y} zoom={1.4} variant="none" />
			<div
				class="bbox absolute top-[26%] left-[34%] h-[42%] w-[30%] rounded-md border-[3px] border-primary bg-primary/12"
			></div>
			{#each HITS as [x, y] (`${x}-${y}`)}
				<span
					class="hit absolute -mt-[7px] -ml-[7px] size-3.5 rounded-full border-[3px] border-white bg-primary shadow-[0_2px_6px_rgba(23,33,43,.25)]"
					style="left: {x}%; top: {y}%"
				></span>
			{/each}
			{#each MISSES as [x, y] (`${x}-${y}`)}
				<span
					class="absolute -mt-[7px] -ml-[7px] size-3.5 rounded-full border-[3px] border-white bg-pin-idle shadow-[0_2px_6px_rgba(23,33,43,.25)]"
					style="left: {x}%; top: {y}%"
				></span>
			{/each}
			<div
				class="absolute top-4 right-4 hidden flex-col gap-1.5 rounded-[18px] border border-border bg-card px-[18px] py-3.5 shadow-float sm:flex"
			>
				<span class="font-mono text-xs text-muted-foreground">BOUNDING BOX QUERY</span>
				<span class="text-lg font-black">{HITS.length} features</span>
				<span class="font-mono text-xs text-muted-foreground">{geo.code} · {project.title}</span>
			</div>
		</div>
	</figure>

	{#if project.content}
		<section aria-labelledby="ov" class="flex flex-wrap gap-x-14 gap-y-8">
			<div class="map-reveal flex flex-[1_1_320px] flex-col gap-3">
				<p class="eyebrow">{m.gis_overview()}</p>
				<h2
					id="ov"
					class="m-0 text-[clamp(30px,3.4vw,44px)] leading-[1.08] font-black tracking-[-0.02em]"
				>
					{project.title}
				</h2>
			</div>
			<div
				class="prose prose-lg max-w-none min-w-0 flex-[2_1_480px] text-ink-soft dark:prose-invert"
			>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html project.content}
			</div>
		</section>
	{:else}
		<p class="m-0 text-lg text-muted-foreground">{m.project_content_not_found()}</p>
	{/if}

	{#if project.tags?.length}
		<section
			aria-labelledby="st"
			class="flex flex-wrap items-center justify-between gap-6 rounded-[28px] bg-secondary p-7"
		>
			<h2 id="st" class="m-0 text-[26px] font-black">{m.gis_tech_stack()}</h2>
			<div class="flex flex-wrap gap-2">
				{#each project.tags as tag (tag.name)}
					<span
						class="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-[9px] text-[15px] font-extrabold"
					>
						{#if tag.icon}<Icon src={tag.icon} size={16} label={tag.name} />{/if}
						{tag.name}
					</span>
				{/each}
			</div>
		</section>
	{/if}

	{#if gallery.length}
		<section aria-labelledby="gl" class="flex flex-col gap-5">
			<h2 id="gl" class="m-0 text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em]">
				{m.gis_gallery()}
			</h2>
			<div class="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-4">
				{#each gallery as url, i (url)}
					<a
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						class="lift block overflow-hidden rounded-3xl border border-border bg-card"
					>
						<img
							src={optimizeImage(url, { width: 900, quality: 80 })}
							alt={m.gis_screenshot({ n: i + 1 })}
							loading="lazy"
							class="aspect-[4/3] w-full object-cover"
						/>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<div class="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
		<ProjectReactions reactions={data.reactions} />
		<ProjectShare title={project.title} />
	</div>

	{#if related.length}
		<section aria-labelledby="rl" class="flex flex-col gap-5">
			<h2 id="rl" class="m-0 text-[clamp(28px,3vw,40px)] font-black tracking-[-0.02em]">
				{m.gis_related_projects()}
			</h2>
			<div class="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-4">
				{#each related as r (r.project.id)}
					<a
						href={r.href}
						class="map-card lift flex items-center gap-4 rounded-3xl p-3 text-foreground"
					>
						<span class="relative size-24 flex-none overflow-hidden rounded-[18px]">
							<MapThumb x={r.x} y={r.y} zoom={5.2} />
						</span>
						<span class="flex min-w-0 flex-col gap-1">
							<span class="font-mono text-xs font-semibold text-primary">{r.code}</span>
							<span class="text-lg font-black">{r.title}</span>
							{#if r.category}<span class="truncate text-sm text-muted-foreground"
									>{r.category}</span
								>{/if}
						</span>
					</a>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.bbox {
		transform-origin: 0 0;
		animation: bbox 6s ease-in-out infinite;
	}
	.hit {
		animation: hit 6s ease-in-out infinite;
	}
	@keyframes bbox {
		0% {
			transform: scale(0.1);
			opacity: 0;
		}
		10% {
			opacity: 1;
		}
		35%,
		90% {
			transform: scale(1);
			opacity: 1;
		}
		100% {
			transform: scale(1);
			opacity: 0;
		}
	}
	@keyframes hit {
		0%,
		35% {
			transform: scale(0);
		}
		45%,
		90% {
			transform: scale(1);
		}
		100% {
			transform: scale(0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.bbox,
		.hit {
			animation: none;
		}
	}
</style>
