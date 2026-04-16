import { BaseRepository } from '../core/base.repository';
import { COLLECTIONS } from '../firebase/collections';
import type { DynamicIcon } from '$lib/types';

export class IconRepository extends BaseRepository<DynamicIcon> {
	constructor() {
		super(COLLECTIONS.CUSTOM_ICONS);
	}

	async getAll(): Promise<DynamicIcon[]> {
		return await this.findAll();
	}
}
