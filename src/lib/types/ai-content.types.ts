/**
 * AI Content Enhancement — shared type definitions.
 *
 * Used by the Gemini service, API endpoint, and the
 * AIContentEnhancer Svelte component.
 */

/** All supported enhancement actions. */
export type ContentEnhancementAction =
	| 'fixGrammar'
	| 'improveReadability'
	| 'adjustAudience'
	| 'optimizeSeo'
	| 'addExplanation'
	| 'summarize'
	| 'translateContent'
	| 'suggestImprovements';

/** Audience presets for the `adjustAudience` action. */
export type TargetAudience = 'developer' | 'non-technical' | 'manager' | 'student' | 'general';

/** Optional parameters that vary per action. */
export interface ContentEnhancementOptions {
	readonly locale?: 'en' | 'id';
	readonly targetAudience?: TargetAudience;
	readonly targetLocale?: 'en' | 'id';
	readonly sourceImages?: string[];
	readonly sourceVideos?: string[];
}

/**
 * The shape returned by the `enhanceContent` service method.
 * Dual-language outputs enable populating both ID & EN versions at once.
 */
export interface ContentEnhancementResult {
	readonly title_en?: string;
	readonly title_id?: string;
	readonly description_en?: string;
	readonly description_id?: string;
	readonly content_en?: string;
	readonly content_id?: string;
	readonly slug?: string;
	readonly suggestions?: string[];
}

/** Metadata extracted from a fetched article URL. */
export interface FetchedArticle {
	readonly title: string;
	readonly content: string;
	readonly url: string;
	readonly images: string[];
	readonly videos: string[];
}

/** Descriptor for each action button rendered in the UI. */
export interface EnhancementActionDescriptor {
	readonly key: ContentEnhancementAction;
	readonly label: string;
	readonly emoji: string;
	readonly description: string;
}

/** All 8 actions with their UI metadata — single source of truth. */
export const ENHANCEMENT_ACTIONS: readonly EnhancementActionDescriptor[] = [
	{
		key: 'fixGrammar',
		label: 'Perbaiki Tata Bahasa',
		emoji: '✍️',
		description: 'Fix grammar, spelling, & punctuation (ID & EN)'
	},
	{
		key: 'improveReadability',
		label: 'Tingkatkan Keterbacaan',
		emoji: '📖',
		description: 'Restructure sentences and enhance readability (ID & EN)'
	},
	{
		key: 'adjustAudience',
		label: 'Sesuaikan Target Audiens',
		emoji: '🎯',
		description: 'Tailor vocabulary & tone for specific target groups (ID & EN)'
	},
	{
		key: 'optimizeSeo',
		label: 'Optimasi SEO',
		emoji: '🔍',
		description: 'Audit heading structure, keywords, & generate meta tags (ID & EN)'
	},
	{
		key: 'addExplanation',
		label: 'Tambahkan Penjelasan',
		emoji: '➕',
		description: 'Expand brief areas and clarify complex technical details (ID & EN)'
	},
	{
		key: 'summarize',
		label: 'Ringkas Artikel',
		emoji: '📋',
		description: 'Generate structured concise summaries (ID & EN)'
	},
	{
		key: 'translateContent',
		label: 'Terjemahkan',
		emoji: '🌐',
		description: 'Translate and optimize across both English & Indonesian versions'
	},
	{
		key: 'suggestImprovements',
		label: 'Saran Perbaikan',
		emoji: '💡',
		description: 'Analyze article and list actionable recommendations with reasoning'
	}
] as const;
