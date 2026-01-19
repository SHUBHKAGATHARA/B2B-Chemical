// Data Transfer Objects (DTOs) for API responses
// These ensure clean separation between database models and API contracts

import { Role, Status, AssignType, PdfStatus } from '@prisma/client';

// ============================================
// Pagination & Common Types
// ============================================

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    meta?: {
        timestamp: string;
        requestId?: string;
    };
}

export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
        field?: string;
    };
    meta: {
        timestamp: string;
        requestId?: string;
    };
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: PaginationMeta;
    meta: {
        timestamp: string;
    };
}

// ============================================
// Auth DTOs
// ============================================

export interface LoginResponseDTO {
    user: UserSessionDTO;
    token?: {
        expiresAt: string;
        type: string;
    };
}

export interface UserSessionDTO {
    id: string;
    fullName: string;
    email: string;
    role: Role;
    status: Status;
    lastLogin?: string | null;
}

// ============================================
// User DTOs
// ============================================

export interface UserDTO {
    id: string;
    fullName: string;
    email: string;
    role: Role;
    status: Status;
    createdAt: string;
    lastLogin: string | null;
}

export interface UserListItemDTO {
    id: string;
    fullName: string;
    email: string;
    role: Role;
    status: Status;
    createdAt: string;
    lastLogin: string | null;
}

export interface CreateUserResponseDTO {
    user: UserDTO;
}

export interface UpdateUserResponseDTO {
    user: UserDTO;
}

// ============================================
// Distributor DTOs
// ============================================

export interface DistributorDTO {
    id: string;
    companyName: string;
    email: string;
    status: Status;
    createdAt: string;
    stats: {
        pdfCount: number;
        notificationCount: number;
        unreadNotificationCount?: number;
    };
}

export interface DistributorListItemDTO {
    id: string;
    companyName: string;
    email: string;
    status: Status;
    createdAt: string;
    pdfCount: number;
    notificationCount: number;
}

export interface CreateDistributorResponseDTO {
    distributor: DistributorDTO;
}

// ============================================
// PDF/Upload DTOs
// ============================================

export interface PdfUploadDTO {
    id: string;
    fileName: string;
    fileUrl: string;
    assignedGroup: AssignType;
    status: PdfStatus;
    createdAt: string;
    uploadedBy: {
        id: string;
        fullName: string;
        email: string;
    };
    distributor?: {
        id: string;
        companyName: string;
        email: string;
    } | null;
}

export interface PdfListItemDTO {
    id: string;
    fileName: string;
    assignedGroup: AssignType;
    status: PdfStatus;
    createdAt: string;
    uploadedByName: string;
    distributorName?: string | null;
}

export interface PdfUploadResponseDTO {
    pdf: PdfUploadDTO;
    assignedCount?: number;
}

export interface PdfDownloadDTO {
    fileName: string;
    fileUrl: string;
    contentType: string;
}

// ============================================
// Notification DTOs
// ============================================

export interface NotificationDTO {
    id: string;
    readFlag: boolean;
    createdAt: string;
    pdf: {
        id: string;
        fileName: string;
        createdAt: string;
        uploadedByName: string;
    };
}

export interface NotificationSummaryDTO {
    total: number;
    unread: number;
    notifications: NotificationDTO[];
}

export interface NotificationPreferencesDTO {
    inApp: boolean;
    push: boolean;
    email: boolean;
    categories: {
        pdfAssignments: boolean;
        statusChanges: boolean;
        systemAlerts: boolean;
    };
}

// ============================================
// Device Token DTOs (for push notifications)
// ============================================

export interface DeviceTokenDTO {
    id: string;
    platform: 'IOS' | 'ANDROID';
    token: string;
    isActive: boolean;
    lastUsed: string;
}

export interface RegisterDeviceRequestDTO {
    token: string;
    platform: 'IOS' | 'ANDROID';
    deviceInfo?: {
        model?: string;
        osVersion?: string;
        appVersion?: string;
    };
}

// ============================================
// Log DTOs
// ============================================

export interface LogDTO {
    id: string;
    action: string;
    createdAt: string;
    user: {
        id: string;
        fullName: string;
        email: string;
    };
}

export interface LogListItemDTO {
    id: string;
    action: string;
    createdAt: string;
    userName: string;
    userEmail: string;
}
