<script lang="ts">
	import { marked } from 'marked';

	let { content = '', isRendered = false } = $props<{ content: string; isRendered?: boolean }>();

	// Configure marked for client-side fallback if needed
	marked.setOptions({
		breaks: true,
		gfm: true
	});

	let htmlContent = $derived(isRendered ? content : marked.parse(content || ''));
</script>

<div class="markdown-container max-w-none py-4">
	<div class="prose max-w-none prose-slate lg:prose-lg dark:prose-invert">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html htmlContent}
	</div>
</div>

<style lang="postcss">
	@reference "tailwindcss";

	:global(.prose pre) {
		@apply my-8 overflow-x-auto rounded-xl p-0 shadow-sm;
		background-color: oklch(from var(--muted) l c h / 30%);
		border: 1px solid oklch(from var(--border) l c h / 50%);
	}

	:global(.prose pre code) {
		@apply block min-w-full p-4 font-mono text-[13px] leading-relaxed whitespace-pre md:text-[14px];
		background: transparent !important;
	}

	:global(.prose a) {
		@apply font-semibold no-underline transition-colors hover:underline;
		color: var(--primary);
	}

	:global(.prose blockquote) {
		@apply py-1 pr-4 font-normal not-italic;
		border-left: 4px solid oklch(from var(--primary) l c h / 40%);
		background-color: oklch(from var(--primary) l c h / 5%);
		color: oklch(from var(--foreground) l c h / 80%);
	}

	:global(.prose img) {
		@apply mx-auto rounded-2xl shadow-xl;
	}

	:global(.prose h2) {
		@apply mt-12 scroll-mt-24 pb-2 font-bold;
		font-family: var(--font-poppins);
		border-bottom: 1px solid var(--border);
	}

	:global(.prose h3) {
		@apply mt-8 scroll-mt-24 font-bold;
		font-family: var(--font-poppins);
	}
</style>
