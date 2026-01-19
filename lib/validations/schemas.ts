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

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateDistributorInput = z.infer<typeof createDistributorSchema>;
export type UpdateDistributorInput = z.infer<typeof updateDistributorSchema>;
export type UploadPdfInput = z.infer<typeof uploadPdfSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;

