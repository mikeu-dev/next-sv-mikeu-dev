import { BaseRepository } from '../core/base.repository';
import { COLLECTIONS } from '../firebase/collections';
import type { Socials } from '$lib/types';

/**
 * Repository untuk menangani data tautan sosial.
 */
export class SocialsRepository extends BaseRepository<Socials> {
	constructor() {
		super(COLLECTIONS.SOCIALS);
	}

	async getDefault(): Promise<Socials | null> {
		return await this.findById('default');
	}
}
