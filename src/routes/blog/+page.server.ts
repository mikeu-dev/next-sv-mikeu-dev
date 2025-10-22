import type { PageServerLoad } from './$types';

type Post = {
	slug: string;
	title: string;
	description: string;
	date: string;
	published: boolean;
};

async function getPosts() {
	const posts: Post[] = [];
	const paths = import.meta.glob<{ metadata: Omit<Post, 'slug'> }>('/src/lib/posts/*.svx', {
		eager: true
	});

	for (const path in paths) {
		const file = paths[path];
		const slug = path.split('/').at(-1)?.replace('.svx', '');

		if (file && typeof file === 'object' && 'metadata' in file && slug) {
			const post = { ...file.metadata, slug };
			if (post.published) {
				posts.push(post);
			}
		}
	}

	return posts.sort(
		(first, second) => new Date(second.date).getTime() - new Date(first.date).getTime()
	);
}

export const load: PageServerLoad = async () => {
	const posts = await getPosts();
	return {
		posts
	};
};
