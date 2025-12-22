import { z } from 'zod';

/**
 * Contact form validation schema
 */
export const contactSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name must be less than 100 characters')
        .trim(),

    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address')
        .max(255, 'Email must be less than 255 characters')
        .toLowerCase()
        .trim(),

    message: z
        .string()
        .min(10, 'Message must be at least 10 characters')
        .max(5000, 'Message must be less than 5000 characters')
        .trim(),

    company: z.string().max(100, 'Company name must be less than 100 characters').optional(),

    budget: z.string().max(50, 'Budget must be less than 50 characters').optional()
});

export type ContactInput = z.infer<typeof contactSchema>;

/**
 * Contact update schema (for admin)
 */
export const contactUpdateSchema = z.object({
    id: z.string().min(1, 'Contact ID is required'),
    status: z.enum(['new', 'read', 'replied', 'archived']).optional(),
    notes: z.string().max(1000).optional()
});

export type ContactUpdateInput = z.infer<typeof contactUpdateSchema>;
