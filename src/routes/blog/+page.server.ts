import type { PageServerLoad } from './$types';

type Post = {
	slug: string;
	title: string;
	description: string;
	date: string;
	published: boolean;
};

// Ganti dengan repo kamu
const GITHUB_USER = 'mikeu-dev';
const GITHUB_REPO = 'portfolio-assets';
const BLOG_DIR = 'blogs';

async function getPosts(): Promise<Post[]> {
	const posts: Post[] = [];

	// 1️⃣ Ambil daftar file di folder blog dari GitHub API
	const listRes = await fetch(
		`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${BLOG_DIR}`
	);
	const files: { name: string; download_url: string }[] = await listRes.json();

	// 2️⃣ Loop tiap file .svx
	for (const file of files) {
		if (!file.name.endsWith('.svx')) continue;

		// Ambil isi file mentah
		const raw = await fetch(file.download_url).then((res) => res.text());

		// 3️⃣ Ekstrak metadata (frontmatter) dari konten .svx
		const match = /^---\n([\s\S]*?)\n---/.exec(raw);
		if (!match) continue;

		const frontmatter = Object.fromEntries(
			match[1]
				.split('\n')
				.map((line) => {
					const [key, ...value] = line.split(':');
					return [key.trim(), value.join(':').trim()];
				})
				.filter(([k, v]) => k && v)
		) as Record<string, string>;

		// 4️⃣ Pastikan metadata valid dan post di-publish
		const slug = file.name.replace('.svx', '');
		if (frontmatter.published === 'true') {
			posts.push({
				...(frontmatter as Omit<Post, 'slug' | 'published'>),
				published: true,
				slug
			});
		}
	}

	// 5️⃣ Urutkan berdasarkan tanggal terbaru
	return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const load: PageServerLoad = async () => {
	const posts = await getPosts();
	return { posts };
};
