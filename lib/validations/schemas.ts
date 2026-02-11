import { z } from 'zod';

export const createUserSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['ADMIN', 'DISTRIBUTOR']),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const updateUserSchema = z.object({
    fullName: z.string().min(2).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional().or(z.literal('')),
    role: z.enum(['ADMIN', 'DISTRIBUTOR']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const createDistributorSchema = z.object({
    companyName: z.string().min(2, 'Company name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updateDistributorSchema = z.object({
    companyName: z.string().min(2).optional(),
    email: z.string().email().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const uploadPdfSchema = z.object({
    assignedGroup: z.enum(['SINGLE', 'MULTIPLE', 'ALL']),
    distributorIds: z.array(z.string()).optional(),
});

// Pagination and filtering schemas
export const paginationSchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Device token schemas
export const registerDeviceSchema = z.object({
    token: z.string().min(10),
    platform: z.enum(['IOS', 'ANDROID']),
    deviceInfo: z.object({
        model: z.string().optional(),
        osVersion: z.string().optional(),
        appVersion: z.string().optional(),
    }).optional(),
});

// Notification preferences schema
export const notificationPreferencesSchema = z.object({
    inApp: z.boolean().optional(),
    push: z.boolean().optional(),
    email: z.boolean().optional(),
    categories: z.object({
        pdfAssignments: z.boolean().optional(),
        statusChanges: z.boolean().optional(),
        systemAlerts: z.boolean().optional(),
    }).optional(),
});

// Alert schemas
export const createAlertSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    message: z.string().min(1, 'Message is required'),
    type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS']).optional().default('INFO'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
    targetAudience: z.enum(['ALL', 'DISTRIBUTORS', 'SPECIFIC']).optional().default('ALL'),
    targetIds: z.array(z.string()).optional(),
    expiresAt: z.string().datetime().optional(),
});

export const updateAlertSchema = z.object({
    title: z.string().min(1).optional(),
    message: z.string().min(1).optional(),
    type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED']).optional(),
    expiresAt: z.string().datetime().optional(),
});

// PDF Category schemas
export const createPdfCategorySchema = z.object({
    name: z.string().min(1, 'Category name is required'),
    description: z.string().optional(),
});

export const updatePdfCategorySchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateDistributorInput = z.infer<typeof createDistributorSchema>;
export type UpdateDistributorInput = z.infer<typeof updateDistributorSchema>;
export type UploadPdfInput = z.infer<typeof uploadPdfSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
export type CreateAlertInput = z.infer<typeof createAlertSchema>;
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
export type CreatePdfCategoryInput = z.infer<typeof createPdfCategorySchema>;
export type UpdatePdfCategoryInput = z.infer<typeof updatePdfCategorySchema>;

