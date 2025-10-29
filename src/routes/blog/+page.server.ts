import { getLocale } from '@/lib/paraglide/runtime'
import type { PageServerLoad, RouteParams } from './$types'
import type { ServerLoadEvent } from '@sveltejs/kit'

export interface Post {
	slug: string
	title: string
	description?: string
	date: string
	published: boolean
}

const allPostsModules = import.meta.glob('/src/lib/posts/**/*.svx', { as: 'raw' })

async function getPosts(locale: string): Promise<Post[]> {
  const posts: Post[] = []

  for (const [path, importer] of Object.entries(allPostsModules)) {
    if (!path.includes(`/${locale}/`)) continue

    const raw = await (importer as () => Promise<string>)()
    const match = /^---\n([\s\S]*?)\n---/.exec(raw)
    if (!match) continue

    const frontmatter = Object.fromEntries(
      match[1]
        .split('\n')
        .map(line => {
          const [key, ...value] = line.split(':')
          return [key.trim(), value.join(':').trim()]
        })
        .filter(([k,v]) => k && v)
    ) as Record<string, string>

    if (frontmatter.published === 'true') {
      const slug = path.split('/').pop()!.replace('.svx', '')
      posts.push({
        ...(frontmatter as Omit<Post, 'slug' | 'published'>),
        slug,
        published: true
      })
    }
  }

  return posts.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}


export const load: PageServerLoad = async (event) => {
  const localsLocale = (event as ServerLoadEvent<RouteParams>).locals?.paraglide?.locale;

  const locale = localsLocale ?? getLocale();
  const posts = await getPosts(locale);

  return { posts };
};
