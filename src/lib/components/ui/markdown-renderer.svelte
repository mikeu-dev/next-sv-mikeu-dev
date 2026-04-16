<script lang="ts">
	import { marked } from 'marked';

	let { content = '' } = $props<{ content: string }>();

	// Configure marked if needed (standard is usually fine)
	marked.setOptions({
		breaks: true,
		gfm: true
	});

	let htmlContent = $derived(marked.parse(content || ''));
</script>

<div class="prose prose-lg max-w-none dark:prose-invert">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html htmlContent}
</div>
