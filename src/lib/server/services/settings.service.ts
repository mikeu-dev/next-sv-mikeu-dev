import { db } from '$lib/server/firebase/firebase.server';
import type { GeneralSettings, ProfileSettings } from '../schemas/settings.schema';
import { defaultSettings } from '../schemas/settings.schema';

export class SettingsService {
    private readonly collection = 'settings';

    // Document IDs for organizing settings
    private readonly DOC_GENERAL = 'general';
    private readonly DOC_PROFILE = 'profile';

    async getGeneralSettings(): Promise<GeneralSettings> {
        try {
            const doc = await db.collection(this.collection).doc(this.DOC_GENERAL).get();
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
        try {
            await db.collection(this.collection).doc(this.DOC_GENERAL).set(data, { merge: true });
        } catch (error) {
            console.error('SettingsService: Failed to update general settings', error);
            throw error;
        }
    }

    async getProfileSettings(): Promise<ProfileSettings> {
        try {
            const doc = await db.collection(this.collection).doc(this.DOC_PROFILE).get();
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
        try {
            await db.collection(this.collection).doc(this.DOC_PROFILE).set(data, { merge: true });
        } catch (error) {
            console.error('SettingsService: Failed to update profile settings', error);
            throw error;
        }
    }
}

export const settingsService = new SettingsService();
