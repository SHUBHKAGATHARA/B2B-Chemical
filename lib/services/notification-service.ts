// Notification Service Abstraction
// Prepares for future push notification integration (FCM/APNs)

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
        statusChanges: true,
        systemAlerts: true,
    },
};

// ============================================
// In-App Notification Service
// ============================================

/**
 * Create in-app notification in database
 */
export async function sendInAppNotification(
    pdfId: string,
    distributorId: string
): Promise<void> {
    try {
        await prisma.notification.create({
            data: {
                pdfId,
                distId: distributorId,
                readFlag: false,
            },
        });
    } catch (error) {
        console.error('Failed to create in-app notification:', error);
        throw error;
    }
}

/**
 * Send notification to multiple distributors
 */
export async function sendBulkInAppNotifications(
    pdfId: string,
    distributorIds: string[]
): Promise<void> {
    try {
        await prisma.notification.createMany({
            data: distributorIds.map((distId) => ({
                pdfId,
                distId,
                readFlag: false,
            })),
        });
    } catch (error) {
        console.error('Failed to create bulk notifications:', error);
        throw error;
    }
}

/**
 * Send notification to all distributors
 */
export async function sendNotificationToAll(pdfId: string): Promise<void> {
    try {
        const distributors = await prisma.distributor.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true },
        });

        if (distributors.length === 0) {
            return;
        }

        await sendBulkInAppNotifications(
            pdfId,
            distributors.map((d) => d.id)
        );
    } catch (error) {
        console.error('Failed to send notifications to all:', error);
        throw error;
    }
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
    // For now, just log that we would send a push notification
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
        return {
            success: false,
            error: 'No active device tokens found',
        };
    }

    // Future implementation will:
    // 1. Check user's notification preferences
    // 2. Send to FCM for Android tokens
    // 3. Send to APNs for iOS tokens
    // 4. Handle failures and update token status
    // 5. Return success/failure results

    return {
        success: true,
        messageId: `stub_${Date.now()}`,
    };
}

/**
 * Send push notification to multiple users
 */
export async function sendBulkPushNotifications(
    userIds: string[],
    payload: NotificationPayload
): Promise<PushNotificationResult[]> {
    const results = await Promise.all(
        userIds.map((userId) => sendPushNotification(userId, payload))
    );

    return results;
}

// ============================================
// Unified Notification Service
// ============================================

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

/**
 * Send notification through multiple channels
 * Respects user preferences
 */
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
        // 1. Send in-app notifications
        if (channels.inApp) {
            await sendBulkInAppNotifications(pdfId, distributorIds);
        }

        // 2. Get user IDs for distributors
        if (channels.push || channels.email) {
            const distributors = await prisma.distributor.findMany({
                where: {
                    id: { in: distributorIds },
                },
                select: { email: true },
            });

            const users = await prisma.user.findMany({
                where: {
                    email: { in: distributors.map((d) => d.email) },
                    status: 'ACTIVE',
                },
                select: {
                    id: true,
                    email: true,
                    notificationPreferences: true,
                },
            });

            // 3. Send push notifications
            if (channels.push) {
                const pushEnabledUsers = users.filter((user) => {
                    const prefs = (user.notificationPreferences ||
                        DEFAULT_NOTIFICATION_PREFERENCES) as NotificationPreferences;
                    return prefs.push && prefs.categories.pdfAssignments;
                });

                if (pushEnabledUsers.length > 0) {
                    await sendBulkPushNotifications(
                        pushEnabledUsers.map((u) => u.id),
                        payload
                    );
                }
            }

            // 4. Send email notifications (future)
            if (channels.email) {
                // TODO: Implement email notification service
                console.log('[EMAIL STUB] Would send emails to:', users.length, 'users');
            }
        }
    } catch (error) {
        console.error('Failed to send notification:', error);
        throw error;
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

    return user.notificationPreferences as NotificationPreferences;
}

/**
 * Update user's notification preferences
 */
export async function updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
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
