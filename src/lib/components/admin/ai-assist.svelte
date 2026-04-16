<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { Sparkles, Languages, Wand2, Tag, Loader2 } from '@lucide/svelte';
	import { fade, scale } from 'svelte/transition';

	interface Props {
		context?: string; // Additional context (e.g. title) for AI
		targetValue?: string; // The current value to process
		onApply?: (newValue: string) => void; // Callback when AI result is accepted
		onApplyTags?: (tags: string[]) => void; // Callback for tags
		locale?: 'id' | 'en';
		type?: 'title' | 'description' | 'content' | 'tags';
		label?: string;
	}

	let {
		context = '',
		targetValue = $bindable(''),
		onApply,
		onApplyTags,
		locale = 'en',
		type = 'description',
		label = 'AI Assist'
	}: Props = $props();

	let loading = $state(false);
	let showMenu = $state(false);
	let menuRef = $state<HTMLDivElement>();

	// Close menu on click outside
	function handleClickOutside(event: MouseEvent) {
		if (menuRef && !menuRef.contains(event.target as Node)) {
			showMenu = false;
		}
	}

	$effect(() => {
		if (showMenu) {
			window.addEventListener('mousedown', handleClickOutside);
		} else {
			window.removeEventListener('mousedown', handleClickOutside);
		}
		return () => window.removeEventListener('mousedown', handleClickOutside);
	});

	async function callAI(action: string, payload: unknown) {
		loading = true;
		showMenu = false;
		try {
			const response = await fetch('/api/admin/ai/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action, payload })
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'AI request failed');
			}

			const data = await response.json();
			return data.result;
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'AI request failed';
			toast.error(message);
			return null;
		} finally {
			loading = false;
		}
	}

	async function handleGenerateFromTitle() {
		const result = await callAI('generateDescription', { title: context || targetValue, locale });
		if (result && onApply) onApply(result);
	}

	async function handleTranslate() {
		const toLocale = locale === 'en' ? 'id' : 'en';
		const result = await callAI('translate', { text: targetValue, toLocale });
		if (result && onApply) onApply(result);
	}

	async function handlePolish() {
		const result = await callAI('polish', { text: targetValue, locale });
		if (result && onApply) onApply(result);
	}

	async function handleSuggestTags() {
		const result = await callAI('suggestTags', { title: context, description: targetValue });
		if (result && onApplyTags) onApplyTags(result);
	}
</script>

<div class="relative inline-block" bind:this={menuRef}>
	<button
		type="button"
		onclick={() => (showMenu = !showMenu)}
		disabled={loading}
		class="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-all
               {loading
			? 'bg-blue-50 text-blue-400 dark:bg-blue-900/20'
			: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'}"
		title={label}
	>
		{#if loading}
			<Loader2 class="h-3.5 w-3.5 animate-spin" />
			Proses...
		{:else}
			<Sparkles class="h-3.5 w-3.5" />
			AI
		{/if}
	</button>

	{#if showMenu}
		<div
			in:scale={{ duration: 150, start: 0.95 }}
			out:fade={{ duration: 100 }}
			class="absolute right-0 z-50 mt-1 w-48 origin-top-right rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
		>
			{#if type === 'description' && context}
				<button
					type="button"
					onclick={handleGenerateFromTitle}
					class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
				>
					<Sparkles class="h-4 w-4 text-blue-500" />
					Generate from Title
				</button>
			{/if}

			{#if targetValue}
				<button
					type="button"
					onclick={handleTranslate}
					class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
				>
					<Languages class="h-4 w-4 text-green-500" />
					Translate to {locale === 'en' ? 'ID' : 'EN'}
				</button>

				<button
					type="button"
					onclick={handlePolish}
					class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
				>
					<Wand2 class="h-4 w-4 text-purple-500" />
					Polish Text
				</button>
			{/if}

			{#if type === 'tags' && context}
				<button
					type="button"
					onclick={handleSuggestTags}
					class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
				>
					<Tag class="h-4 w-4 text-orange-500" />
					Suggest Tags
				</button>
			{/if}

			{#if !targetValue && (type !== 'description' || !context)}
				<div class="px-3 py-2 text-xs text-muted-foreground">No actions available</div>
			{/if}
		</div>
	{/if}
</div>
