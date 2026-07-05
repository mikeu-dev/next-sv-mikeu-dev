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
	 * Fetches and extracts readable text content, image URLs, and video embeds from an article URL.
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
						'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
					Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
				},
				signal: AbortSignal.timeout(15_000)
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
			}

			const html = await response.text();

			// 1. Extract title from <title> tag
			const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
			const title = titleMatch ? titleMatch[1].trim() : 'Untitled Article';

			// 2. Extract OpenGraph Image
			const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
			                     html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
			const ogImage = ogImageMatch ? ogImageMatch[1] : null;

			// 3. Extract Image Tags
			const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
			const extractedImages = imgMatches
				.map(m => m[1])
				.filter(src => src && (src.startsWith('http') || src.startsWith('//') || src.startsWith('/')));

			// Resolve paths
			const resolvedImages = extractedImages.map(imgUrl => {
				if (imgUrl.startsWith('//')) return `${parsedUrl.protocol}${imgUrl}`;
				if (imgUrl.startsWith('/')) return `${parsedUrl.origin}${imgUrl}`;
				return imgUrl;
			});

			if (ogImage) {
				const resolvedOg = ogImage.startsWith('//') ? `${parsedUrl.protocol}${ogImage}` :
				                   ogImage.startsWith('/') ? `${parsedUrl.origin}${ogImage}` : ogImage;
				if (!resolvedImages.includes(resolvedOg)) {
					resolvedImages.unshift(resolvedOg);
				}
			}

			// Clean and filter images (skip small icons/trackers)
			const cleanImages = resolvedImages.filter(src => {
				const lowercase = src.toLowerCase();
				return !lowercase.includes('icon') &&
				       !lowercase.includes('logo') &&
				       !lowercase.includes('avatar') &&
				       !lowercase.includes('tracker') &&
				       !lowercase.includes('pixel');
			});

			const uniqueImages = [...new Set(cleanImages)].slice(0, 10);

			// 4. Extract YouTube & Vimeo video iframe embeds
			const iframeMatches = [...html.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)];
			const extractedVideos = iframeMatches
				.map(m => m[1])
				.filter(src => src && (src.includes('youtube.com') || src.includes('youtu.be') || src.includes('vimeo.com')));

			const resolvedVideos = extractedVideos.map(vidUrl => {
				if (vidUrl.startsWith('//')) return `https:${vidUrl}`;
				return vidUrl;
			});

			const uniqueVideos = [...new Set(resolvedVideos)].slice(0, 5);

			// 5. Strip HTML to get plain text content
			const textContent = html
				.replace(/<script[\s\S]*?<\/script>/gi, '')
				.replace(/<style[\s\S]*?<\/script>/gi, '') // fix tag match
				.replace(/<style[\s\S]*?<\/style>/gi, '')
				.replace(/<(nav|header|footer|aside)[\s\S]*?<\/\1>/gi, '')
				.replace(/<\/(p|div|h[1-6]|li|tr|blockquote)>/gi, '\n')
				.replace(/<br\s*\/?>/gi, '\n')
				.replace(/<[^>]+>/g, '')
				.replace(/&amp;/g, '&')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
				.replace(/&quot;/g, '"')
				.replace(/&#39;/g, "'")
				.replace(/&nbsp;/g, ' ')
				.replace(/[ \t]+/g, ' ')
				.replace(/\n{3,}/g, '\n\n')
				.trim();

			// Truncate to ~8000 chars to stay within Gemini context limits
			const truncated =
				textContent.length > 8000 ? textContent.substring(0, 8000) + '\n\n[...truncated]' : textContent;

			return {
				title,
				content: truncated,
				url: parsedUrl.toString(),
				images: uniqueImages,
				videos: uniqueVideos
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
	 * Returns a complete localized draft (ID & EN) with slug, thumbnail, and media embeds.
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

			// Parse JSON response
			const jsonMatch = text.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				const parsed = JSON.parse(jsonMatch[0]) as ContentEnhancementResult;
				return parsed;
			}

			// Fallback if not valid JSON
			if (action === 'suggestImprovements') {
				return {
					content_en: text,
					suggestions: text.split('\n').filter((line: string) => line.trim())
				};
			}

			return {
				content_en: text,
				content_id: text,
				title_en: 'Enhanced Draft (EN)',
				title_id: 'Enhanced Draft (ID)',
				slug: 'enhanced-draft'
			};
		} catch (error) {
			console.error(`Gemini enhanceContent (${action}) error:`, error);
			throw new Error(`Failed to enhance content with action "${action}".`);
		}
	}

	/**
	 * Builds a tailored prompt string for each enhancement action.
	 * Generates dual language outputs and embeds media.
	 */
	private buildEnhancementPrompt(
		content: string,
		action: ContentEnhancementAction,
		options: ContentEnhancementOptions
	): string {
		const targetAudience = options.targetAudience ?? 'general';
		const sourceImages = options.sourceImages ?? [];
		const sourceVideos = options.sourceVideos ?? [];

		const imagesText = sourceImages.length > 0
			? `Here are the verified image URLs extracted directly from the source article:\n${sourceImages.map((src, i) => `- Image ${i + 1}: ${src}`).join('\n')}`
			: 'No verified image URLs extracted from the source article.';

		const videosText = sourceVideos.length > 0
			? `Here are the verified video URLs/embeds extracted directly from the source article:\n${sourceVideos.map((src, i) => `- Video ${i + 1}: ${src}`).join('\n')}`
			: 'No verified video URLs/embeds extracted from the source article.';

		const instructions = `
You are a senior tech editor, content strategist, and translator. You are given the text of an article.
You must generate a complete, high-quality, professional blog post draft based on the requested enhancement action.

CRITICAL REQUIREMENTS:
1. **Dual Language**: You MUST output the results for BOTH languages: English (EN) and Indonesian (ID).
2. **Title & Description**: Generate engaging, SEO-optimized titles and descriptions for both versions.
3. **URL Slug**: Create a clean, url-friendly slug based on the English title.
4. **Hero Thumbnail Banner**:
   - At the VERY TOP of both 'content_en' and 'content_id' markdown bodies, you MUST insert a premium hero banner / blog thumbnail image.
   - PRIORITIZE using the first relevant image URL from the source images listed below.
   - If no source images are available (or they are not suitable), select a high-quality Unsplash image: ![Hero Banner](https://images.unsplash.com/photo-[PHOTO_ID]?auto=format&fit=crop&w=800&q=80) related to the tech topic.
5. **Inline Media / Video Placeholder / Pinterest Link**:
   - Inside both content bodies (e.g. after the introduction or under a key heading), embed a placeholder for a video player, illustration, or a relevant Pinterest search link.
   - If verified videos are listed below, embed the first video directly using markdown preview link or iframe.
   - If no videos are available, embed a Pinterest board or search link overlay:
     [![Explore related design ideas on Pinterest](https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80)](https://id.pinterest.com/search/pins/?q=[ENCODED_TOPIC_KEYWORDS])
     where [ENCODED_TOPIC_KEYWORDS] is a URL-encoded keyword search relevant to the article context (e.g. system+architecture, ui+design, devops+setup).
6. **No Placeholders**: Write the full complete content without skipping sections or leaving draft placeholders.
7. **JSON Output**: You MUST return ONLY a valid JSON object matching the following structure:
{
  "title_en": "English Title",
  "title_id": "Indonesian Title",
  "description_en": "SEO Description English",
  "description_id": "SEO Description Indonesian",
  "content_en": "Full English Markdown content, starting with the Hero Banner at the top and including inline video/Pinterest search links...",
  "content_id": "Full Indonesian Markdown content, starting with the Hero Banner at the top and including inline video/Pinterest search links...",
  "slug": "url-friendly-slug-en"
}
`;

		if (action === 'suggestImprovements') {
			return `You are a senior content editor. Analyze the following article and provide detailed improvement suggestions.
Return a JSON object with this structure:
{
  "content_en": "Overall quality assessment of the article...",
  "suggestions": [
    "🔍 **Issue**: [description] — **Why**: [reason] — **Fix**: [recommendation]",
    "...more suggestions"
  ]
}

Article:
"${content}"`;
		}

		const prompts: Record<Exclude<ContentEnhancementAction, 'suggestImprovements'>, string> = {
			fixGrammar: `Action: **Perbaiki Tata Bahasa (Fix Grammar)**.
Analyze the article and correct any grammatical errors, spelling mistakes, punctuation, and wording.
Make both the EN and ID versions grammatically perfect while keeping the content and tone aligned.
${instructions}

Source Media Assets:
${imagesText}
${videosText}

Original Article Content:
"${content}"`,

			improveReadability: `Action: **Tingkatkan Keterbacaan (Improve Readability)**.
Rewrite the content to make it much easier to read.
- Break long paragraphs into shorter ones.
- Use simpler sentence structures.
- Use clear transitions.
- Maintain flow and logical progression.
Generate the enhanced readable version for both English and Indonesian.
${instructions}

Source Media Assets:
${imagesText}
${videosText}

Original Article Content:
"${content}"`,

			adjustAudience: `Action: **Sesuaikan Target Audiens (Adjust Target Audience)**.
Rewrite the article specifically tailored for a **${targetAudience}** audience.
Audience descriptions:
- developer: highly technical, use code examples/jargon freely, skip basic handholding.
- non-technical: avoid jargon, use clear analogies, explain concepts simply.
- manager: focus on business value, efficiency, ROI, and high-level strategy.
- student: educational, step-by-step, clear explanations of terms.
- general: balanced, engaging, accessible to anyone in tech.
Tailor both the English and Indonesian versions to this audience.
${instructions}

Source Media Assets:
${imagesText}
${videosText}

Original Article Content:
"${content}"`,

			optimizeSeo: `Action: **Optimasi SEO (SEO Optimization)**.
Optimize the article structure for search engines:
- Make sure heading hierarchy (H2, H3) is clean and logical.
- Use relevant keywords naturally.
- Generate highly compelling SEO titles and meta descriptions for both languages.
- Optimize images' alt text for accessibility and search indices.
${instructions}

Source Media Assets:
${imagesText}
${videosText}

Original Article Content:
"${content}"`,

			addExplanation: `Action: **Tambahkan Penjelasan (Add Explanations)**.
Review the article, find sections that lack context, detail, or clear explanations, and expand them.
- Add examples, analogies, or detailed definitions where helpful.
- Explain technical terms or background context that may be missing.
Generate the expanded version for both English and Indonesian.
${instructions}

Source Media Assets:
${imagesText}
${videosText}

Original Article Content:
"${content}"`,

			summarize: `Action: **Ringkas Artikel (Summarize)**.
Generate a structured, concise summary of the article.
- Include a 2-3 sentence executive summary.
- Use clean bullet points for the key takeaways and main arguments.
- Keep the summary to roughly 20-30% of the original article's length.
Generate the summary in both English and Indonesian.
${instructions}

Source Media Assets:
${imagesText}
${videosText}

Original Article Content:
"${content}"`,

			translateContent: `Action: **Terjemahkan (Translate)**.
Provide a high-quality, natural translation.
Ensure both the English (EN) and Indonesian (ID) versions are premium and sound native (avoid literal translating style).
${instructions}

Source Media Assets:
${imagesText}
${videosText}

Original Article Content:
"${content}"`
		};

		return prompts[action];
	}
}

// Export a singleton instance
export const geminiService = new GeminiService();
