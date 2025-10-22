export interface Project {
	id: string;
	title: string;
	description: string;
	content?: string;
	slug?: string;
	thumbnailUrl?: string;
	repoUrl?: string;
	demoUrl?: string;
	published?: boolean;
	tags?: string[];
	createdAt?: Date;
	updatedAt?: Date;
}

export interface Contact {
	id: string;
	name: string;
	email: string;
	message: string;
	createdAt?: Date;
}
