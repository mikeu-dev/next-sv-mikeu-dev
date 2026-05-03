import { db } from '$lib/server/firebase/firebase.server';
import type { GeneralSettings, ProfileSettings, ResumeSettings } from '../schemas/settings.schema';
import { defaultSettings } from '../schemas/settings.schema';
import { sanitizeForFirestore } from '../utils/firestore';

export class SettingsService {
	private readonly collection = 'settings';

	// Document IDs for organizing settings
	private readonly DOC_GENERAL = 'general';
	private readonly DOC_PROFILE = 'profile';
	private readonly DOC_RESUME = 'resume';

	private get db() {
		return db;
	}

	async getGeneralSettings(): Promise<GeneralSettings> {
		const currentDb = this.db;
		if (!currentDb) return defaultSettings.general as GeneralSettings;

		try {
			const doc = await currentDb.collection(this.collection).doc(this.DOC_GENERAL).get();
			if (!doc.exists) {
				return defaultSettings.general as GeneralSettings;
			}
			return {
				...defaultSettings.general,
				...doc.data()
			} as GeneralSettings;
		} catch (error) {
			console.error('SettingsService: Failed to get general settings', error);
			return defaultSettings.general as GeneralSettings;
		}
	}

	async updateGeneralSettings(data: GeneralSettings): Promise<void> {
		const currentDb = this.db;
		if (!currentDb) return;

		try {
			const sanitizedData = sanitizeForFirestore(data);
			await currentDb.collection(this.collection).doc(this.DOC_GENERAL).set(sanitizedData, { merge: true });
		} catch (error) {
			console.error('SettingsService: Failed to update general settings', error);
			throw error;
		}
	}

	async getProfileSettings(): Promise<ProfileSettings> {
		const currentDb = this.db;
		if (!currentDb) return defaultSettings.profile as ProfileSettings;

		try {
			const doc = await currentDb.collection(this.collection).doc(this.DOC_PROFILE).get();
			if (!doc.exists) {
				return defaultSettings.profile as ProfileSettings;
			}
			return {
				...defaultSettings.profile,
				...doc.data()
			} as ProfileSettings;
		} catch (error) {
			console.error('SettingsService: Failed to get profile settings', error);
			return defaultSettings.profile as ProfileSettings;
		}
	}

	async updateProfileSettings(data: ProfileSettings): Promise<void> {
		const currentDb = this.db;
		if (!currentDb) return;

		try {
			const sanitizedData = sanitizeForFirestore(data);
			await currentDb.collection(this.collection).doc(this.DOC_PROFILE).set(sanitizedData, { merge: true });
		} catch (error) {
			console.error('SettingsService: Failed to update profile settings', error);
			throw error;
		}
	}

	async getResumeSettings(): Promise<ResumeSettings> {
		const currentDb = this.db;
		if (!currentDb) return defaultSettings.resume as ResumeSettings;

		try {
			const doc = await currentDb.collection(this.collection).doc(this.DOC_RESUME).get();
			if (!doc.exists) {
				return defaultSettings.resume as ResumeSettings;
			}
			return {
				...defaultSettings.resume,
				...doc.data()
			} as ResumeSettings;
		} catch (error) {
			console.error('SettingsService: Failed to get resume settings', error);
			return defaultSettings.resume as ResumeSettings;
		}
	}

	async updateResumeSettings(data: Partial<ResumeSettings>): Promise<void> {
		const currentDb = this.db;
		if (!currentDb) return;

		try {
			const sanitizedData = sanitizeForFirestore(data);
			await currentDb
				.collection(this.collection)
				.doc(this.DOC_RESUME)
				.set({ ...sanitizedData, updatedAt: new Date().toISOString() }, { merge: true });
		} catch (error) {
			console.error('SettingsService: Failed to update resume settings', error);
			throw error;
		}
	}
}

export const settingsService = new SettingsService();
