import type { Project, Tag, SerializedTag } from '$lib/types';
import { getIconByName } from '$lib/icons/registry';

// We no longer build a manual map here to allow tree-shaking

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
		const icon = getIconByName(iconName);
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
