// Mapper functions to convert Prisma models to DTOs
// Clean separation between database layer and API responses

import {
    User,
    Distributor,
    PdfUpload,
    Notification,
    Log,
} from '@prisma/client';
import {
    UserDTO,
    UserListItemDTO,
    UserSessionDTO,
    DistributorDTO,
    DistributorListItemDTO,
    PdfUploadDTO,
    PdfListItemDTO,
    NotificationDTO,
    LogDTO,
    LogListItemDTO,
} from '@/lib/types/dto';

// ============================================
// User Mappers
// ============================================

export function toUserDTO(user: User): UserDTO {
    return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
    };
}

export function toUserListItemDTO(user: User): UserListItemDTO {
    return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
    };
}

export function toUserSessionDTO(user: User): UserSessionDTO {
    return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
    };
}

// ============================================
// Distributor Mappers
// ============================================

export function toDistributorDTO(
    distributor: Distributor & {
        _count?: {
            pdfAssignments: number;
            notifications: number;
        };
    }
): DistributorDTO {
    return {
        id: distributor.id,
        companyName: distributor.companyName,
        email: distributor.email,
        status: distributor.status,
        createdAt: distributor.createdAt.toISOString(),
        stats: {
            pdfCount: distributor._count?.pdfAssignments || 0,
            notificationCount: distributor._count?.notifications || 0,
        },
    };
}

export function toDistributorListItemDTO(
    distributor: Distributor & {
        _count?: {
            pdfAssignments: number;
            notifications: number;
        };
    }
): DistributorListItemDTO {
    return {
        id: distributor.id,
        companyName: distributor.companyName,
        email: distributor.email,
        status: distributor.status,
        createdAt: distributor.createdAt.toISOString(),
        pdfCount: distributor._count?.pdfAssignments || 0,
        notificationCount: distributor._count?.notifications || 0,
    };
}

// ============================================
// PDF Upload Mappers
// ============================================

export function toPdfUploadDTO(
    pdf: PdfUpload & {
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
): PdfUploadDTO {
    return {
        id: pdf.id,
        fileName: pdf.fileName,
        fileUrl: pdf.fileUrl,
        assignedGroup: pdf.assignedGroup,
        status: pdf.status,
        createdAt: pdf.createdAt.toISOString(),
        uploadedBy: {
            id: pdf.uploadedBy.id,
            fullName: pdf.uploadedBy.fullName,
            email: pdf.uploadedBy.email,
        },
        distributor: pdf.distributor
            ? {
                id: pdf.distributor.id,
                companyName: pdf.distributor.companyName,
                email: pdf.distributor.email,
            }
            : null,
    };
}

export function toPdfListItemDTO(
    pdf: PdfUpload & {
        uploadedBy: {
            fullName: string;
        };
        distributor?: {
            companyName: string;
        } | null;
    }
): PdfListItemDTO {
    return {
        id: pdf.id,
        fileName: pdf.fileName,
        assignedGroup: pdf.assignedGroup,
        status: pdf.status,
        createdAt: pdf.createdAt.toISOString(),
        uploadedByName: pdf.uploadedBy.fullName,
        distributorName: pdf.distributor?.companyName || null,
    };
}

// ============================================
// Notification Mappers
// ============================================

export function toNotificationDTO(
    notification: Notification & {
        pdf: {
            id: string;
            fileName: string;
            createdAt: Date;
            uploadedBy: {
                fullName: string;
            };
        };
    }
): NotificationDTO {
    return {
        id: notification.id,
        readFlag: notification.readFlag,
        createdAt: notification.createdAt.toISOString(),
        pdf: {
            id: notification.pdf.id,
            fileName: notification.pdf.fileName,
            createdAt: notification.pdf.createdAt.toISOString(),
            uploadedByName: notification.pdf.uploadedBy.fullName,
        },
    };
}

// ============================================
// Log Mappers
// ============================================

export function toLogDTO(
    log: Log & {
        user: {
            id: string;
            fullName: string;
            email: string;
        };
    }
): LogDTO {
    return {
        id: log.id,
        action: log.action,
        createdAt: log.createdAt.toISOString(),
        user: {
            id: log.user.id,
            fullName: log.user.fullName,
            email: log.user.email,
        },
    };
}

export function toLogListItemDTO(
    log: Log & {
        user: {
            fullName: string;
            email: string;
        };
    }
): LogListItemDTO {
    return {
        id: log.id,
        action: log.action,
        createdAt: log.createdAt.toISOString(),
        userName: log.user.fullName,
        userEmail: log.user.email,
    };
}
