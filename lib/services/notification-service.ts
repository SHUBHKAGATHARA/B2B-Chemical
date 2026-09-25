// Notification Service Abstraction
// Supports PDF, NEWS, and SYSTEM notification types

import { prisma } from '@/lib/db';
import { initFirebaseAdmin } from '@/lib/firebase-admin';
import { getApps } from 'firebase-admin/app';

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
// Push Notification Service (Real FCM)
// ============================================

/**
 * Send a push notification to a single user via FCM.
 * Fetches ALL active device tokens for that user, sends to every device,
 * and deactivates any stale tokens that FCM reports as invalid.
 *
 * This correctly handles multi-device: if User 123 has Device A, B, C
 * all three receive the notification.
 */
export async function sendPushNotification(
    userId: string,
    payload: NotificationPayload
): Promise<PushNotificationResult> {
    /** Mask FCM token for safe logging */
    const maskToken = (t: string) =>
        t.length > 12 ? `${t.substring(0, 8)}****${t.substring(t.length - 4)}` : '****';

    // 1. Fetch all active device tokens for this user (multi-device support)
    const deviceTokenRows = await prisma.deviceToken.findMany({
        where:  { userId, isActive: true },
        select: { id: true, token: true, deviceId: true, platform: true },
    });

    if (deviceTokenRows.length === 0) {
        console.log(`[PUSH] No active device tokens for userId=${userId}`);
        try {
            await prisma.pushNotificationLog.create({
                data: {
                    userId,
                    title:  payload.title,
                    body:   payload.body,
                    data:   payload.data ?? undefined,
                    status: 'failed',
                    error:  'No active device tokens found',
                },
            });
        } catch (logErr) {
            console.error('[PUSH] Failed to write push log:', logErr);
        }
        return { success: false, error: 'No active device tokens found' };
    }

    console.log(
        `[PUSH] Sending "${payload.title}" to userId=${userId}`,
        `| ${deviceTokenRows.length} device(s):`,
        deviceTokenRows.map((r) => `${r.platform}:${r.deviceId ?? 'legacy'}:${maskToken(r.token)}`).join(', '),
    );

    // 2. Ensure Firebase Admin is initialised
    initFirebaseAdmin();
    if (getApps().length === 0) {
        console.error('[PUSH] Firebase Admin not initialized — cannot send notification');
        return { success: false, error: 'Firebase Admin not initialized' };
    }

    // 3. Send via the shared firebase-admin helper
    //    fcmSendToAllTokens broadcasts to every token in the DB; here we
    //    temporarily narrow it by deactivating other users' tokens, OR we
    //    call the Firebase Messaging API directly for just these tokens.
    //    For simplicity and correctness we use the firebase-admin messaging API directly.
    const { getMessaging } = await import('firebase-admin/messaging');
    const tokens = deviceTokenRows.map((r) => r.token);

    // Stringify data values — FCM requires Record<string, string>
    const stringData: Record<string, string> = {};
    if (payload.data) {
        for (const [k, v] of Object.entries(payload.data)) {
            stringData[k] = String(v);
        }
    }

    let fcmResult: { success: boolean; messageId?: string; error?: string };
    try {
        const response = await getMessaging().sendEachForMulticast({
            tokens,
            notification: { title: payload.title, body: payload.body },
            data: stringData,
            android: { priority: 'high' },
            apns: { payload: { aps: { sound: 'default', badge: 1 } } },
        });

        // Deactivate tokens that FCM says are invalid
        const invalidTokenIds: string[] = [];
        response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                const code = resp.error?.code || '';
                if (
                    code === 'messaging/invalid-registration-token' ||
                    code === 'messaging/registration-token-not-registered'
                ) {
                    invalidTokenIds.push(deviceTokenRows[idx].id);
                }
                console.warn(`[PUSH] FCM error for token[${idx}]:`, code, resp.error?.message);
            }
        });

        if (invalidTokenIds.length > 0) {
            await prisma.deviceToken.updateMany({
                where: { id: { in: invalidTokenIds } },
                data: { isActive: false },
            });
            console.log(`[PUSH] Deactivated ${invalidTokenIds.length} stale token(s) for user ${userId}`);
        }

        const successCount = response.successCount;
        fcmResult = successCount > 0
            ? { success: true, messageId: `fcm_${Date.now()}` }
            : { success: false, error: `All ${tokens.length} token(s) failed` };
    } catch (err: any) {
        console.error('[PUSH] FCM sendEachForMulticast error:', err.message || err);
        fcmResult = { success: false, error: err.message || 'FCM error' };
    }

    // 4. Write audit log
    try {
        await prisma.pushNotificationLog.create({
            data: {
                userId,
                title: payload.title,
                body: payload.body,
                data: payload.data ?? undefined,
                status: fcmResult.success ? 'success' : 'failed',
                error: fcmResult.error ?? null,
            },
        });
    } catch (logErr) {
        console.error('[PUSH] Failed to write push log:', logErr);
    }

    return fcmResult;
}

/**
 * Send push notification to multiple users — does NOT throw on failure.
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
