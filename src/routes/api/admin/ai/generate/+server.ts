import { json, type RequestHandler } from '@sveltejs/kit';
import { geminiService } from '$lib/server/services/gemini.service';
import { checkRateLimit } from '$lib/server/middleware/rate-limit';
import type { ContentEnhancementAction } from '$lib/types/ai-content.types';

const AI_RATE_LIMIT = { maxRequests: 20, windowMs: 60_000 }; // 20 req/min per session

const VALID_ENHANCEMENT_ACTIONS: readonly ContentEnhancementAction[] = [
	'fixGrammar',
	'improveReadability',
	'adjustAudience',
	'optimizeSeo',
	'addExplanation',
	'summarize',
	'translateContent',
	'suggestImprovements'
];

export const POST: RequestHandler = async (event) => {
	const rateLimitResult = checkRateLimit(event, AI_RATE_LIMIT);
	if (rateLimitResult) return rateLimitResult;

	const { request } = event;
	try {
		const { action, payload } = await request.json();

		if (!action || !payload) {
			return json({ error: 'Missing action or payload' }, { status: 400 });
		}

		let result;

		switch (action) {
			case 'translate':
				if (!payload.text || !payload.toLocale) {
					return json({ error: 'Missing text or toLocale for translation' }, { status: 400 });
				}
				result = await geminiService.translate(payload.text, payload.toLocale);
				break;

			case 'generateDescription':
				if (!payload.title || !payload.locale) {
					return json(
						{ error: 'Missing title or locale for description generation' },
						{ status: 400 }
					);
				}
				result = await geminiService.generateDescription(payload.title, payload.locale);
				break;

			case 'polish':
				if (!payload.text || !payload.locale) {
					return json({ error: 'Missing text or locale for polishing' }, { status: 400 });
				}
				result = await geminiService.polish(payload.text, payload.locale);
				break;

			case 'suggestTags':
				if (!payload.title) {
					return json({ error: 'Missing title for tag suggestion' }, { status: 400 });
				}
				result = await geminiService.suggestTags(payload.title, payload.description || '');
				break;

			case 'analyzeRepo': {
				if (!payload.repoUrl) {
					return json({ error: 'Missing repoUrl for repository analysis' }, { status: 400 });
				}
				// Validate URL before passing to AI to prevent SSRF / prompt injection
				let parsedUrl: URL;
				try {
					parsedUrl = new URL(payload.repoUrl);
				} catch {
					return json({ error: 'Invalid URL format' }, { status: 400 });
				}
				if (parsedUrl.protocol !== 'https:') {
					return json({ error: 'Only HTTPS URLs are allowed' }, { status: 400 });
				}
				result = await geminiService.analyzeRepo(parsedUrl.toString());
				break;
			}

			case 'generateBlogFromPrompt':
				if (!payload.prompt) {
					return json({ error: 'Missing prompt for blog generation' }, { status: 400 });
				}
				result = await geminiService.generateBlogFromPrompt(payload.prompt);
				break;

			case 'fetchArticle': {
				if (!payload.url) {
					return json({ error: 'Missing url for article fetching' }, { status: 400 });
				}
				let articleUrl: URL;
				try {
					articleUrl = new URL(payload.url);
				} catch {
					return json({ error: 'Invalid URL format' }, { status: 400 });
				}
				if (articleUrl.protocol !== 'https:' && articleUrl.protocol !== 'http:') {
					return json({ error: 'Only HTTP/HTTPS URLs are allowed' }, { status: 400 });
				}
				result = await geminiService.fetchArticleContent(articleUrl.toString());
				break;
			}

			case 'enhanceContent': {
				if (!payload.content || !payload.enhancementAction) {
					return json(
						{ error: 'Missing content or enhancementAction for content enhancement' },
						{ status: 400 }
					);
				}
				if (
					!VALID_ENHANCEMENT_ACTIONS.includes(payload.enhancementAction as ContentEnhancementAction)
				) {
					return json(
						{ error: `Invalid enhancement action: ${payload.enhancementAction}` },
						{ status: 400 }
					);
				}
				result = await geminiService.enhanceContent(
					payload.content,
					payload.enhancementAction as ContentEnhancementAction,
					payload.options ?? {}
				);
				break;
			}

			default:
				return json({ error: `Unknown action: ${action}` }, { status: 400 });
		}

		return json({ result });
	} catch (error: unknown) {
		console.error('AI Generation API Error:', error);
		const message =
			error instanceof Error ? error.message : 'Unknown error occurred during AI generation';
		return json({ error: message }, { status: 500 });
	}
};
