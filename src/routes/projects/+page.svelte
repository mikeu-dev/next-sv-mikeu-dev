<script lang="ts">
	import type { PageData } from './$types';
	import type { Project } from '#lib/types.js';
	import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
	import { m } from '#lib/paraglide/messages.js';
	import SEO from '#lib/components/seo/seo.svelte';
	import PageHeader from '#lib/components/guest/map/page-header.svelte';
	import MapThumb from '#lib/components/guest/map/map-thumb.svelte';
	import { toMapProjects } from '#lib/components/guest/map/project-geo.js';

	let { data }: { data: PageData } = $props();
	const locale = getLocale();
	const pageSize = 6;

	let initial = $derived(
		((data.projects as Record<string, Project[]>)[locale] ||
			(data.projects as Record<string, Project[]>)['id'] ||
			[]) as Project[]
	);

	// "Load more" appends to the server's first page.
	let extra = $state<Project[]>([]);
	// Writable derived: resets from the server page, then flips off once exhausted.
	let hasMore = $derived(initial.length >= pageSize);
	let loadingMore = $state(false);
	let all = $derived(
		toMapProjects(
			[...initial, ...extra.filter((p) => !initial.some((i) => i.id === p.id))],
			locale,
			localizeHref
		)
	);
	async function loadMore() {
		if (loadingMore || !hasMore) return;
		loadingMore = true;
		try {
			const res = await fetch(`/api/projects?limit=${pageSize}&offset=${all.length}`);
			const next = res.ok ? await res.json() : [];
			if (!Array.isArray(next) || next.length === 0) hasMore = false;
			else {
				extra = [...extra, ...next];
				if (next.length < pageSize) hasMore = false;
			}
		} catch (e) {
			console.error('Failed to load more projects:', e);
		} finally {
			loadingMore = false;
		}
	}

	// Filters
	const ALL = '__all__';
	let q = $state('');
	let tag = $state(ALL);
	let sort = $state<'date' | 'az'>('date');
	let view = $state<'grid' | 'map'>('grid');
	let selectedId = $state<string | null>(null);

	let allTags = $derived([...new Set(all.flatMap((p) => p.tags))]);
	let list = $derived.by(() => {
		const query = q.trim().toLowerCase();
		const out = all.filter(
			(p) =>
				(tag === ALL || p.tags.includes(tag)) &&
				(!query || `${p.title} ${p.description} ${p.tags.join(' ')}`.toLowerCase().includes(query))
		);
		return sort === 'az'
			? [...out].sort((a, b) => a.title.localeCompare(b.title))
			: [...out].sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));
	});
	let selected = $derived(list.find((p) => p.project.id === selectedId) ?? list[0]);

	function reset() {
		q = '';
		tag = ALL;
	}

	const segBtn = (on: boolean) =>
		`flex min-h-11 items-center gap-2 rounded-full px-4 text-[15px] font-extrabold ${on ? 'bg-card text-foreground' : 'text-muted-foreground hover:text-foreground'}`;
	const chip = (on: boolean) =>
		`min-h-11 rounded-full border-[1.5px] px-4 text-[15px] font-extrabold transition-colors ${on ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground hover:border-foreground'}`;
</script>

<SEO title={m.projects_title()} description={m.projects_subtitle()} />

<PageHeader
	eyebrow={m.gis_projects_eyebrow({ count: String(all.length).padStart(2, '0') })}
	title={m.gis_projects_title()}
	lead={m.gis_projects_lead()}
	focus="50% 40%"
/>

<div
	class="mx-auto box-border flex max-w-[1440px] flex-col gap-6 px-[clamp(16px,4vw,56px)] pt-10 pb-24"
>
	<div class="map-card flex flex-wrap items-center gap-3 p-3">
		<label
			class="flex min-h-[52px] flex-[1_1_320px] items-center gap-2.5 rounded-full bg-secondary px-[18px]"
		>
			<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
				<circle cx="9" cy="9" r="6" fill="none" stroke="var(--muted-foreground)" stroke-width="2" />
				<path
					d="M14 14l4 4"
					stroke="var(--muted-foreground)"
					stroke-width="2"
					stroke-linecap="round"
				/>
			</svg>
			<span class="sr-only">{m.gis_search_projects()}</span>
			<input
				type="search"
				bind:value={q}
				placeholder={m.gis_search_projects()}
				class="min-w-0 flex-1 border-0 bg-transparent text-base font-semibold text-foreground outline-none placeholder:text-muted-foreground"
			/>
		</label>
		<div
			role="group"
			aria-label={m.gis_sort_label()}
			class="flex gap-1 rounded-full bg-secondary p-1"
		>
			<button
				type="button"
				aria-pressed={sort === 'date'}
				onclick={() => (sort = 'date')}
				class={segBtn(sort === 'date')}>{m.gis_sort_latest()}</button
			>
			<button
				type="button"
				aria-pressed={sort === 'az'}
				onclick={() => (sort = 'az')}
				class={segBtn(sort === 'az')}>{m.gis_sort_az()}</button
			>
		</div>
		<div
			role="group"
			aria-label={m.gis_view_label()}
			class="flex gap-1 rounded-full bg-secondary p-1"
		>
			<button
				type="button"
				aria-pressed={view === 'grid'}
				onclick={() => (view = 'grid')}
				class={segBtn(view === 'grid')}
			>
				<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
					<path
						d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linejoin="round"
					/>
				</svg>
				{m.gis_view_list()}
			</button>
			<button
				type="button"
				aria-pressed={view === 'map'}
				onclick={() => (view = 'map')}
				class={segBtn(view === 'map')}
			>
				<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
					<path
						d="M1 3l4.5-1.5 5 1.5L15 1.5V13l-4.5 1.5-5-1.5L1 14.5zM5.5 1.5V13M10.5 3v11.5"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linejoin="round"
					/>
				</svg>
				{m.gis_view_map()}
			</button>
		</div>
	</div>

	{#if allTags.length}
		<div role="group" aria-label={m.gis_filter_tech()} class="flex flex-wrap gap-2">
			<button
				type="button"
				aria-pressed={tag === ALL}
				onclick={() => (tag = ALL)}
				class={chip(tag === ALL)}>{m.gis_all()}</button
			>
			{#each allTags as t (t)}
				<button
					type="button"
					aria-pressed={tag === t}
					onclick={() => (tag = t)}
					class={chip(tag === t)}>{t}</button
				>
			{/each}
		</div>
	{/if}

	<p aria-live="polite" class="m-0 font-mono text-sm text-muted-foreground">
		{m.gis_count({ shown: list.length, total: all.length })}{tag !== ALL ? ` · ${tag}` : ''}
	</p>

	{#if list.length === 0}
		<div
			class="flex flex-col items-center gap-3 rounded-[28px] border-[1.5px] border-dashed border-line-strong bg-card px-6 py-14 text-center"
		>
			<svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
				<circle
					cx="24"
					cy="24"
					r="18"
					fill="none"
					stroke="var(--line-strong)"
					stroke-width="3"
					stroke-dasharray="6 6"
				/>
				<path
					d="M17 31l14-14M31 31L17 17"
					stroke="var(--line-strong)"
					stroke-width="3"
					stroke-linecap="round"
				/>
			</svg>
			<span class="text-xl font-black">{m.gis_empty_area()}</span>
			<button type="button" onclick={reset} class="btn-pill-line text-[15px]"
				>{m.gis_reset()}</button
			>
		</div>
	{:else if view === 'grid'}
		<div class="grid grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-5">
			{#each list as p (p.project.id)}
				<a
					href={p.href}
					class="map-card lift flex flex-col gap-4 px-3.5 pt-3.5 pb-[22px] text-foreground"
				>
					<div class="relative aspect-[16/10] overflow-hidden rounded-[20px]">
						<MapThumb x={p.x} y={p.y} />
						<span
							class="absolute top-3 left-3 rounded-full bg-card px-2.5 py-[5px] font-mono text-xs font-semibold"
							>{p.code}</span
						>
					</div>
					<div class="flex flex-col gap-2 px-2">
						{#if p.category}
							<span class="font-mono text-[13px] font-semibold text-primary">{p.category}</span>
						{/if}
						<span class="text-[22px] font-black tracking-[-0.01em]">{p.title}</span>
						<span class="line-clamp-3 text-base leading-normal text-ink-soft">{p.description}</span>
						<span class="mt-1 flex flex-wrap gap-1.5">
							{#each p.tags.slice(0, 5) as t (t)}
								<span
									class="rounded-full bg-secondary px-[11px] py-[5px] text-[13px] font-extrabold"
									>{t}</span
								>
							{/each}
						</span>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<div class="flex flex-wrap items-start gap-5">
			<div
				class="relative aspect-[800/520] min-w-0 flex-[999_1_560px] overflow-hidden rounded-[28px] border border-border bg-secondary"
			>
				<img
					src="/images/map/flat-basemap.svg"
					alt=""
					aria-hidden="true"
					class="map-art absolute inset-0 block size-full"
				/>
				{#each list as p (p.project.id)}
					{@const on = selected?.project.id === p.project.id}
					<button
						type="button"
						onclick={() => (selectedId = p.project.id)}
						aria-label={p.title}
						aria-pressed={on}
						class="absolute -mt-[52px] -ml-[22px] h-[52px] w-11 border-0 bg-transparent p-0"
						style="left: {p.x}%; top: {p.y}%"
					>
						{#if on}<span class="map-ring"></span>{/if}
						<svg
							width={on ? 32 : 24}
							height={on ? 43 : 32}
							viewBox="0 0 30 40"
							aria-hidden="true"
							class="absolute bottom-0 left-1/2 -translate-x-1/2"
						>
							<path
								d="M15 1C7.3 1 1 7 1 14.6 1 24.8 15 39 15 39s14-14.2 14-24.4C29 7 22.7 1 15 1z"
								fill={on ? 'var(--primary)' : 'var(--pin-idle)'}
								stroke="#FFFFFF"
								stroke-width="2"
							/>
							<circle cx="15" cy="14.5" r="5.5" fill="#FFFFFF" />
						</svg>
					</button>
				{/each}
				<div
					class="absolute bottom-4 left-4 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground"
				>
					{m.gis_map_hint()}
				</div>
			</div>
			{#if selected}
				<a
					href={selected.href}
					class="lift flex flex-[1_1_320px] flex-col gap-2.5 rounded-[28px] border-[1.5px] border-primary bg-card p-[26px] text-foreground"
				>
					<span class="font-mono text-[13px] font-semibold text-primary"
						>{selected.code}{selected.category ? ` · ${selected.category}` : ''}</span
					>
					<span class="text-[26px] font-black">{selected.title}</span>
					<span class="line-clamp-5 text-base leading-normal text-ink-soft"
						>{selected.description}</span
					>
					<span class="font-extrabold text-primary">{m.gis_work_detail()} →</span>
				</a>
			{/if}
		</div>
	{/if}

	{#if hasMore}
		<div class="flex justify-center">
			<button
				type="button"
				onclick={loadMore}
				disabled={loadingMore}
				class="btn-pill-line text-base disabled:opacity-60"
			>
				{loadingMore ? '…' : m.gis_load_more()}
			</button>
		</div>
	{/if}
</div>
