import { createHighlighter, type Highlighter } from 'shiki';
import { marked } from 'marked';

let highlighter: Highlighter;

export interface BlogHeading {
	depth: number;
	text: string;
	id: string;
}

/**
 * Mengonversi markdown ke HTML dengan syntax highlighting menggunakan Shiki.
 * Juga mengekstrak heading untuk Table of Contents.
 */
export async function renderMarkdown(content: string) {
	if (!highlighter) {
		highlighter = await createHighlighter({
			themes: ['github-dark', 'github-light'],
			langs: [
				'javascript',
				'typescript',
				'svelte',
				'html',
				'css',
				'bash',
				'json',
				'markdown',
				'yaml',
				'sql'
			]
		});
	}

	const headings: BlogHeading[] = [];
	const renderer = new marked.Renderer();

	// Custom renderer untuk heading guna menghasilkan ID dan koleksi headings
	renderer.heading = ({ text, depth, raw }) => {
		const id = raw
			.toLowerCase()
			.replace(/[^\w]+/g, '-')
			.replace(/^-+|-+$/g, '');

		if (depth > 1 && depth <= 3) {
			headings.push({ depth, text, id });
		}

		return `<h${depth} id="${id}">${text}</h${depth}>`;
	};

	// Custom renderer untuk code block menggunakan Shiki
	renderer.code = ({ text, lang }) => {
		const language = lang || 'text';
		return highlighter.codeToHtml(text, {
			lang: language,
			themes: {
				light: 'github-light',
				dark: 'github-dark'
			}
		});
	};

	const html = await marked.parse(content, { renderer, async: true });
	return { html, headings };
}
