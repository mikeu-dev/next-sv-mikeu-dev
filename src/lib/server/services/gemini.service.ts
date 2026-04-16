import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import { env } from '../config/env';

/**
 * Service for interacting with Google Gemini AI.
 */
export class GeminiService {
	private genAI: GoogleGenerativeAI;
	private model: GenerativeModel;

	constructor() {
		const apiKey = env.GOOGLE_GEMINI_API_KEY;
		if (!apiKey) {
			console.warn('⚠️  GOOGLE_GEMINI_API_KEY is not set. Gemini AI features will be disabled.');
		}
		this.genAI = new GoogleGenerativeAI(apiKey || '');
		this.model = this.genAI.getGenerativeModel({
			model: 'gemini-1.5-flash'
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
}

// Export a singleton instance
export const geminiService = new GeminiService();
