import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { compile } from 'mdsvex';

// Ganti dengan repo kamu
const GITHUB_USER = 'mikeu-dev';
const GITHUB_REPO = 'portfolio-assets';
const BLOG_DIR = 'blogs';

export const load: PageServerLoad = async ({ params }) => {
	try {
		// 1. Ambil isi file mentah dari GitHub
		const res = await fetch(
			`https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${BLOG_DIR}/${params.slug}.svx`
		);

		if (!res.ok) {
			error(404, `Could not find ${params.slug}`);
		}

		const raw = await res.text();

		// 2. Compile konten SVX menjadi HTML dan ekstrak metadata
		const compiled = await compile(raw);

		if (!compiled || !compiled.code || !compiled.data?.fm) {
			error(500, 'Failed to compile post');
		}

		const { title, description, date } = compiled.data.fm as {
			title: string;
			description: string;
			date: string;
		};

		return {
			content: compiled.code,
			title,
			description,
			date
		};
	} catch (e) {
		console.error(e);
		error(500, `Could not process ${params.slug}`);
	}
};
