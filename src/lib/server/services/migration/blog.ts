import { db } from '$lib/server/firebase/firebase.server';
import { COLLECTIONS } from '$lib/server/firebase/collections';

// We need to use import.meta.glob to get the files
const allPostsModules = import.meta.glob('/src/lib/posts/**/*.svx', {
	query: '?raw',
	import: 'default'
});

export async function migrateBlogPosts() {
	const results = [];

	try {
		// Process all posts
		for (const [path, importer] of Object.entries(allPostsModules)) {
			// Determine locale from path
			const pathParts = path.split('/');
			const locale = pathParts[pathParts.length - 2];
			const slug = pathParts[pathParts.length - 1].replace('.svx', '');

			if (!['en', 'id'].includes(locale)) {
				console.warn(`Skipping file with unknown locale structure: ${path}`);
				continue;
			}

			const raw = await (importer as () => Promise<string>)();

			// Extract frontmatter
			const match = /^---\n([\s\S]*?)\n---/.exec(raw);
			if (!match) {
				console.warn(`Skipping file without frontmatter: ${path}`);
				continue;
			}

			const frontmatter = Object.fromEntries(
				match[1]
					.split('\n')
					.map((line) => {
						const [key, ...value] = line.split(':');
						if (!key || !value) return null;
						return [
							key.trim(),
							value
								.join(':')
								.trim()
								.replace(/^['"](.*)['"]$/, '$1')
						];
					})
					.filter(Boolean) as [string, string][]
			);

			// Extract content
			const content = raw.replace(/^---\n([\s\S]*?)\n---/, '').trim();

			const postData = {
				slug,
				locale,
				title: frontmatter.title || 'Untitled',
				description: frontmatter.description || '',
				date: frontmatter.date || new Date().toISOString().split('T')[0],
				published: String(frontmatter.published) === 'true',
				content,
				updatedAt: new Date()
			};

			// Convert published string to boolean if necessary
			if (typeof postData.published === 'string') {
				postData.published = postData.published === 'true';
			}

			await db.collection(COLLECTIONS.BLOG_POSTS).doc(slug).set(postData);

			results.push({
				slug,
				locale,
				status: 'success'
			});
		}

		return {
			success: true,
			message: `Migrated ${results.length} posts`,
			details: results
		};
	} catch (error: any) {
		console.error('Blog migration error:', error);
		return {
			success: false,
			message: error.message,
			error
		};
	}
}
