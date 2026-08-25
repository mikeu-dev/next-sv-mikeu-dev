import { BaseRepository } from '../core/base.repository';
import { COLLECTIONS } from '../firebase/collections';
import type { TechStackCategory } from '#lib/types.js';

export interface TechStackData {
	categories: TechStackCategory[];
	updatedAt?: Date;
}

export class TechStackRepository extends BaseRepository<TechStackData> {
	constructor() {
		super(COLLECTIONS.TECHSTACK);
	}

	async getByLang(lang: 'en' | 'id'): Promise<TechStackData | null> {
		return await this.findById(lang);
	}
}
