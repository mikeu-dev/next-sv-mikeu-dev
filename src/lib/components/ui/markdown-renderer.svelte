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

<div class="max-w-none p-4 text-sm">
	<div class="prose dark:prose-invert max-w-none">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html htmlContent}
	</div>
</div>
