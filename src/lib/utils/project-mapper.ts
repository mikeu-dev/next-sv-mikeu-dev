import type { Project, Tag, SerializedTag } from '$lib/types';
import * as Icons from 'svelte-icons-pack/fi';
import * as SiIcons from 'svelte-icons-pack/si';
import type { IconType } from 'svelte-icons-pack';

// Create a lookup map for icons - expanding this as needed based on what's used in the app
// Ideally we should import all icons or have a better way to map names to icons
const iconMap: Record<string, IconType> = {};
for (const key in Icons) {
	// @ts-expect-error - Dynamic access to icon pack
	iconMap[key] = Icons[key];
}
for (const key in SiIcons) {
	// @ts-expect-error - Dynamic access to icon pack
	iconMap[key] = SiIcons[key];
}

export interface LocalizedProject
	extends Omit<Project, 'title_en' | 'title_id' | 'description_en' | 'description_id' | 'tags'> {
	title: string;
	description: string;
	tags?: Tag[];
}

export function getLocalizedTag(tag: Tag | SerializedTag | unknown): Tag {
	const tagRecord = tag as Record<string, unknown>;
	const iconName =
		(tagRecord.iconName as string) || (typeof tagRecord.icon === 'string' ? tagRecord.icon : null);

	if (iconName) {
		// It's a SerializedTag or a tag with string icon
		// Check if icon exists in map, if not, try to find it in SiIcons directly if needed (though map should have it)
		// Adjust for cases where name might be 'SiSvelte' but key is 'siSvelte' or similar if case mismatch?
		// Typically svelte-icons-pack keys are e.g. 'SiSvelte'.
		const icon = iconMap[iconName] || Icons.FiHash;
		return {
			name: tagRecord.name as string,
			color: tagRecord.color as string,
			url: tagRecord.url as string,
			icon: icon
		};
	}
	// It's already a Tag (or close enough) with component icon
	return tag as Tag;
}

export function getLocalizedProject(project: Project, locale: string = 'en'): LocalizedProject {
	const isEn = locale === 'en';

	const localizedProject: LocalizedProject = {
		...project,
		title: isEn ? project.title_en : project.title_id,
		description: isEn ? project.description_en : project.description_id,
		tags: project.tags?.map(getLocalizedTag)
	};

	return localizedProject;
}
