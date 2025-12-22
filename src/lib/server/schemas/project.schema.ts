import { z } from 'zod';

/**
 * Project creation/update validation schema
 */
export const projectSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(200, 'Title must be less than 200 characters')
        .trim(),

    slug: z
        .string()
        .min(1, 'Slug is required')
        .max(200, 'Slug must be less than 200 characters')
        .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
        .trim(),

    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(1000, 'Description must be less than 1000 characters')
        .trim(),

    content: z.string().min(1, 'Content is required'),

    thumbnail: z.string().url('Thumbnail must be a valid URL').optional(),

    images: z.array(z.string().url('Image must be a valid URL')).optional(),

    tags: z.array(z.string().max(50)).max(20, 'Maximum 20 tags allowed').optional(),

    technologies: z.array(z.string().max(50)).max(30, 'Maximum 30 technologies allowed').optional(),

    githubUrl: z.string().url('GitHub URL must be valid').optional().or(z.literal('')),

    liveUrl: z.string().url('Live URL must be valid').optional().or(z.literal('')),

    featured: z.boolean().optional().default(false),

    published: z.boolean().optional().default(true),

    publishedAt: z.string().datetime().optional(),

    category: z
        .enum(['web', 'mobile', 'desktop', 'library', 'other'])
        .optional()
        .default('web'),

    status: z.enum(['planning', 'in-progress', 'completed', 'archived']).optional().default('completed')
});

export type ProjectInput = z.infer<typeof projectSchema>;

/**
 * Project update schema (partial)
 */
export const projectUpdateSchema = projectSchema.partial().extend({
    id: z.string().min(1, 'Project ID is required')
});

export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
