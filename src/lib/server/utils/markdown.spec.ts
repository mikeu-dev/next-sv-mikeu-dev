import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './markdown';

describe('markdown utility', () => {
	it('should render simple markdown text to HTML', async () => {
		const result = await renderMarkdown('Hello **world**');
		expect(result.html).toContain('Hello <strong>world</strong>');
	});

	it('should extract depth 2 and 3 headings and generate correct IDs', async () => {
		const markdownContent = `
# Title (Depth 1, ignored in headings list)
## Section Two
### Subsection Three
#### Depth 4 (ignored in headings list)
`;

		const result = await renderMarkdown(markdownContent);

		// Verify extracted headings
		expect(result.headings).toHaveLength(2);
		expect(result.headings[0]).toEqual({
			depth: 2,
			text: 'Section Two',
			id: 'section-two'
		});
		expect(result.headings[1]).toEqual({
			depth: 3,
			text: 'Subsection Three',
			id: 'subsection-three'
		});

		// Verify generated HTML contains headers with correct IDs
		expect(result.html).toContain(
			'<h1 id="title-depth-1-ignored-in-headings-list">Title (Depth 1, ignored in headings list)</h1>'
		);
		expect(result.html).toContain('<h2 id="section-two">Section Two</h2>');
		expect(result.html).toContain('<h3 id="subsection-three">Subsection Three</h3>');
		expect(result.html).toContain(
			'<h4 id="depth-4-ignored-in-headings-list">Depth 4 (ignored in headings list)</h4>'
		);
	});

	it('should render code blocks with syntax highlighting using Shiki', async () => {
		const codeBlock = `
\`\`\`javascript
const a = 1;
\`\`\`
`;
		const result = await renderMarkdown(codeBlock);

		// Shiki renders HTML with classes containing 'shiki' and background colors
		expect(result.html).toContain('shiki');
		expect(result.html).toContain('const');
		expect(result.html).toContain('github-dark');
	});
});
