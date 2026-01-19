import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { settingsService } from '$lib/server/services/settings.service';
import { generalSettingsSchema, profileSettingsSchema } from '$lib/server/schemas/settings.schema';

export const load: PageServerLoad = async () => {
    return {
        general: await settingsService.getGeneralSettings(),
        profile: await settingsService.getProfileSettings()
    };
};

export const actions: Actions = {
    saveGeneral: async ({ request }) => {
        const formData = await request.formData();
        const data = Object.fromEntries(formData);

        const result = generalSettingsSchema.safeParse(data);

        if (!result.success) {
            return fail(400, {
                type: 'general',
                data,
                errors: result.error.flatten().fieldErrors
            });
        }

        try {
            await settingsService.updateGeneralSettings(result.data);
            return {
                type: 'general',
                success: true,
                message: 'General settings updated successfully'
            };
        } catch (error) {
            console.error('Action saveGeneral failed:', error);
            return fail(500, {
                type: 'general',
                data,
                message: 'Failed to update settings'
            });
        }
    },

    saveProfile: async ({ request }) => {
        const formData = await request.formData();
        const data = Object.fromEntries(formData);

        const result = profileSettingsSchema.safeParse(data);

        if (!result.success) {
            return fail(400, {
                type: 'profile',
                data,
                errors: result.error.flatten().fieldErrors
            });
        }

        try {
            await settingsService.updateProfileSettings(result.data);
            return {
                type: 'profile',
                success: true,
                message: 'Profile settings updated successfully'
            };
        } catch (error) {
            console.error('Action saveProfile failed:', error);
            return fail(500, {
                type: 'profile',
                data,
                message: 'Failed to update profile'
            });
        }
    }
};
