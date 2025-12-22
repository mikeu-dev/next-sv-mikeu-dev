import type { IconType } from "svelte-icons-pack";

export interface Project {
	id: string;
	title: string;
	description: string;
	content?: string;
	slug?: string;
	thumbnailUrl?: string;
	imagesUrl?: string[];
	repoUrl?: string;
	demoUrl?: string;
	published?: boolean;
	tags?: Tag[] | SerializedTag[]; // Support both formats
	pinned?: boolean;
	lang?: 'en' | 'id'; // Language identifier
	createdAt?: Date;
	updatedAt?: Date;
}

export interface Contact {
	id: string;
	name: string;
	email: string;
	message: string;
	company?: string;
	budget?: string;
	status?: 'new' | 'in-review' | 'replied' | 'closed';
	notes?: string;
	logs?: ContactLog[]; // New field for activity logs
	tags?: string[]; // New field for tags
	createdAt?: Date;
}

export interface ContactLog {
	id: string;
	type: 'status_change' | 'note_added' | 'tag_added' | 'tag_removed' | 'system';
	title: string;
	description?: string;
	createdAt: Date;
	author?: string;
}

export interface Tag {
	name: string;
	icon: IconType;
	color: string;
	url: string;
}

// Serialized version for Firestore (icon as string name)
export interface SerializedTag {
	name: string;
	iconName: string;
	color: string;
	url: string;
}
