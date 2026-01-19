<script lang="ts">
	let { content = '' } = $props<{ content: string }>();

	// Basic Markdown Parser (Matched with Editor Preview)
	function parse(md: string) {
		if (!md) return '';
		return md
			.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mb-2 mt-4">$1</h3>')
			.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3 mt-5">$1</h2>')
			.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 mt-6">$1</h1>')
			.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
			.replace(/\*(.*)\*/gim, '<em>$1</em>')
			.replace(/_(.*?)_/gim, '<em>$1</em>')
			.replace(
				/`([^`]+)`/gim,
				'<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>'
			)
			.replace(
				/\n```\n([\s\S]*?)\n```\n/gim,
				'<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto mb-4"><code>$1</code></pre>'
			)
			.replace(
				/\[([^\]]+)\]\(([^)]+)\)/gim,
				'<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>'
			)
			.replace(
				/^> (.*$)/gim,
				'<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4">$1</blockquote>'
			)
			.replace(/^- (.*$)/gim, '<li class="ml-6 mb-1">$1</li>')
			.replace(/^\d+\. (.*$)/gim, '<li class="ml-6 mb-1">$1</li>')
			.replace(/\n/gim, '<br>');
	}
</script>

<div class="prose-content">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html parse(content)}
</div>
