import { db } from '../firebase/firebase.server';
import { COLLECTIONS } from '../firebase/collections';
import * as SimpleIcons from 'simple-icons';

export class SocialsService {
	async getSocials() {
		try {
			const doc = await db.collection(COLLECTIONS.SOCIALS).doc('default').get();

			if (!doc.exists) {
				return { links: [] };
			}

			const data = doc.data();
			const links = (data?.links || []) as Array<{ iconName: string; [key: string]: any }>;

			const processedLinks = links.map((link) => {
				if (link.iconName && link.iconName.startsWith('Si')) {
					// Convert SiGithub -> siGithub to match SimpleIcons keys
					const key = 'si' + link.iconName.slice(2);
					const icon = (SimpleIcons as unknown as Record<string, { svg: string }>)[key];

					if (icon && icon.svg) {
						return {
							...link,
							// Inject accessible class and ensure fill uses current text color
							svg: icon.svg.replace('<svg', '<svg class="w-full h-full fill-current"')
						};
					}
				}
				return link;
			});

			return { ...data, links: processedLinks };
		} catch (error) {
			console.error('Error fetching socials:', error);
			throw error;
		}
	}
}
