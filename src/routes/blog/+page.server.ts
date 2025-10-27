import type { PageServerLoad } from './$types'

type Post = {
	slug: string
	title: string
	description?: string
	date: string
	published: boolean
}

// Ambil semua file .svx di folder posts secara raw
const postsModules = import.meta.glob('/src/lib/posts/*.svx', { as: 'raw' })

async function getPosts(): Promise<Post[]> {
	const posts: Post[] = []

	// Loop tiap entry
	for (const [path, importer] of Object.entries(postsModules)) {
		const raw = await (importer as () => Promise<string>)()

		// Parse frontmatter manual
		const match = /^---\n([\s\S]*?)\n---/.exec(raw)
		if (!match) continue

		const frontmatter = Object.fromEntries(
			match[1]
				.split('\n')
				.map((line) => {
					const [key, ...value] = line.split(':')
					return [key.trim(), value.join(':').trim()]
				})
				.filter(([k, v]) => k && v)
		) as Record<string, string>

		// Pastikan post published
		if (frontmatter.published === 'true') {
			const slug = path.split('/').pop()!.replace('.svx', '')
			posts.push({
				...(frontmatter as Omit<Post, 'slug' | 'published'>),
				slug,
				published: true
			})
		}
	}

	// Urutkan berdasarkan tanggal terbaru
	return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const load: PageServerLoad = async () => {
	const posts = await getPosts()
	return { posts }
}
