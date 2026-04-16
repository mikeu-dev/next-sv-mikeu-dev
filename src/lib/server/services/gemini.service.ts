import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import { Octokit } from 'octokit';
import { env } from '../config/env';

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
			console.warn('⚠️  GOOGLE_GEMINI_API_KEY is not set. Gemini AI features will be disabled.');
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
1. **Dynamic Technical Freshness**:
   - Always apply the **LATEST STABLE INDUSTRY STANDARDS** (as of 2024-2025) for any framework, tool, or technology mentioned in the prompt.
   - If the topic relates to **Svelte/SvelteKit**, you MUST use **Svelte 5 Runes** ($state, $derived, $props) and **SvelteKit 2+** patterns. Avoid older Svelte 4 syntax or deprecated SvelteKit APIs.
   - For other technologies (e.g., React, Next.js, AI, DevOps), default to the most modern and non-deprecated best practices.
   - If the topic is non-technical, maintain a smart, contemporary perspective.
2. **Typography & Structure**:
   - Use a clear visual hierarchy: **H2 for major sections**, **H3 for nested points**.
   - Use **Blockquotes (>)** for "Pro Tips", key takeaways, or humorous dev observations.
   - Use **Bold text** strategically for emphasis.
   - Use **Lists (ul/ol)** to break up long sections.
   - For technical topics, include high-quality, formatted **Code Blocks** using modern syntax.
3. **Meme Instruction**: Include 2-3 technical "memes" or jokes. These can be funny observations, sarcastic remarks about "legacy code", or relatable developer struggles.
4. **Image Instruction**: Include 2-3 relevant images using Markdown syntax: ![Descriptive Alt Text](https://loremflickr.com/800/600/tech,coding,humor).
5. **Tone**: Professional yet VERY engaging, informal, and humorous.
6. **Goal**: The content should feel like it was written by a current industry expert today, not 2 years ago.

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
}

// Export a singleton instance
export const geminiService = new GeminiService();
