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

<div class="prose-content">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html htmlContent}
</div>
