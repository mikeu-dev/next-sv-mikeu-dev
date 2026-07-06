<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { fade, scale, slide } from 'svelte/transition';
	import {
		Globe,
		Loader2,
		Link,
		ChevronDown,
		ChevronUp,
		Copy,
		Check,
		X,
		ArrowDownToLine,
		Sparkles
	} from '@lucide/svelte';
	import {
		ENHANCEMENT_ACTIONS,
		type ContentEnhancementAction,
		type ContentEnhancementResult,
		type FetchedArticle,
		type TargetAudience
	} from '$lib/types/ai-content.types';

	interface Props {
		readonly locale: 'en' | 'id';
		readonly onApplyDraft?: (draft: {
			slug?: string;
			title_en?: string;
			title_id?: string;
			description_en?: string;
			description_id?: string;
			content_en?: string;
			content_id?: string;
		}) => void;
	}

	const { locale, onApplyDraft }: Props = $props();

	// --- State ---
	let articleUrl = $state('');
	let fetchedArticle = $state<FetchedArticle | null>(null);
	let fetchingArticle = $state(false);
	let showFetchedPreview = $state(false);

	let activeAction = $state<ContentEnhancementAction | null>(null);
	let enhancing = $state(false);
	let enhancementResult = $state<ContentEnhancementResult | null>(null);

	let selectedAudience = $state<TargetAudience>('general');
	let showAudienceSelector = $state(false);
	let copied = $state(false);

	let panelExpanded = $state(true);
	let activePreviewTab = $state<'en' | 'id'>('id');

	// --- Derived ---
	const hasArticle = $derived(fetchedArticle !== null);
	const previewText = $derived(
		fetchedArticle
			? fetchedArticle.content.length > 300
				? fetchedArticle.content.substring(0, 300) + '...'
				: fetchedArticle.content
			: ''
	);

	const canApply = $derived(
		enhancementResult !== null &&
			(enhancementResult.content_en !== undefined || enhancementResult.content_id !== undefined)
	);

	const AUDIENCE_OPTIONS: readonly { readonly value: TargetAudience; readonly label: string }[] = [
		{ value: 'developer', label: '👨‍💻 Developer' },
		{ value: 'non-technical', label: '👤 Non-Technical' },
		{ value: 'manager', label: '💼 Manager' },
		{ value: 'student', label: '🎓 Student' },
		{ value: 'general', label: '🌍 General' }
	];

	// --- API Helpers ---
	async function fetchArticle(): Promise<void> {
		if (!articleUrl.trim()) {
			toast.error('Please enter a URL');
			return;
		}

		fetchingArticle = true;
		try {
			const response = await fetch('/api/admin/ai/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'fetchArticle', payload: { url: articleUrl } })
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to fetch article');
			}

			const data = await response.json();
			fetchedArticle = data.result as FetchedArticle;
			showFetchedPreview = true;
			enhancementResult = null;
			toast.success(`Article fetched: "${fetchedArticle.title}"`);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Failed to fetch article';
			toast.error(message);
		} finally {
			fetchingArticle = false;
		}
	}

	async function runEnhancement(action: ContentEnhancementAction): Promise<void> {
		if (!fetchedArticle) {
			toast.error('Please fetch an article first');
			return;
		}

		// If adjustAudience, show the selector first
		if (action === 'adjustAudience' && !showAudienceSelector) {
			showAudienceSelector = true;
			activeAction = action;
			return;
		}

		activeAction = action;
		enhancing = true;
		showAudienceSelector = false;

		try {
			const response = await fetch('/api/admin/ai/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'enhanceContent',
					payload: {
						content: fetchedArticle.content,
						enhancementAction: action,
						options: {
							locale,
							targetAudience: action === 'adjustAudience' ? selectedAudience : undefined,
							sourceImages: fetchedArticle.images,
							sourceVideos: fetchedArticle.videos
						}
					}
				})
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Enhancement failed');
			}

			const data = await response.json();
			enhancementResult = data.result as ContentEnhancementResult;

			const actionLabel = ENHANCEMENT_ACTIONS.find((a) => a.key === action)?.label ?? action;
			toast.success(`${actionLabel} — selesai!`);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Enhancement failed';
			toast.error(message);
		} finally {
			enhancing = false;
			activeAction = null;
		}
	}

	function applyToForm(): void {
		if (!enhancementResult) return;

		if (onApplyDraft) {
			onApplyDraft({
				slug: enhancementResult.slug,
				title_en: enhancementResult.title_en,
				title_id: enhancementResult.title_id,
				description_en: enhancementResult.description_en,
				description_id: enhancementResult.description_id,
				content_en: enhancementResult.content_en,
				content_id: enhancementResult.content_id
			});
		}

		toast.success('Applied draft to English and Indonesian versions!');
		enhancementResult = null;
	}

	async function copyResult(): Promise<void> {
		if (!enhancementResult) return;

		let text = '';
		if (enhancementResult.suggestions) {
			text =
				(enhancementResult.content_en || '') + '\n\n' + enhancementResult.suggestions.join('\n');
		} else {
			text =
				`--- ENGLISH ---\nTitle: ${enhancementResult.title_en || ''}\nDesc: ${enhancementResult.description_en || ''}\n\n${enhancementResult.content_en || ''}\n\n` +
				`--- INDONESIAN ---\nTitle: ${enhancementResult.title_id || ''}\nDesc: ${enhancementResult.description_id || ''}\n\n${enhancementResult.content_id || ''}`;
		}

		await navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function dismissResult(): void {
		enhancementResult = null;
	}

	function clearArticle(): void {
		fetchedArticle = null;
		enhancementResult = null;
		showFetchedPreview = false;
		articleUrl = '';
	}

	function handleUrlKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter') {
			event.preventDefault();
			fetchArticle();
		}
	}
</script>

<!-- AI Content Enhancement Panel -->
<div
	class="rounded-xl border border-teal-200 bg-teal-50/50 dark:border-teal-900/30 dark:bg-teal-900/10"
>
	<!-- Header -->
	<button
		type="button"
		onclick={() => (panelExpanded = !panelExpanded)}
		class="flex w-full items-center justify-between px-6 py-4"
	>
		<div class="flex items-center gap-2 text-teal-700 dark:text-teal-300">
			<Sparkles class="h-5 w-5" />
			<h2 class="text-sm font-semibold tracking-wider uppercase">AI Content Enhancement</h2>
			{#if hasArticle}
				<span
					class="ml-2 inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-medium text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
				>
					Article Loaded
				</span>
			{/if}
		</div>
		{#if panelExpanded}
			<ChevronUp class="h-4 w-4 text-teal-500" />
		{:else}
			<ChevronDown class="h-4 w-4 text-teal-500" />
		{/if}
	</button>

	{#if panelExpanded}
		<div class="space-y-4 px-6 pb-6" transition:slide={{ duration: 200 }}>
			<!-- URL Input -->
			<div class="flex flex-col gap-3 sm:flex-row">
				<div class="relative flex-1">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<Link class="h-4 w-4 text-teal-400" />
					</div>
					<input
						type="url"
						bind:value={articleUrl}
						onkeydown={handleUrlKeydown}
						placeholder="Paste article/news URL (e.g. https://dev.to/...)"
						class="w-full rounded-lg border border-teal-200 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 focus:border-teal-500 focus:outline-none dark:border-teal-900/50 dark:bg-gray-950 dark:text-gray-100"
						disabled={fetchingArticle}
					/>
				</div>
				<div class="flex gap-2">
					<button
						type="button"
						onclick={fetchArticle}
						disabled={fetchingArticle || !articleUrl.trim()}
						class="flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-teal-700 disabled:opacity-50"
					>
						{#if fetchingArticle}
							<Loader2 class="h-4 w-4 animate-spin" />
							Fetching...
						{:else}
							<Globe class="h-4 w-4" />
							Fetch
						{/if}
					</button>
					{#if hasArticle}
						<button
							type="button"
							onclick={clearArticle}
							class="flex items-center gap-1 rounded-lg border border-teal-200 px-3 py-2.5 text-sm text-teal-600 transition-all hover:bg-teal-50 dark:border-teal-900/50 dark:text-teal-400 dark:hover:bg-teal-900/20"
							title="Clear article"
						>
							<X class="h-4 w-4" />
						</button>
					{/if}
				</div>
			</div>

			<!-- Fetched Article Preview (Collapsible) -->
			{#if fetchedArticle}
				<div
					class="rounded-lg border border-teal-100 bg-white/80 dark:border-teal-900/20 dark:bg-gray-900/50"
					transition:slide={{ duration: 200 }}
				>
					<button
						type="button"
						onclick={() => (showFetchedPreview = !showFetchedPreview)}
						class="flex w-full items-center justify-between px-4 py-3"
					>
						<div class="flex items-center gap-2 text-left">
							<span class="text-xs font-semibold text-teal-600 dark:text-teal-400"
								>📄 {fetchedArticle.title}</span
							>
							<span class="text-[10px] text-gray-400"
								>({fetchedArticle.content.length.toLocaleString()} chars)</span
							>
						</div>
						{#if showFetchedPreview}
							<ChevronUp class="h-3.5 w-3.5 text-gray-400" />
						{:else}
							<ChevronDown class="h-3.5 w-3.5 text-gray-400" />
						{/if}
					</button>
					{#if showFetchedPreview}
						<div
							class="border-t border-teal-100 px-4 py-3 dark:border-teal-900/20"
							transition:slide={{ duration: 150 }}
						>
							<p class="line-clamp-6 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
								{previewText}
							</p>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Action Grid -->
			{#if hasArticle}
				<div transition:fade={{ duration: 150 }}>
					<p class="mb-2 text-xs font-medium text-teal-600/80 dark:text-teal-400/60">
						Pilih aksi enhancement (Membuat Draf ID & EN sekaligus):
					</p>
					<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
						{#each ENHANCEMENT_ACTIONS as action (action.key)}
							<button
								type="button"
								onclick={() => runEnhancement(action.key)}
								disabled={enhancing}
								class="group relative flex flex-col items-start gap-1 rounded-lg border border-teal-100 bg-white px-3 py-2.5 text-left transition-all hover:border-teal-300 hover:shadow-sm disabled:opacity-40 dark:border-teal-900/30 dark:bg-gray-900/60 dark:hover:border-teal-700
								{activeAction === action.key ? 'border-teal-400 ring-2 ring-teal-200 dark:ring-teal-800' : ''}"
							>
								<div class="flex w-full items-center justify-between">
									<span class="text-base">{action.emoji}</span>
									{#if enhancing && activeAction === action.key}
										<Loader2 class="h-3.5 w-3.5 animate-spin text-teal-500" />
									{/if}
								</div>
								<span class="text-[11px] leading-tight font-medium text-gray-700 dark:text-gray-300"
									>{action.label}</span
								>
								<!-- Tooltip on hover -->
								<div
									class="pointer-events-none absolute -top-10 left-1/2 z-50 hidden -translate-x-1/2 rounded-md bg-gray-900 px-2.5 py-1 text-[10px] whitespace-nowrap text-white shadow-lg group-hover:block dark:bg-gray-700"
								>
									{action.description}
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Audience Selector (conditional) -->
			{#if showAudienceSelector && activeAction === 'adjustAudience'}
				<div
					class="flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900/30 dark:bg-amber-900/10"
					transition:slide={{ duration: 150 }}
				>
					<span class="text-xs font-medium text-amber-700 dark:text-amber-300"
						>🎯 Target audiens:</span
					>
					{#each AUDIENCE_OPTIONS as opt (opt.value)}
						<button
							type="button"
							onclick={() => {
								selectedAudience = opt.value;
								runEnhancement('adjustAudience');
							}}
							class="rounded-md border px-3 py-1.5 text-xs font-medium transition-all
							{selectedAudience === opt.value
								? 'border-amber-400 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
								: 'border-gray-200 bg-white text-gray-600 hover:border-amber-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'}"
						>
							{opt.label}
						</button>
					{/each}
				</div>
			{/if}

			<!-- Enhancement Result Panel -->
			{#if enhancementResult}
				<div
					class="space-y-3 rounded-lg border border-teal-200 bg-white p-4 dark:border-teal-900/30 dark:bg-gray-900/60"
					transition:scale={{ duration: 200, start: 0.95 }}
				>
					<!-- Result Header -->
					<div class="flex items-center justify-between">
						<h3 class="text-sm font-semibold text-teal-700 dark:text-teal-300">
							✨ Hasil Enhancement (Draf Siap)
						</h3>
						<div class="flex items-center gap-1.5">
							<button
								type="button"
								onclick={copyResult}
								class="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
								title="Copy to clipboard"
							>
								{#if copied}
									<Check class="h-3.5 w-3.5 text-green-500" />
									<span class="text-green-500">Copied</span>
								{:else}
									<Copy class="h-3.5 w-3.5" />
									Copy
								{/if}
							</button>
							<button
								type="button"
								onclick={dismissResult}
								class="rounded-md p-1 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
								title="Dismiss"
							>
								<X class="h-3.5 w-3.5" />
							</button>
						</div>
					</div>

					<!-- Metadata Preview (EN & ID Titles / Descriptions / Slug) -->
					{#if enhancementResult.title_en || enhancementResult.title_id || enhancementResult.description_en || enhancementResult.description_id}
						<div
							class="space-y-2 rounded-md border border-teal-100 bg-teal-50/20 p-3 dark:border-teal-900/20 dark:bg-teal-950/10"
						>
							{#if enhancementResult.slug}
								<div class="mb-2 border-b border-teal-100 pb-1.5 dark:border-teal-900/20">
									<span class="text-[9px] font-bold tracking-wider text-teal-600 uppercase"
										>URL Slug</span
									>
									<p class="font-mono text-xs text-gray-800 dark:text-gray-200">
										{enhancementResult.slug}
									</p>
								</div>
							{/if}
							<div class="grid gap-3 md:grid-cols-2">
								{#if enhancementResult.title_en || enhancementResult.description_en}
									<div class="space-y-1">
										<span class="text-[9px] font-bold tracking-wider text-teal-600 uppercase"
											>🇬🇧 English Version</span
										>
										{#if enhancementResult.title_en}
											<h4 class="text-xs font-semibold text-gray-800 dark:text-gray-200">
												{enhancementResult.title_en}
											</h4>
										{/if}
										{#if enhancementResult.description_en}
											<p class="text-[11px] text-gray-600 dark:text-gray-400">
												{enhancementResult.description_en}
											</p>
										{/if}
									</div>
								{/if}
								{#if enhancementResult.title_id || enhancementResult.description_id}
									<div class="space-y-1">
										<span class="text-[9px] font-bold tracking-wider text-teal-600 uppercase"
											>🇮🇩 Indonesian Version</span
										>
										{#if enhancementResult.title_id}
											<h4 class="text-xs font-semibold text-gray-800 dark:text-gray-200">
												{enhancementResult.title_id}
											</h4>
										{/if}
										{#if enhancementResult.description_id}
											<p class="text-[11px] text-gray-600 dark:text-gray-400">
												{enhancementResult.description_id}
											</p>
										{/if}
									</div>
								{/if}
							</div>
						</div>
					{/if}

					<!-- Suggestions List -->
					{#if enhancementResult.suggestions && enhancementResult.suggestions.length > 0}
						<div class="space-y-2">
							{#if enhancementResult.content_en}
								<p class="text-xs text-gray-600 dark:text-gray-400">
									{enhancementResult.content_en}
								</p>
							{/if}
							<div
								class="max-h-64 space-y-1.5 overflow-y-auto rounded-md border border-amber-100 bg-amber-50/30 p-3 dark:border-amber-900/20 dark:bg-amber-900/10"
							>
								{#each enhancementResult.suggestions as suggestion, i (i)}
									<p class="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
										{suggestion}
									</p>
								{/each}
							</div>
						</div>
					{:else}
						<!-- Content Preview (Tabs for EN and ID content preview) -->
						<div class="space-y-2">
							<div class="flex gap-2 border-b border-gray-200 text-xs dark:border-gray-800">
								<button
									type="button"
									onclick={() => (activePreviewTab = 'en')}
									class="pb-1 font-medium transition-colors {activePreviewTab === 'en'
										? 'border-b-2 border-teal-500 text-teal-600'
										: 'text-gray-400'}"
								>
									🇬🇧 English Preview
								</button>
								<button
									type="button"
									onclick={() => (activePreviewTab = 'id')}
									class="pb-1 font-medium transition-colors {activePreviewTab === 'id'
										? 'border-b-2 border-teal-500 text-teal-600'
										: 'text-gray-400'}"
								>
									🇮🇩 Indonesian Preview
								</button>
							</div>
							<div class="max-h-72 overflow-y-auto rounded bg-gray-50 p-2 dark:bg-gray-950/40">
								<pre
									class="text-xs leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">{activePreviewTab ===
									'en'
										? enhancementResult.content_en
										: enhancementResult.content_id}</pre>
							</div>
						</div>
					{/if}

					<!-- Apply Button -->
					{#if canApply}
						<div class="flex justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
							<button
								type="button"
								onclick={applyToForm}
								class="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-teal-700"
							>
								<ArrowDownToLine class="h-4 w-4" />
								Apply Draft (ID & EN)
							</button>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Helper text -->
			<p class="text-[10px] text-teal-600/60 dark:text-teal-400/40">
				* Paste URL artikel/news → Fetch → Pilih aksi AI. Hasil draf (ID & EN, Slug, serta
				Banner/Media tersemat) akan langsung terisi pada form sekaligus.
			</p>
		</div>
	{/if}
</div>
