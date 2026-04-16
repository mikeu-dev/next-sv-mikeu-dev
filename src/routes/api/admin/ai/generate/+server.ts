import { json, type RequestHandler } from '@sveltejs/kit';
import { geminiService } from '$lib/server/services/gemini.service';

export const POST: RequestHandler = async ({ request }) => {
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
					return json({ error: 'Missing title or locale for description generation' }, { status: 400 });
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

			case 'analyzeRepo':
				if (!payload.repoUrl) {
					return json({ error: 'Missing repoUrl for repository analysis' }, { status: 400 });
				}
				result = await geminiService.analyzeRepo(payload.repoUrl);
				break;

			default:
				return json({ error: `Unknown action: ${action}` }, { status: 400 });
		}

		return json({ result });
	} catch (error: unknown) {
		console.error('AI Generation API Error:', error);
		const message = error instanceof Error ? error.message : 'Unknown error occurred during AI generation';
		return json({ error: message }, { status: 500 });
	}
}
