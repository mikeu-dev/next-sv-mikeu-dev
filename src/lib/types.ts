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
	tags?: Tag[];
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

import type { Component } from 'svelte';

export interface Tag {
	name: string;
	icon: Component;
	color: string;
	url: string;
}
