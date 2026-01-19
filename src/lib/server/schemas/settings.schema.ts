import { z } from 'zod';

export const generalSettingsSchema = z.object({
    siteName: z.string().min(1, 'Site name is required').max(100),
    siteUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    theme: z.enum(['light', 'dark', 'system']).default('system'),
});

export type GeneralSettings = z.infer<typeof generalSettingsSchema>;

export const profileSettingsSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(30),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    avatarUrl: z.string().url().optional().or(z.literal('')),
});

export type ProfileSettings = z.infer<typeof profileSettingsSchema>;

export const defaultSettings = {
    general: {
        siteName: 'Next SV Portfolio',
        siteUrl: '',
        theme: 'system'
    },
    profile: {
        username: 'admin',
        bio: '',
        avatarUrl: ''
    }
};
