import { error } from '@sveltejs/kit';
import { getLocale } from '@/lib/paraglide/runtime';
import type { PageServerLoad } from './$types';

// Ambil semua file .svx sebagai teks mentah (hanya untuk meta/frontmatter)
const allPosts = import.meta.glob('/src/lib/posts/**/*.svx', { as: 'raw' });

export interface BlogPageData {
	slug: string;
	locale: string;
	meta: Record<string, string>;
}

export const load: PageServerLoad = async (event) => {
	const { params, locals } = event;
	const locale = locals.paraglide.locale ?? getLocale();

	// Cari file sesuai slug dan locale
	const match = Object.entries(allPosts).find(
		([path]) => path.includes(`/${locale}/`) && path.endsWith(`${params.slug}.svx`)
	);

	if (!match) throw error(404, `Artikel "${params.slug}" tidak ditemukan`);

	const [, importer] = match as [string, () => Promise<string>];
	const raw = await importer();

	// === Parse frontmatter ===
	const fmMatch = /^---\n([\s\S]*?)\n---/.exec(raw);
	const meta: Record<string, string> = {};

	if (fmMatch) {
		fmMatch[1]
			.split('\n')
			.map((line) => {
				const [key, ...value] = line.split(':');
				return [key.trim(), value.join(':').trim()];
			})
			.filter(([k, v]) => k && v)
			.forEach(([k, v]) => {
				meta[k] = v;
			});
	}

	return {
		slug: params.slug,
		locale,
		meta
	};
};
