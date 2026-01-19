import { z } from 'zod';

/**
 * Project creation/update validation schema
 */
export const projectSchema = z.object({
	title_id: z.string().min(1, 'Judul (ID) wajib diisi').max(200),
	title_en: z.string().min(1, 'Title (EN) is required').max(200),

	description_id: z.string().min(1, 'Deskripsi (ID) wajib diisi').max(2000),
	description_en: z.string().min(1, 'Description (EN) is required').max(2000),

	slug: z
		.string()
		.min(1, 'Slug is required')
		.max(200, 'Slug must be less than 200 characters')
		.regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
		.trim(),

	content: z.string().optional(),

	thumbnailUrl: z.string().url('Thumbnail must be a valid URL').optional().or(z.literal('')),

	imagesUrl: z.array(z.string().url('Image must be a valid URL')).optional(),

	repoUrl: z.string().url('GitHub URL must be valid').optional().or(z.literal('')),

	demoUrl: z.string().url('Demo URL must be valid').optional().or(z.literal('')),

	published: z.boolean().optional().default(false),

	pinned: z.boolean().optional().default(false),

	tags: z.array(z.any()).optional(), // Support Tag[] | SerializedTag[]

	updatedAt: z.any().optional(), // Allow passing dates or strings
	createdAt: z.any().optional()
});

export type ProjectInput = z.infer<typeof projectSchema>;

/**
 * Project update schema (partial)
 */
export const projectUpdateSchema = projectSchema.partial().extend({
	id: z.string().min(1, 'Project ID is required')
});

export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
