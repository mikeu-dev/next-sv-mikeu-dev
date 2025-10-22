import type { Project } from '$lib/types';

export const projects: Project[] = [
	{
		id: '1',
		slug: 'animotion',
		title: 'Animotion',
		description: 'A lightweight, promise-based animation library for the modern web.',
		thumbnailUrl: 'https://raw.githubusercontent.com/mikeu-dev/animotion/main/media/banner.png',
		repoUrl: 'https://github.com/mikeu-dev/animotion',
		tags: ['TypeScript', 'Animation', 'Library'],
		content: `
			<h3>Project Goal</h3>
			<p>The main goal of Animotion was to create a simple, intuitive, and lightweight animation library that leverages the power of JavaScript Promises. I wanted to provide an alternative to more complex animation libraries, focusing on a clean API and ease of use for modern web development.</p>
			<h3>Challenges & Solutions</h3>
			<p>One of the biggest challenges was designing a flexible and chainable API that felt natural with async/await syntax. After several iterations, I settled on a factory function pattern that returns a promise, allowing developers to easily sequence animations and integrate them with other asynchronous code.</p>
			<p>Another hurdle was ensuring high performance and avoiding layout thrashing. This was solved by batching DOM reads and writes and using \`requestAnimationFrame\` to schedule animations efficiently.</p>`
	},
	{
		id: '2',
		slug: 'notion-clone',
		title: 'Notion Clone',
		description:
			'A Notion clone built with Next.js, TypeScript, and Convex for real-time database functionality.',
		thumbnailUrl:
			'https://raw.githubusercontent.com/mikeu-dev/notion-clone/main/public/preview.png',
		repoUrl: 'https://github.com/mikeu-dev/notion-clone',
		tags: ['Next.js', 'TypeScript', 'Convex', 'Real-time']
	},
	{
		id: '3',
		slug: 'discord-clone',
		title: 'Discord Clone',
		description:
			'A real-time Discord clone using Next.js 13, Socket.io, and Prisma for full-stack communication.',
		thumbnailUrl:
			'https://raw.githubusercontent.com/mikeu-dev/discord-clone/main/public/preview.png',
		repoUrl: 'https://github.com/mikeu-dev/discord-clone',
		tags: ['Next.js', 'Socket.io', 'Prisma', 'Real-time']
	},
	{
		id: '4',
		slug: 'personal-portfolio',
		title: 'Personal Portfolio',
		description:
			'This very portfolio website, built with SvelteKit, Tailwind CSS, and GSAP for animations.',
		thumbnailUrl:
			'https://raw.githubusercontent.com/mikeu-dev/next-sv-portfolio/main/public/preview.png',
		repoUrl: 'https://github.com/mikeu-dev/next-sv-portfolio',
		tags: ['SvelteKit', 'TailwindCSS', 'GSAP']
	},
	{
		id: '5',
		slug: 'sveltekit-starter',
		title: 'SvelteKit Starter',
		description:
			'A starter template with TypeScript, Tailwind CSS, and more to kickstart SvelteKit projects.',
		thumbnailUrl:
			'https://raw.githubusercontent.com/mikeu-dev/svelte-starter/main/github/cover.png',
		repoUrl: 'https://github.com/mikeu-dev/svelte-starter',
		tags: ['SvelteKit', 'Template', 'TypeScript']
	},
	{
		id: '6',
		slug: 'dotfiles',
		title: 'Dotfiles',
		description:
			'My personal dotfiles for a consistent and efficient development environment across machines.',
		repoUrl: 'https://github.com/mikeu-dev/dotfiles',
		tags: ['Dev Environment', 'Shell', 'Config']
	}
];
