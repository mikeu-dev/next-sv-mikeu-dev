import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import { Octokit } from 'octokit';
import { env } from '../config/env';
import type {
	ContentEnhancementAction,
	ContentEnhancementOptions,
	ContentEnhancementResult,
	FetchedArticle
} from '$lib/types/ai-content.types';

export interface ProjectMetadata {
	title_id: string;
	title_en: string;
	description_id: string;
	description_en: string;
	content: string;
	tags: string[];
}

export interface BlogMetadata {
	title_id: string;
	title_en: string;
	description_id: string;
	description_en: string;
	content_id: string;
	content_en: string;
	slug: string;
	tags: string[];
}

/**
 * Service for interacting with Google Gemini AI.
 */
export class GeminiService {
	private genAI: GoogleGenerativeAI;
	private model: GenerativeModel;
	private octokit: Octokit;

	constructor() {
		const apiKey = env.GOOGLE_GEMINI_API_KEY;
		if (!apiKey) {
			console.warn('GOOGLE_GEMINI_API_KEY is not set. Gemini AI features will be disabled.');
		}
		this.genAI = new GoogleGenerativeAI(apiKey || '');
		this.model = this.genAI.getGenerativeModel({
			model: 'gemini-flash-latest'
		});

		this.octokit = new Octokit({
			auth: env.GITHUB_ACCESS_TOKEN
		});
	}

	/**
	 * Translates text between Indonesian and English.
	 */
	async translate(text: string, toLocale: 'id' | 'en'): Promise<string> {
		const targetLang = toLocale === 'id' ? 'Indonesian' : 'English';
		const prompt = `Translate the following text to ${targetLang}. Only return the translated text without any explanations or extra characters:
		
"${text}"`;

		try {
			const result = await this.model.generateContent(prompt);
			const response = await result.response;
			return response.text().trim();
		} catch (error) {
			console.error('Gemini translation error:', error);
			throw new Error('Failed to translate text using Gemini AI.');
		}
	}

	/**
	 * Generates a description based on a title.
	 */
	async generateDescription(title: string, locale: 'id' | 'en'): Promise<string> {
		const lang = locale === 'id' ? 'Indonesian' : 'English';
		const prompt = `Generate a compelling and professional 2-3 sentence description for a portfolio ${locale === 'id' ? 'proyek atau blog' : 'project or blog post'} titled "${title}". The description should be in ${lang}. Only return the generated description:`;

		try {
			const result = await this.model.generateContent(prompt);
			const response = await result.response;
			return response.text().trim();
		} catch (error) {
			console.error('Gemini generation error:', error);
			throw new Error('Failed to generate description using Gemini AI.');
		}
	}

	/**
	 * Polishes and improves text (makes it more professional).
	 */
	async polish(text: string, locale: 'id' | 'en'): Promise<string> {
		const lang = locale === 'id' ? 'Indonesian' : 'English';
		const prompt = `Rewrite and polish the following ${lang} text to make it more professional, engaging, and suitable for a tech portfolio. Keep the original meaning but improve the tone and clarity. Only return the polished text:

"${text}"`;

		try {
			const result = await this.model.generateContent(prompt);
			const response = await result.response;
			return response.text().trim();
		} catch (error) {
			console.error('Gemini polish error:', error);
			throw new Error('Failed to polish text using Gemini AI.');
		}
	}

	/**
	 * Suggests tags based on title and description.
	 */
	async suggestTags(title: string, description: string): Promise<string[]> {
		const prompt = `Based on the following title and description of a tech project or blog post, suggest 5-8 relevant technology tags or categories (e.g., React, Svelte, AI, TypeScript, TailwindCSS). Return only the tags as a comma-separated list:

Title: ${title}
Description: ${description}`;

		try {
			const result = await this.model.generateContent(prompt);
			const response = await result.response;
			const text = response.text().trim();
			return text.split(',').map((tag: string) => tag.trim());
		} catch (error) {
			console.error('Gemini tag suggestion error:', error);
			throw new Error('Failed to suggest tags using Gemini AI.');
		}
	}

	/**
	 * Analyzes a GitHub repository and returns project metadata.
	 */
	async analyzeRepo(repoUrl: string): Promise<ProjectMetadata> {
		try {
			// Parse owner and repo from URL
			const url = new URL(repoUrl);
			const pathParts = url.pathname.split('/').filter(Boolean);
			if (pathParts.length < 2) throw new Error('Invalid GitHub URL');

			const owner = pathParts[0];
			const repo = pathParts[1].replace('.git', '');

			// Fetch README
			let readmeContent = '';
			try {
				const { data } = await this.octokit.rest.repos.getReadme({
					owner,
					repo
				});
				readmeContent = Buffer.from(data.content, 'base64').toString('utf-8');
			} catch {
				console.warn('README not found, using repo info instead');
			}

			// Fetch repo data for fallback
			const { data: repoInfo } = await this.octokit.rest.repos.get({
				owner,
				repo
			});

			const prompt = `Analyze the following GitHub repository information and README content. Generate professional portfolio project metadata including titles, descriptions, and detailed content in both Indonesian and English.

Repository: ${owner}/${repo}
Description: ${repoInfo.description || 'No description'}
Topics: ${repoInfo.topics?.join(', ') || 'No topics'}

README Content:
${readmeContent.substring(0, 5000)}

Return only a valid JSON object with the following structure:
{
  "title_id": "Judul Proyek",
  "title_en": "Project Title",
  "description_id": "Deskripsi singkat proyek...",
  "description_en": "Short project description...",
  "content": "Detailed markdown content based on README (Professional, refined)...",
  "tags": ["Tag1", "Tag2"]
}`;

			const result = await this.model.generateContent(prompt);
			const response = await result.response;
			const text = response.text().trim();

			// Extract JSON if AI surrounds it with markdown blocks
			const jsonMatch = text.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				return JSON.parse(jsonMatch[0]);
			}
			return JSON.parse(text);
		} catch (error) {
			console.error('Gemini repo analysis error:', error);
			throw new Error('Failed to analyze repository using Gemini AI.');
		}
	}

	/**
	 * Generates a full blog post draft based on a user prompt.
	 * Includes technical memes and open-source images.
	 */
	async generateBlogFromPrompt(userPrompt: string): Promise<BlogMetadata> {
		const prompt = `Act as a professional tech blogger with a great sense of humor and a deep understanding of premium typography and modern content structure. Generate a full blog post draft based on this instruction: "${userPrompt}".

Requirements:
1. **Topic Fidelity & Niche Scope**:
   - Write specifically about the exact subject in the user's instruction. Do NOT drift toward, substitute, or steer the article back to a different technology, framework, or tool than the one requested.
   - This is a broad **technology** blog. Keep the subject anywhere within the wide technology domain — e.g. software engineering, web, mobile, backend, databases, AI/ML, data engineering, DevOps, cloud, cybersecurity, hardware & gadgets, developer tooling, or emerging tech. Treat "tech" expansively, not just web or front-end development.
   - Never inject a framework, library, language, or stack the user did not ask for. In particular, do NOT mention Svelte or SvelteKit unless the user's instruction is explicitly about them.
2. **Technical Freshness**:
   - Apply the **LATEST STABLE INDUSTRY STANDARDS** (as of 2024-2025) and non-deprecated best practices for whichever specific technology the instruction actually names.
   - Only when the instruction is explicitly about **Svelte or SvelteKit**, use **Svelte 5 Runes** ($state, $derived, $props) and **SvelteKit 2+** patterns, and avoid deprecated Svelte 4 / old SvelteKit APIs.
3. **Typography & Structure**:
   - Use a clear visual hierarchy: **H2 for major sections**, **H3 for nested points**.
   - Use **Blockquotes (>)** for "Pro Tips", key takeaways, or humorous dev observations.
   - Use **Bold text** strategically for emphasis.
   - Use **Lists (ul/ol)** to break up long sections.
   - For technical topics, include high-quality, formatted **Code Blocks** in the topic's own language/tooling (never default to Svelte examples).
4. **Meme Instruction**: Include 2-3 technical "memes" or jokes relevant to the article's own topic. These can be funny observations, sarcastic remarks about "legacy code", or relatable developer struggles.
5. **Image Instruction**: Include 2-3 relevant images using Markdown syntax: ![Descriptive Alt Text](https://loremflickr.com/800/600/tech,coding,humor).
6. **SEO Auditing & Visibility**:
   - Ensure the main keyword from the user prompt has a natural but effective density throughout the content.
   - The generated titles and descriptions must be optimized for click-through rate (CTR) and search visibility.
   - Images must have highly descriptive Alt Text for accessibility and SEO.
7. **Goal**: The content should feel like it was written by a current industry expert today, not 2 years ago, and be fully optimized for search engines.

Return ONLY a valid JSON object with this structure:
{
  "title_id": "Judul Menarik (ID)",
  "title_en": "Catchy Title (EN)",
  "description_id": "Deskripsi singkat untuk SEO (ID)...",
  "description_en": "Short SEO description (EN)...",
  "content_id": "Modern Markdown content (ID), integrated with premium structure, memes and images...",
  "content_en": "Modern Markdown content (EN), integrated with premium structure, memes and images...",
  "slug": "url-friendly-slug-based-on-en-title",
  "tags": ["Tag1", "Tag2"]
}`;

		try {
			const result = await this.model.generateContent(prompt);
			const response = await result.response;
			const text = response.text().trim();

			const jsonMatch = text.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				return JSON.parse(jsonMatch[0]);
			}
			return JSON.parse(text);
		} catch (error) {
			console.error('Gemini blog generation error:', error);
			throw new Error('Failed to generate blog post draft using Gemini AI.');
		}
	}

	/**
	 * Fetches and extracts readable text content from an article URL.
	 * Server-side only — avoids CORS issues.
	 */
	async fetchArticleContent(url: string): Promise<FetchedArticle> {
		try {
			const parsedUrl = new URL(url);
			if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
				throw new Error('Only HTTP/HTTPS URLs are allowed');
			}

			const response = await fetch(url, {
				headers: {
					'User-Agent':
						'Mozilla/5.0 (compatible; BlogEnhancer/1.0; +https://mikeu.dev)',
					Accept: 'text/html,application/xhtml+xml'
				},
				signal: AbortSignal.timeout(15_000)
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
			}

			const html = await response.text();

			// Extract title from <title> tag
			const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
			const title = titleMatch ? titleMatch[1].trim() : 'Untitled Article';

			// Strip HTML to get plain text content
			const textContent = html
				// Remove script and style blocks entirely
				.replace(/<script[\s\S]*?<\/script>/gi, '')
				.replace(/<style[\s\S]*?<\/style>/gi, '')
				// Remove nav, header, footer, aside
				.replace(/<(nav|header|footer|aside)[\s\S]*?<\/\1>/gi, '')
				// Convert common block elements to newlines
				.replace(/<\/(p|div|h[1-6]|li|tr|blockquote)>/gi, '\n')
				.replace(/<br\s*\/?>/gi, '\n')
				// Strip remaining HTML tags
				.replace(/<[^>]+>/g, '')
				// Decode common HTML entities
				.replace(/&amp;/g, '&')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
				.replace(/&quot;/g, '"')
				.replace(/&#39;/g, "'")
				.replace(/&nbsp;/g, ' ')
				// Collapse whitespace
				.replace(/[ \t]+/g, ' ')
				.replace(/\n{3,}/g, '\n\n')
				.trim();

			// Truncate to ~8000 chars to stay within Gemini context limits
			const truncated =
				textContent.length > 8000 ? textContent.substring(0, 8000) + '\n\n[...truncated]' : textContent;

			return {
				title,
				content: truncated,
				url: parsedUrl.toString()
			};
		} catch (error) {
			console.error('Article fetch error:', error);
			if (error instanceof Error && error.name === 'AbortError') {
				throw new Error('Request timed out while fetching the article.');
			}
			throw new Error(
				error instanceof Error ? error.message : 'Failed to fetch article content.'
			);
		}
	}

	/**
	 * Enhances article content using one of 8 AI actions.
	 */
	async enhanceContent(
		content: string,
		action: ContentEnhancementAction,
		options: ContentEnhancementOptions = {}
	): Promise<ContentEnhancementResult> {
		const prompt = this.buildEnhancementPrompt(content, action, options);

		try {
			const result = await this.model.generateContent(prompt);
			const response = await result.response;
			const text = response.text().trim();

			// For suggestImprovements, parse structured JSON
			if (action === 'suggestImprovements') {
				const jsonMatch = text.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					const parsed = JSON.parse(jsonMatch[0]) as ContentEnhancementResult;
					return parsed;
				}
				// Fallback: treat entire response as suggestions text
				return {
					content: text,
					suggestions: text.split('\n').filter((line: string) => line.trim())
				};
			}

			// For optimizeSeo, parse JSON with title + description + content
			if (action === 'optimizeSeo') {
				const jsonMatch = text.match(/\{[\s\S]*\}/);
				if (jsonMatch) {
					const parsed = JSON.parse(jsonMatch[0]) as ContentEnhancementResult;
					return parsed;
				}
			}

			return { content: text };
		} catch (error) {
			console.error(`Gemini enhanceContent (${action}) error:`, error);
			throw new Error(`Failed to enhance content with action "${action}".`);
		}
	}

	/**
	 * Builds a tailored prompt string for each enhancement action.
	 */
	private buildEnhancementPrompt(
		content: string,
		action: ContentEnhancementAction,
		options: ContentEnhancementOptions
	): string {
		const locale = options.locale ?? 'en';
		const lang = locale === 'id' ? 'Indonesian' : 'English';
		const targetLang = (options.targetLocale ?? (locale === 'en' ? 'id' : 'en')) === 'id' ? 'Indonesian' : 'English';

		const prompts: Record<ContentEnhancementAction, string> = {
			fixGrammar: `You are a professional editor. Fix all grammar, spelling, punctuation, and typographical errors in the following ${lang} article. Preserve the original meaning, structure, and markdown formatting. Return ONLY the corrected text:\n\n"${content}"`,

			improveReadability: `You are a content readability expert. Rewrite the following ${lang} article to dramatically improve readability:\n- Break long paragraphs into shorter ones\n- Use simpler sentence structures where possible\n- Add transition words between sections\n- Improve flow and logical progression\n- Keep all original information intact\n- Preserve markdown formatting\n\nReturn ONLY the improved text:\n\n"${content}"`,

			adjustAudience: `You are a content strategist. Rewrite the following article for a **${options.targetAudience ?? 'general'}** audience in ${lang}:\n- Adjust technical complexity accordingly\n- Change tone and vocabulary to match the target reader\n- Add or simplify explanations as needed\n- Preserve the core message and markdown formatting\n\nAudience descriptions:\n- developer: technical, use jargon freely, include code context\n- non-technical: avoid jargon, use analogies, explain concepts simply\n- manager: focus on business impact, ROI, strategic implications\n- student: educational tone, step-by-step, define terms\n- general: balanced, accessible, engaging\n\nReturn ONLY the rewritten text:\n\n"${content}"`,

			optimizeSeo: `You are an SEO expert and content strategist. Analyze and optimize the following ${lang} article for search engines:\n- Identify the primary keyword and ensure natural keyword density (1-2%)\n- Optimize heading hierarchy (H2, H3)\n- Suggest a compelling SEO title (max 60 chars)\n- Suggest a meta description (max 155 chars)\n- Add internal linking opportunities as [suggested link text](placeholder)\n- Improve readability score\n- Preserve markdown formatting\n\nReturn a JSON object with this structure:\n{\n  "title": "SEO-optimized title",\n  "description": "Meta description",\n  "content": "Full optimized article in markdown"\n}\n\nArticle:\n"${content}"`,

			addExplanation: `You are a technical writer. Review the following ${lang} article and identify sections that lack sufficient explanation, context, or detail. Then rewrite the article with:\n- Added explanations for complex concepts\n- Examples or analogies where helpful\n- Expanded sections that feel rushed\n- Additional context for jargon or acronyms\n- Preserve existing content and markdown formatting\n\nReturn ONLY the expanded text:\n\n"${content}"`,

			summarize: `You are a professional content summarizer. Create a concise, well-structured summary of the following ${lang} article:\n- Capture all key points and main arguments\n- Use bullet points for clarity\n- Include a 2-3 sentence executive summary at the top\n- Keep the summary to roughly 20-30% of the original length\n- Write in ${lang}\n- Use markdown formatting\n\nReturn ONLY the summary:\n\n"${content}"`,

			translateContent: `You are a professional translator. Translate the following article to ${targetLang}. Requirements:\n- Maintain the original meaning, tone, and intent\n- Use natural, fluent ${targetLang} — not literal translation\n- Preserve all markdown formatting, code blocks, and links\n- Adapt idioms and cultural references appropriately\n\nReturn ONLY the translated text:\n\n"${content}"`,

			suggestImprovements: `You are a senior content editor and strategist. Analyze the following ${lang} article and provide detailed improvement suggestions. For each suggestion:\n- Identify the specific issue\n- Explain WHY it's a problem\n- Provide a concrete recommendation\n\nReturn a JSON object with this structure:\n{\n  "content": "A brief overall assessment of the article (2-3 sentences)",\n  "suggestions": [\n    "🔍 **Issue**: [description] — **Why**: [reason] — **Fix**: [recommendation]",\n    "...more suggestions"\n  ]\n}\n\nArticle:\n"${content}"`
		};

		return prompts[action];
	}
}

// Export a singleton instance
export const geminiService = new GeminiService();
