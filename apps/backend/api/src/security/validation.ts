import { z } from 'zod';

// Common validation schemas
export const webinarRegistrationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format').max(255, 'Email too long')
});

export const communityPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  body: z.string().min(1, 'Body is required').max(10000, 'Body too long'),
  tags: z.array(z.string().min(1).max(50)).max(10, 'Too many tags').optional()
});

export const commentSchema = z.object({
  text: z.string().min(1, 'Comment text is required').max(2000, 'Comment too long')
});

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required')
});

export const choiceIndexSchema = z.object({
  choiceIndex: z.number().int().min(0, 'Choice index must be non-negative')
});

export const enrollmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format').max(255, 'Email too long')
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  title: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  skills: z.array(z.string().min(1).max(50)).max(20).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  socials: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    x: z.string().url().optional().or(z.literal(''))
  }).optional()
});

// Validation helper
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Format validation errors
  const errorMessage = result.error.errors
    .map(err => `${err.path.join('.')}: ${err.message}`)
    .join(', ');
  
  return { success: false, error: errorMessage };
}