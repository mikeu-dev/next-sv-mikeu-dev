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
	tags?: Tag[];
	pinned?: boolean;
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
	createdAt?: Date;
}

export interface Tag {
	name: string;
	icon: IconType;
	color: string;
	url: string;
}
