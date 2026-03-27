import { SocialsRepository } from '../repositories/socials.repository';
import type { Socials } from '$lib/types';

export class SocialsService {
	private repository = new SocialsRepository();

	async getSocials(): Promise<Socials | null> {
		try {
			return await this.repository.getDefault();
		} catch (error) {
			console.error('Error fetching socials:', error);
			throw error;
		}
	}

	async updateSocials(data: Socials): Promise<Socials | null> {
		try {
			return await this.repository.update('default', data);
		} catch (error) {
			console.error('Error updating socials:', error);
			throw error;
		}
	}
}
