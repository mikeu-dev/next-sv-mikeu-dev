import { BaseRepository } from '../core/base.repository';
import { COLLECTIONS } from '../firebase/collections';

export interface SkillsData {
	items: string[];
	updatedAt?: Date;
}

export class SkillsRepository extends BaseRepository<SkillsData> {
	constructor() {
		super(COLLECTIONS.SKILLS);
	}

	async getByLang(lang: 'en' | 'id'): Promise<SkillsData | null> {
		return await this.findById(lang);
	}
}
