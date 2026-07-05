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
}

/**
 * The shape returned by the `enhanceContent` service method.
 * `suggestImprovements` populates `suggestions`; all other
 * actions populate `content`.
 */
export interface ContentEnhancementResult {
	readonly title?: string;
	readonly description?: string;
	readonly content: string;
	readonly suggestions?: string[];
}

/** Metadata extracted from a fetched article URL. */
export interface FetchedArticle {
	readonly title: string;
	readonly content: string;
	readonly url: string;
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
		description: 'Fix grammar, typo, dan tanda baca'
	},
	{
		key: 'improveReadability',
		label: 'Tingkatkan Keterbacaan',
		emoji: '📖',
		description: 'Restruktur kalimat & paragraf agar lebih mudah dibaca'
	},
	{
		key: 'adjustAudience',
		label: 'Sesuaikan Target Audiens',
		emoji: '🎯',
		description: 'Sesuaikan tone & kompleksitas untuk audiens tertentu'
	},
	{
		key: 'optimizeSeo',
		label: 'Optimasi SEO',
		emoji: '🔍',
		description: 'Optimalkan keyword, heading, dan meta description'
	},
	{
		key: 'addExplanation',
		label: 'Tambahkan Penjelasan',
		emoji: '➕',
		description: 'Elaborate bagian yang kurang detail'
	},
	{
		key: 'summarize',
		label: 'Ringkas Artikel',
		emoji: '📋',
		description: 'Buat ringkasan concise dari artikel'
	},
	{
		key: 'translateContent',
		label: 'Terjemahkan',
		emoji: '🌐',
		description: 'Terjemahkan konten ke bahasa lain'
	},
	{
		key: 'suggestImprovements',
		label: 'Saran Perbaikan',
		emoji: '💡',
		description: 'Berikan saran perbaikan beserta alasannya'
	}
] as const;
