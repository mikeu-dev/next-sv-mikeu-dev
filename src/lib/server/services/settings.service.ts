import { db } from '$lib/server/firebase/firebase.server';
import type { GeneralSettings, ProfileSettings, ResumeSettings } from '../schemas/settings.schema';
import { defaultSettings } from '../schemas/settings.schema';
import { sanitizeForFirestore } from '../utils/firestore';
import { dev } from '$app/environment';
import { persistentCache } from '../utils/cache.util';

export class SettingsService {
	private readonly collection = 'settings';

	// Document IDs for organizing settings
	private readonly DOC_GENERAL = 'general';
	private readonly DOC_PROFILE = 'profile';
	private readonly DOC_RESUME = 'resume';

	private get db() {
		return db;
	}

	// In-memory cache
	private static cache: {
		general?: GeneralSettings;
		profile?: ProfileSettings;
		resume?: ResumeSettings;
	} = {};
	private static lastFetch: Record<string, number> = {};
	private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

	async getGeneralSettings(): Promise<GeneralSettings> {
		const now = Date.now();

		// 1. Memory Cache
		if (
			SettingsService.cache.general &&
			now - (SettingsService.lastFetch[this.DOC_GENERAL] || 0) < this.CACHE_TTL
		) {
			return SettingsService.cache.general;
		}

		// 2. Persistent File Cache (Dev only)
		if (dev) {
			const cached = persistentCache.get<GeneralSettings>(`settings_${this.DOC_GENERAL}`);
			if (cached) {
				SettingsService.cache.general = cached;
				SettingsService.lastFetch[this.DOC_GENERAL] = now;
				return cached;
			}
		}

		const currentDb = this.db;
		if (!currentDb) return defaultSettings.general as GeneralSettings;

		try {
			const doc = await currentDb.collection(this.collection).doc(this.DOC_GENERAL).get();
			let data: GeneralSettings;
			if (!doc.exists) {
				data = defaultSettings.general as GeneralSettings;
			} else {
				data = {
					...defaultSettings.general,
					...doc.data()
				} as GeneralSettings;
			}

			// Update caches
			SettingsService.cache.general = data;
			SettingsService.lastFetch[this.DOC_GENERAL] = now;
			if (dev) persistentCache.set(`settings_${this.DOC_GENERAL}`, data);

			return data;
		} catch (error: unknown) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				(error as { code: number }).code === 8
			) {
				console.error('SettingsService: Quota exceeded while fetching general settings');
				return (
					persistentCache.get<GeneralSettings>(`settings_${this.DOC_GENERAL}`) ||
					SettingsService.cache.general ||
					(defaultSettings.general as GeneralSettings)
				);
			}
			console.error('SettingsService: Failed to get general settings', error);
			return defaultSettings.general as GeneralSettings;
		}
	}

	async updateGeneralSettings(data: GeneralSettings): Promise<void> {
		const currentDb = this.db;
		if (!currentDb) return;

		try {
			const sanitizedData = sanitizeForFirestore(data);
			await currentDb
				.collection(this.collection)
				.doc(this.DOC_GENERAL)
				.set(sanitizedData, { merge: true });

			// Invalidate caches
			delete SettingsService.cache.general;
			delete SettingsService.lastFetch[this.DOC_GENERAL];
			if (dev) persistentCache.clear(`settings_${this.DOC_GENERAL}`);
		} catch (error) {
			console.error('SettingsService: Failed to update general settings', error);
			throw error;
		}
	}

	async getProfileSettings(): Promise<ProfileSettings> {
		const now = Date.now();

		// 1. Memory Cache
		if (
			SettingsService.cache.profile &&
			now - (SettingsService.lastFetch[this.DOC_PROFILE] || 0) < this.CACHE_TTL
		) {
			return SettingsService.cache.profile;
		}

		// 2. Persistent File Cache (Dev only)
		if (dev) {
			const cached = persistentCache.get<ProfileSettings>(`settings_${this.DOC_PROFILE}`);
			if (cached) {
				SettingsService.cache.profile = cached;
				SettingsService.lastFetch[this.DOC_PROFILE] = now;
				return cached;
			}
		}

		const currentDb = this.db;
		if (!currentDb) return defaultSettings.profile as ProfileSettings;

		try {
			const doc = await currentDb.collection(this.collection).doc(this.DOC_PROFILE).get();
			let data: ProfileSettings;
			if (!doc.exists) {
				data = defaultSettings.profile as ProfileSettings;
			} else {
				data = {
					...defaultSettings.profile,
					...doc.data()
				} as ProfileSettings;
			}

			// Update caches
			SettingsService.cache.profile = data;
			SettingsService.lastFetch[this.DOC_PROFILE] = now;
			if (dev) persistentCache.set(`settings_${this.DOC_PROFILE}`, data);

			return data;
		} catch (error: unknown) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				(error as { code: number }).code === 8
			) {
				console.error('SettingsService: Quota exceeded while fetching profile settings');
				return (
					persistentCache.get<ProfileSettings>(`settings_${this.DOC_PROFILE}`) ||
					SettingsService.cache.profile ||
					(defaultSettings.profile as ProfileSettings)
				);
			}
			console.error('SettingsService: Failed to get profile settings', error);
			return defaultSettings.profile as ProfileSettings;
		}
	}

	async updateProfileSettings(data: ProfileSettings): Promise<void> {
		const currentDb = this.db;
		if (!currentDb) return;

		try {
			const sanitizedData = sanitizeForFirestore(data);
			await currentDb
				.collection(this.collection)
				.doc(this.DOC_PROFILE)
				.set(sanitizedData, { merge: true });

			// Invalidate caches
			delete SettingsService.cache.profile;
			delete SettingsService.lastFetch[this.DOC_PROFILE];
			if (dev) persistentCache.clear(`settings_${this.DOC_PROFILE}`);
		} catch (error) {
			console.error('SettingsService: Failed to update profile settings', error);
			throw error;
		}
	}

	async getResumeSettings(): Promise<ResumeSettings> {
		const now = Date.now();

		// 1. Memory Cache
		if (
			SettingsService.cache.resume &&
			now - (SettingsService.lastFetch[this.DOC_RESUME] || 0) < this.CACHE_TTL
		) {
			return SettingsService.cache.resume;
		}

		// 2. Persistent File Cache (Dev only)
		if (dev) {
			const cached = persistentCache.get<ResumeSettings>(`settings_${this.DOC_RESUME}`);
			if (cached) {
				SettingsService.cache.resume = cached;
				SettingsService.lastFetch[this.DOC_RESUME] = now;
				return cached;
			}
		}

		const currentDb = this.db;
		if (!currentDb) return defaultSettings.resume as ResumeSettings;

		try {
			const doc = await currentDb.collection(this.collection).doc(this.DOC_RESUME).get();
			let data: ResumeSettings;
			if (!doc.exists) {
				data = defaultSettings.resume as ResumeSettings;
			} else {
				data = {
					...defaultSettings.resume,
					...doc.data()
				} as ResumeSettings;
			}

			// Update caches
			SettingsService.cache.resume = data;
			SettingsService.lastFetch[this.DOC_RESUME] = now;
			if (dev) persistentCache.set(`settings_${this.DOC_RESUME}`, data);

			return data;
		} catch (error: unknown) {
			if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				(error as { code: number }).code === 8
			) {
				console.error('SettingsService: Quota exceeded while fetching resume settings');
				return (
					persistentCache.get<ResumeSettings>(`settings_${this.DOC_RESUME}`) ||
					SettingsService.cache.resume ||
					(defaultSettings.resume as ResumeSettings)
				);
			}
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

			// Invalidate caches
			delete SettingsService.cache.resume;
			delete SettingsService.lastFetch[this.DOC_RESUME];
			if (dev) persistentCache.clear(`settings_${this.DOC_RESUME}`);
		} catch (error) {
			console.error('SettingsService: Failed to update resume settings', error);
			throw error;
		}
	}
}

export const settingsService = new SettingsService();
