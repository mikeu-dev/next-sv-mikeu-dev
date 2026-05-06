import type { Tag } from '$lib/types';

export interface LocalizedCategory {
	category: string;
	items: Tag[];
}

export interface Particle {
	id: string;
	x: number;
	y: number;
	vx: number;
	vy: number;
	color: string;
	life: number;
}

export interface SkillItem extends Tag {
	relX: number;
	relY: number;
	catColor: string;
	category: string;
	x: number;
	y: number;
	angle: number;
	opacity: number;
	scale: number;
	brightness: number;
}

export interface Tetrimino {
	shape: string;
	skills: SkillItem[];
	color: string;
	isLight: boolean;
}

export interface PieceBody {
	piece: Tetrimino;
	id: number;
}

export const categoryColors: Record<string, string> = {
	Frontend: '#FF3E00',
	Backend: '#3b82f6',
	GIS: '#10b981',
	Tools: '#f59e0b'
};

export const tetrisColors: Record<string, string> = {
	I: '#22d3ee', // Cyan
	L: '#fb923c', // Orange
	J: '#3b82f6', // Blue
	O: '#facc15', // Yellow
	T: '#c084fc', // Purple
	S: '#4ade80', // Green
	Z: '#f87171', // Red
	P: '#f472b6', // Rose
	D: '#94a3b8', // Slate
	V: '#2dd4bf', // Teal
	U: '#818cf8', // Indigo
	B: '#a78bfa', // Violet
	X: '#fb7185' // Rose
};

export const shapes: Record<string, number[][]> = {
	I: [[0, 0], [1, 0], [2, 0], [3, 0]],
	L: [[0, 0], [0, 1], [0, 2], [1, 2]],
	J: [[1, 0], [1, 1], [1, 2], [0, 2]],
	O: [[0, 0], [1, 0], [0, 1], [1, 1]],
	T: [[0, 0], [1, 0], [2, 0], [1, 1]],
	S: [[1, 0], [2, 0], [0, 1], [1, 1]],
	Z: [[0, 0], [1, 0], [1, 1], [2, 1]],
	P: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]],
	D: [[0, 0]],
	V: [[0, 0], [0, 1], [1, 1]],
	U: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]],
	B: [[0, 0], [1, 0]],
	X: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]]
};

export const defaultUrls: Record<string, string> = {
	Svelte: 'https://svelte.dev',
	SvelteKit: 'https://kit.svelte.dev',
	TailwindCSS: 'https://tailwindcss.com',
	TypeScript: 'https://www.typescriptlang.org',
	GSAP: 'https://gsap.com',
	'Matter.js': 'https://brm.io/matter-js/',
	Firebase: 'https://firebase.google.com',
	Vite: 'https://vitejs.dev',
	React: 'https://react.dev',
	'Node.js': 'https://nodejs.org',
	'Next.js': 'https://nextjs.org',
	Prisma: 'https://www.prisma.io',
	Drizzle: 'https://orm.drizzle.team',
	PostgreSQL: 'https://www.postgresql.org',
	Supabase: 'https://supabase.com',
	Lucide: 'https://lucide.dev',
	Storybook: 'https://storybook.js.org',
	Playwright: 'https://playwright.dev',
	Vitest: 'https://vitest.dev',
	ESLint: 'https://eslint.org',
	Prettier: 'https://prettier.io',
	Docker: 'https://www.docker.com',
	Git: 'https://git-scm.com',
	GitHub: 'https://github.com'
};

export function isColorLight(hex: string) {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return (r * 299 + g * 587 + b * 114) / 1000 >= 128;
}
