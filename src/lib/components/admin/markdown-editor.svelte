<script lang="ts">
	import { onMount } from 'svelte';

	let { value = $bindable(''), placeholder = 'Write your content...', id = '' } = $props();

	let textarea = $state<HTMLTextAreaElement>();
	let showPreview = $state(false);

	function insertMarkdown(before: string, after: string = '') {
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = value.substring(start, end);
		const newText =
			value.substring(0, start) + before + selectedText + after + value.substring(end);

		value = newText;

		// Set cursor position after insertion
		setTimeout(() => {
			textarea?.focus();
			if (textarea) {
				const newCursorPos = start + before.length + selectedText.length;
				textarea.setSelectionRange(newCursorPos, newCursorPos);
			}
		}, 0);
	}

	function insertHeading(level: number) {
		const prefix = '#'.repeat(level) + ' ';
		insertMarkdown(prefix);
	}

	function insertBold() {
		insertMarkdown('**', '**');
	}

	function insertItalic() {
		insertMarkdown('_', '_');
	}

	function insertCode() {
		insertMarkdown('`', '`');
	}

	function insertCodeBlock() {
		insertMarkdown('\n```\n', '\n```\n');
	}

	function insertLink() {
		insertMarkdown('[', '](url)');
	}

	function insertList() {
		insertMarkdown('- ');
	}

	function insertNumberedList() {
		insertMarkdown('1. ');
	}

	function insertQuote() {
		insertMarkdown('> ');
	}
</script>

<div class="markdown-editor rounded-lg border border-gray-300 dark:border-gray-700">
	<!-- Toolbar -->
	<div
		class="flex flex-wrap items-center gap-1 border-b border-gray-300 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800"
	>
		<!-- Headings -->
		<div class="flex gap-1">
			<button
				type="button"
				onclick={() => insertHeading(1)}
				class="rounded px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
				title="Heading 1"
			>
				H1
			</button>
			<button
				type="button"
				onclick={() => insertHeading(2)}
				class="rounded px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
				title="Heading 2"
			>
				H2
			</button>
			<button
				type="button"
				onclick={() => insertHeading(3)}
				class="rounded px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
				title="Heading 3"
			>
				H3
			</button>
		</div>

		<div class="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

		<!-- Text Formatting -->
		<button
			type="button"
			onclick={insertBold}
			class="rounded px-2 py-1 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700"
			title="Bold"
		>
			B
		</button>
		<button
			type="button"
			onclick={insertItalic}
			class="rounded px-2 py-1 text-sm italic hover:bg-gray-200 dark:hover:bg-gray-700"
			title="Italic"
		>
			I
		</button>

		<div class="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

		<!-- Code -->
		<button
			type="button"
			onclick={insertCode}
			class="rounded px-2 py-1 font-mono text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
			title="Inline Code"
		>
			{'</>'}
		</button>
		<button
			type="button"
			onclick={insertCodeBlock}
			class="rounded px-2 py-1 font-mono text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
			title="Code Block"
		>
			{'{ }'}
		</button>

		<div class="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

		<!-- Lists -->
		<button
			type="button"
			onclick={insertList}
			class="rounded px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
			title="Bullet List"
		>
			• List
		</button>
		<button
			type="button"
			onclick={insertNumberedList}
			class="rounded px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
			title="Numbered List"
		>
			1. List
		</button>

		<div class="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

		<!-- Others -->
		<button
			type="button"
			onclick={insertLink}
			class="rounded px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
			title="Link"
		>
			🔗 Link
		</button>
		<button
			type="button"
			onclick={insertQuote}
			class="rounded px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
			title="Quote"
		>
			" Quote
		</button>

		<div class="ml-auto flex gap-2">
			<button
				type="button"
				onclick={() => (showPreview = !showPreview)}
				class="rounded px-3 py-1 text-sm {showPreview
					? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
					: 'hover:bg-gray-200 dark:hover:bg-gray-700'}"
			>
				{showPreview ? '📝 Edit' : '👁️ Preview'}
			</button>
		</div>
	</div>

	<!-- Editor / Preview -->
	<div class="relative">
		{#if !showPreview}
			<textarea
				{id}
				bind:this={textarea}
				bind:value
				{placeholder}
				rows="12"
				class="w-full resize-y border-0 bg-white p-4 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-900"
			></textarea>
		{:else}
			<div class="max-w-none p-4 text-sm">
				{#if value.trim()}
					<div class="prose-content">
						{@html value
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
							.replace(/^\- (.*$)/gim, '<li class="ml-6 mb-1">$1</li>')
							.replace(/^\d+\. (.*$)/gim, '<li class="ml-6 mb-1">$1</li>')
							.replace(/\n/gim, '<br>')}
					</div>
				{:else}
					<p class="text-muted-foreground">No content to preview</p>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Helper Text -->
	<div
		class="border-t border-gray-300 bg-gray-50 px-4 py-2 text-xs text-muted-foreground dark:border-gray-700 dark:bg-gray-800"
	>
		💡 Tip: Use the toolbar buttons for quick formatting or write markdown directly
	</div>
</div>
