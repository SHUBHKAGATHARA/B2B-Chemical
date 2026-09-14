// Notification Service Abstraction
// Supports PDF, NEWS, and SYSTEM notification types

import { prisma } from '@/lib/db';

// ============================================
// Types
// ============================================

export interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, any>;
    imageUrl?: string;
}

export interface PushNotificationResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

export interface NotificationPreferences {
    inApp: boolean;
    push: boolean;
    email: boolean;
    categories: {
        pdfAssignments: boolean;
        newsUpdates: boolean;
        statusChanges: boolean;
        systemAlerts: boolean;
    };
}

// ============================================
// Default Preferences
// ============================================

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
    inApp: true,
    push: true,
    email: true,
    categories: {
        pdfAssignments: true,
        newsUpdates: true,
        statusChanges: true,
        systemAlerts: true,
    },
};

// ============================================
// PDF Notification Creators
// ============================================

/**
 * Create a single PDF in-app notification for one distributor
 */
export async function createPdfNotification(
    pdfId: string,
    distributorId: string,
    pdfFileName: string,
    categoryName?: string
): Promise<void> {
    try {
        const title = 'New Document Received';
        const message = categoryName
            ? `${pdfFileName} (${categoryName}) has been shared with your company.`
            : `${pdfFileName} has been shared with your company.`;

        await prisma.notification.create({
            data: {
                distId: distributorId,
                type: 'PDF',
                title,
                message,
                pdfId,
                readFlag: false,
            },
        });
    } catch (error) {
        console.error('[NotificationService] Failed to create PDF notification:', error);
        throw error;
    }
}

/**
 * Create PDF notifications for multiple distributors in one batch
 */
export async function createBulkPdfNotifications(
    pdfId: string,
    distributorIds: string[],
    pdfFileName: string,
    categoryName?: string
): Promise<void> {
    if (distributorIds.length === 0) return;

    try {
        const title = 'New Document Received';
        const message = categoryName
            ? `${pdfFileName} (${categoryName}) has been shared with your company.`
            : `${pdfFileName} has been shared with your company.`;

        await prisma.notification.createMany({
            data: distributorIds.map((distId) => ({
                distId,
                type: 'PDF' as const,
                title,
                message,
                pdfId,
                readFlag: false,
            })),
        });
    } catch (error) {
        console.error('[NotificationService] Failed to create bulk PDF notifications:', error);
        throw error;
    }
}

/**
 * Create PDF notifications for ALL active distributors
 */
export async function createPdfNotificationsForAll(
    pdfId: string,
    pdfFileName: string,
    categoryName?: string
): Promise<void> {
    try {
        const distributors = await prisma.distributor.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true },
        });

        if (distributors.length === 0) return;

        await createBulkPdfNotifications(
            pdfId,
            distributors.map((d) => d.id),
            pdfFileName,
            categoryName
        );
    } catch (error) {
        console.error('[NotificationService] Failed to create PDF notifications for all:', error);
        throw error;
    }
}

// ============================================
// News Notification Creators
// ============================================

/**
 * Create a NEWS notification for a single distributor
 */
export async function createNewsNotification(
    newsId: string,
    distributorId: string,
    newsTitle: string,
    excerpt?: string
): Promise<void> {
    try {
        const title = 'New Industry Update';
        const truncated = excerpt
            ? excerpt.length > 120
                ? excerpt.substring(0, 117) + '...'
                : excerpt
            : `A new article has been published: ${newsTitle}`;

        await prisma.notification.create({
            data: {
                distId: distributorId,
                type: 'NEWS',
                title,
                message: truncated,
                newsId,
                readFlag: false,
            },
        });
    } catch (error) {
        console.error('[NotificationService] Failed to create NEWS notification:', error);
        throw error;
    }
}

/**
 * Create NEWS notifications for multiple distributors in one batch
 */
export async function createBulkNewsNotifications(
    newsId: string,
    distributorIds: string[],
    newsTitle: string,
    excerpt?: string
): Promise<void> {
    if (distributorIds.length === 0) return;

    try {
        const title = 'New Industry Update';
        const message = excerpt
            ? excerpt.length > 120
                ? excerpt.substring(0, 117) + '...'
                : excerpt
            : `A new article has been published: ${newsTitle}`;

        await prisma.notification.createMany({
            data: distributorIds.map((distId) => ({
                distId,
                type: 'NEWS' as const,
                title,
                message,
                newsId,
                readFlag: false,
            })),
        });
    } catch (error) {
        console.error('[NotificationService] Failed to create bulk NEWS notifications:', error);
        throw error;
    }
}

/**
 * Create NEWS notifications for ALL active distributors
 */
export async function createNewsNotificationsForAll(
    newsId: string,
    newsTitle: string,
    excerpt?: string
): Promise<void> {
    try {
        const distributors = await prisma.distributor.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true },
        });

        if (distributors.length === 0) return;

        await createBulkNewsNotifications(
            newsId,
            distributors.map((d) => d.id),
            newsTitle,
            excerpt
        );
    } catch (error) {
        console.error('[NotificationService] Failed to create NEWS notifications for all:', error);
        throw error;
    }
}

// ============================================
// Legacy compatibility wrappers
// (kept for any existing callers)
// ============================================

/** @deprecated Use createPdfNotification instead */
export async function sendInAppNotification(
    pdfId: string,
    distributorId: string
): Promise<void> {
    return createPdfNotification(pdfId, distributorId, 'Document');
}

/** @deprecated Use createBulkPdfNotifications instead */
export async function sendBulkInAppNotifications(
    pdfId: string,
    distributorIds: string[]
): Promise<void> {
    return createBulkPdfNotifications(pdfId, distributorIds, 'Document');
}

/** @deprecated Use createPdfNotificationsForAll instead */
export async function sendNotificationToAll(pdfId: string): Promise<void> {
    return createPdfNotificationsForAll(pdfId, 'Document');
}

// ============================================
// Push Notification Service (Stub for Future)
// ============================================

/**
 * Send push notification via FCM/APNs
 * This is a stub that will be implemented when mobile apps are ready
 */
export async function sendPushNotification(
    userId: string,
    payload: NotificationPayload
): Promise<PushNotificationResult> {
    // TODO: Implement FCM/APNs integration
    console.log('[PUSH STUB] Would send push notification:', {
        userId,
        payload,
    });

    // Get user's device tokens
    const deviceTokens = await prisma.deviceToken.findMany({
        where: {
            userId,
            isActive: true,
        },
    });

    if (deviceTokens.length === 0) {
        // Log the attempt
        try {
            await prisma.pushNotificationLog.create({
                data: {
                    userId,
                    title: payload.title,
                    body: payload.body,
                    data: payload.data ?? undefined,
                    status: 'failed',
                    error: 'No active device tokens found',
                },
            });
        } catch (logError) {
            console.error('[PUSH] Failed to log push notification attempt:', logError);
        }

        return {
            success: false,
            error: 'No active device tokens found',
        };
    }

    // Log success (stub — not actually sent)
    try {
        await prisma.pushNotificationLog.create({
            data: {
                userId,
                title: payload.title,
                body: payload.body,
                data: payload.data ?? undefined,
                status: 'success',
            },
        });
    } catch (logError) {
        console.error('[PUSH] Failed to log push notification:', logError);
    }

    return {
        success: true,
        messageId: `stub_${Date.now()}`,
    };
}

/**
 * Send push notification to multiple users — does NOT throw on failure
 */
export async function sendBulkPushNotifications(
    userIds: string[],
    payload: NotificationPayload
): Promise<PushNotificationResult[]> {
    const results = await Promise.allSettled(
        userIds.map((userId) => sendPushNotification(userId, payload))
    );

    return results.map((r) =>
        r.status === 'fulfilled' ? r.value : { success: false, error: String(r.reason) }
    );
}

/**
 * Attempt push notifications for distributors after PDF assignment.
 * Does NOT throw — push failure must not break core PDF operations.
 */
export async function attemptPdfPushNotifications(
    distributorIds: string[],
    pdfFileName: string,
    categoryName?: string
): Promise<void> {
    try {
        // Find user accounts linked to these distributors
        const distributors = await prisma.distributor.findMany({
            where: { id: { in: distributorIds } },
            select: { email: true },
        });

        const users = await prisma.user.findMany({
            where: {
                email: { in: distributors.map((d) => d.email) },
                status: 'ACTIVE',
            },
            select: { id: true, notificationPreferences: true },
        });

        const pushEnabledUsers = users.filter((user) => {
            const prefs = (user.notificationPreferences ||
                DEFAULT_NOTIFICATION_PREFERENCES) as NotificationPreferences;
            return prefs.push && prefs.categories.pdfAssignments;
        });

        if (pushEnabledUsers.length > 0) {
            await sendBulkPushNotifications(
                pushEnabledUsers.map((u) => u.id),
                {
                    title: 'New Document Received',
                    body: categoryName
                        ? `${pdfFileName} (${categoryName}) has been shared with you.`
                        : `${pdfFileName} has been shared with you.`,
                    data: { type: 'PDF' },
                }
            );
        }
    } catch (error) {
        // Intentionally swallow — push failure must not break PDF operations
        console.error('[PUSH] attemptPdfPushNotifications failed (non-fatal):', error);
    }
}

/**
 * Attempt push notifications for all distributors after news publish.
 * Does NOT throw — push failure must not break news operations.
 */
export async function attemptNewsPushNotifications(
    newsId: string,
    newsTitle: string
): Promise<void> {
    try {
        const distributors = await prisma.distributor.findMany({
            where: { status: 'ACTIVE' },
            select: { email: true },
        });

        const users = await prisma.user.findMany({
            where: {
                email: { in: distributors.map((d) => d.email) },
                status: 'ACTIVE',
            },
            select: { id: true, notificationPreferences: true },
        });

        const pushEnabledUsers = users.filter((user) => {
            const prefs = (user.notificationPreferences ||
                DEFAULT_NOTIFICATION_PREFERENCES) as NotificationPreferences;
            return prefs.push && prefs.categories.newsUpdates;
        });

        if (pushEnabledUsers.length > 0) {
            await sendBulkPushNotifications(
                pushEnabledUsers.map((u) => u.id),
                {
                    title: 'New Industry Update',
                    body: `A new article has been published: ${newsTitle}`,
                    data: { type: 'NEWS', newsId },
                }
            );
        }
    } catch (error) {
        // Intentionally swallow — push failure must not break news operations
        console.error('[PUSH] attemptNewsPushNotifications failed (non-fatal):', error);
    }
}

// ============================================
// Notification Preference Management
// ============================================

/**
 * Get user's notification preferences
 */
export async function getNotificationPreferences(
    userId: string
): Promise<NotificationPreferences> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { notificationPreferences: true },
    });

    if (!user || !user.notificationPreferences) {
        return DEFAULT_NOTIFICATION_PREFERENCES;
    }

    return user.notificationPreferences as unknown as NotificationPreferences;
}

/**
 * Update user's notification preferences
 */
export async function updateNotificationPreferences(
    userId: string,
    preferences: Partial<Omit<NotificationPreferences, 'categories'>> & {
        categories?: Partial<NotificationPreferences['categories']>;
    }
): Promise<NotificationPreferences> {
    const current = await getNotificationPreferences(userId);
    const updated = {
        ...current,
        ...preferences,
        categories: {
            ...current.categories,
            ...(preferences.categories || {}),
        },
    };

    await prisma.user.update({
        where: { id: userId },
        data: {
            notificationPreferences: updated,
        },
    });

    return updated;
}

// Unified legacy interface kept for backward compat
export interface SendNotificationOptions {
    pdfId: string;
    distributorIds: string[];
    payload: NotificationPayload;
    channels?: {
        inApp?: boolean;
        push?: boolean;
        email?: boolean;
    };
}

/** @deprecated Use createBulkPdfNotifications + attemptPdfPushNotifications separately */
export async function sendNotification(
    options: SendNotificationOptions
): Promise<void> {
    const {
        pdfId,
        distributorIds,
        payload,
        channels = { inApp: true, push: true, email: false },
    } = options;

    try {
        if (channels.inApp) {
            await createBulkPdfNotifications(pdfId, distributorIds, payload.body);
        }

        if (channels.push) {
            await attemptPdfPushNotifications(distributorIds, payload.body);
        }

        if (channels.email) {
            console.log('[EMAIL STUB] Would send emails to:', distributorIds.length, 'distributors');
        }
    } catch (error) {
        console.error('[NotificationService] sendNotification failed:', error);
        throw error;
    }
}
