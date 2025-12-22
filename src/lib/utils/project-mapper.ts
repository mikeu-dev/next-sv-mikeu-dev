import type { Project, Tag, SerializedTag } from '$lib/types';
import * as Icons from 'svelte-icons-pack/fi';
import type { IconType } from 'svelte-icons-pack';

// Create a lookup map for icons - expanding this as needed based on what's used in the app
// Ideally we should import all icons or have a better way to map names to icons
const iconMap: Record<string, IconType> = {};
for (const key in Icons) {
    // @ts-ignore - Dynamic access to icon pack
    iconMap[key] = Icons[key];
}

export interface LocalizedProject extends Omit<Project, 'title_en' | 'title_id' | 'description_en' | 'description_id' | 'tags'> {
    title: string;
    description: string;
    tags?: Tag[];
}

export function getLocalizedTag(tag: Tag | SerializedTag): Tag {
    if ('iconName' in tag) {
        // It's a SerializedTag
        const icon = iconMap[tag.iconName] || Icons.FiHash; // Default to hash icon if not found
        return {
            name: tag.name,
            color: tag.color,
            url: tag.url,
            icon: icon
        };
    }
    // It's already a Tag (or close enough)
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
