import type { Project, SerializedTag, Tag } from '#lib/types.js';

/** Glyph paths (22×22) for the four geometry types used as project icons. */
export const GEOM_ICON = {
	point: 'M11 3c-3.3 0-6 2.6-6 5.9C5 13.3 11 19 11 19s6-5.7 6-10.1C17 5.6 14.3 3 11 3z',
	line: 'M3 17 L8 8 L13 13 L19 4',
	poly: 'M4 7 L11 3 L18 7 L16 17 L6 17 Z',
	box: 'M4 6 V4 H6 M16 4 H18 V6 M18 16 V18 H16 M6 18 H4 V16 M8 9 H14 V14 H8 Z'
} as const;

const ICON_CYCLE = [GEOM_ICON.poly, GEOM_ICON.poly, GEOM_ICON.line, GEOM_ICON.point, GEOM_ICON.box];

function hash(input: string): number {
	let h = 2166136261;
	for (let i = 0; i < input.length; i++) {
		h ^= input.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

export function tagNames(project: Project): string[] {
	return ((project.tags ?? []) as (Tag | SerializedTag)[])
		.map((t) => t?.name)
		.filter((n): n is string => Boolean(n));
}

export interface MapProject {
	project: Project;
	/** layer code, e.g. "L-01" */
	code: string;
	title: string;
	description: string;
	tags: string[];
	/** short category line built from the first tags */
	category: string;
	href: string;
	/** stable position on the flat basemap, in % (kept away from the edges) */
	x: number;
	y: number;
	icon: string;
	date?: Date;
}

/**
 * Projects don't carry real coordinates, so each one gets a stable
 * pseudo-location derived from its id — the same project always lands on the
 * same spot of the illustrative basemap.
 */
export function toMapProjects(
	projects: Project[],
	locale: string,
	localize: (href: string) => string
): MapProject[] {
	return projects.map((project, i) => {
		const h = hash(project.id || project.slug || String(i));
		const tags = tagNames(project);
		const title = (locale === 'en' ? project.title_en : project.title_id) || project.title_en;
		const description =
			(locale === 'en' ? project.description_en : project.description_id) || project.description_en;
		return {
			project,
			code: `L-${String(i + 1).padStart(2, '0')}`,
			title,
			description,
			tags,
			category: tags.slice(0, 2).join(' · '),
			href: localize(`/projects/${project.slug || project.id}`),
			x: 18 + (h % 640) / 10,
			y: 20 + ((h >>> 10) % 600) / 10,
			icon: ICON_CYCLE[i % ICON_CYCLE.length],
			date: project.createdAt ? new Date(project.createdAt) : undefined
		};
	});
}
