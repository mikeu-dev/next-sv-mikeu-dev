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
	<div class="prose prose-slate max-w-none dark:prose-invert lg:prose-lg">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html htmlContent}
	</div>
</div>

<style>
	@reference "tailwindcss";

	:global(.prose pre) {
		@apply my-8 overflow-x-auto rounded-xl border border-border/50 bg-muted/30 p-0 shadow-sm;
	}

	:global(.prose pre code) {
		@apply block min-w-full p-4 text-[13px] leading-relaxed whitespace-pre font-mono md:text-[14px];
		background: transparent !important;
	}

	:global(.prose a) {
		@apply font-semibold text-primary no-underline transition-colors hover:underline;
	}

	:global(.prose blockquote) {
		@apply border-l-4 border-primary/40 bg-primary/5 py-1 pr-4 font-normal not-italic text-foreground/80;
	}

	:global(.prose img) {
		@apply mx-auto rounded-2xl shadow-xl;
	}

	:global(.prose h2) {
		@apply mt-12 scroll-mt-24 border-b pb-2 font-poppins font-bold;
	}

	:global(.prose h3) {
		@apply mt-8 scroll-mt-24 font-poppins font-bold;
	}
</style>
