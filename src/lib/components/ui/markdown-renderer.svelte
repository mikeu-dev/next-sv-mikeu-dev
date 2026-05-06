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
		@apply my-10 overflow-x-auto rounded-none p-0;
		border-width: 2px;
		border-color: var(--foreground);
		background-color: oklch(from var(--foreground) l c h / 5%);
		box-shadow: 4px 4px 0 var(--foreground);
	}

	:global(.prose pre code) {
		@apply block min-w-full p-6 font-mono text-[13px] leading-relaxed whitespace-pre md:text-[14px];
		background: transparent !important;
	}

	:global(.prose a) {
		@apply font-black underline decoration-2 underline-offset-4 transition-all;
		text-decoration-color: var(--primary);
		&:hover {
			color: var(--primary);
		}
	}

	:global(.prose blockquote) {
		@apply border-l-4 py-4 pr-6 pl-8 font-mono text-sm tracking-tight italic not-italic;
		background-color: oklch(from var(--primary) l c h / 5%);
		border-color: var(--primary);
		color: oklch(from var(--foreground) l c h / 80%);
	}

	:global(.prose img) {
		@apply mx-auto;
		border-width: 4px;
		border-color: var(--foreground);
		box-shadow: 8px 8px 0 var(--foreground);
	}

	:global(.prose h2) {
		@apply mt-16 mb-8 scroll-mt-24 border-l-4 pl-6 text-3xl font-black tracking-tighter uppercase italic;
		border-color: var(--primary);
		font-family: var(--font-poppins);
	}

	:global(.prose h3) {
		@apply mt-12 mb-6 scroll-mt-24 text-xl font-black tracking-tighter uppercase italic;
		font-family: var(--font-poppins);
	}

	:global(.prose p) {
		@apply mb-6 font-mono text-sm leading-relaxed tracking-tight uppercase;
		color: var(--muted-foreground);
	}
</style>
