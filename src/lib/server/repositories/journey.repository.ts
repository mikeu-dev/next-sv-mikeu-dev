import { BaseRepository } from '../core/base.repository';
import { COLLECTIONS } from '../firebase/collections';
import type { JourneyItem } from '$lib/types';

export interface JourneyData {
	items: JourneyItem[];
	updatedAt?: Date;
}

export class JourneyRepository extends BaseRepository<JourneyData> {
	constructor() {
		super(COLLECTIONS.JOURNEY);
	}

	async getByLang(lang: 'en' | 'id'): Promise<JourneyData | null> {
		return await this.findById(lang);
	}
}
