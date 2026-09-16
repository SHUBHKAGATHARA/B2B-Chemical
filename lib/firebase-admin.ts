import { initializeApp, getApps, cert, App, ServiceAccount } from 'firebase-admin/app';
import { getMessaging, MulticastMessage, SendResponse } from 'firebase-admin/messaging';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/db';

let firebaseApp: App | null = null;

/**
 * Initialize Firebase Admin SDK (Singleton pattern for Next.js / Vercel Serverless)
 */
export function initFirebaseAdmin(): App | null {
    const existingApps = getApps();
    if (existingApps.length > 0) {
        firebaseApp = existingApps[0];
        return firebaseApp;
    }

    let credential = null;

    // 1. Check for FIREBASE_SERVICE_ACCOUNT_KEY environment variable (Vercel Production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
            const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
            const parsed = (typeof rawKey === 'string' ? JSON.parse(rawKey) : rawKey) as ServiceAccount;
            credential = cert(parsed);
        } catch (error) {
            console.error('[Firebase Admin] Error parsing FIREBASE_SERVICE_ACCOUNT_KEY env var:', error);
        }
    }

    // 2. Check for service-account.json file in project root (Local Development)
    if (!credential) {
        try {
            const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
            if (fs.existsSync(serviceAccountPath)) {
                const rawFile = fs.readFileSync(serviceAccountPath, 'utf8');
                const parsed = JSON.parse(rawFile) as ServiceAccount;
                credential = cert(parsed);
            }
        } catch (error) {
            console.error('[Firebase Admin] Error loading service-account.json file:', error);
        }
    }

    // 3. Fallback to individual Firebase environment variables if available
    if (
        !credential &&
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY
    ) {
        try {
            credential = cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            });
        } catch (error) {
            console.error('[Firebase Admin] Error initializing with individual env vars:', error);
        }
    }

    if (credential) {
        firebaseApp = initializeApp({
            credential,
        });
        console.log('[Firebase Admin] Initialized successfully');
    } else {
        console.warn('[Firebase Admin] Warning: No service account credentials found. Push notifications may fail.');
    }

    return firebaseApp;
}

// Compatibility wrapper providing admin.messaging() API
export const admin = {
    get apps() {
        return getApps();
    },
    messaging: (app?: App) => (app ? getMessaging(app) : getMessaging()),
};

/**
 * Send push notification to all active device tokens stored in database
 * @param title Notification title
 * @param body Notification body text
 * @param data Optional payload data for Flutter app handling
 */
export async function sendPushNotification(
    title: string,
    body: string,
    data?: Record<string, string>
) {
    try {
        initFirebaseAdmin();

        const apps = getApps();
        if (apps.length === 0) {
            console.error('[FCM] Firebase Admin is not initialized. Cannot send notification.');
            return { success: false, error: 'Firebase Admin not initialized' };
        }

        // Fetch all active device tokens from database
        const deviceTokens = await prisma.deviceToken.findMany({
            where: { isActive: true },
            select: { token: true },
        });

        if (!deviceTokens || deviceTokens.length === 0) {
            console.log('[FCM] No active device tokens found in database.');
            return { success: true, count: 0, message: 'No active device tokens found' };
        }

        // Deduplicate tokens
        const tokens = Array.from(new Set(deviceTokens.map((d) => d.token).filter(Boolean)));

        console.log(`[FCM] Sending push notification to ${tokens.length} device(s): "${title}"`);

        // Firebase sendEachForMulticast accepts max 500 tokens per call
        const batchSize = 500;
        let totalSuccess = 0;
        let totalFailure = 0;
        const invalidTokens: string[] = [];

        for (let i = 0; i < tokens.length; i += batchSize) {
            const batch = tokens.slice(i, i + batchSize);

            const message: MulticastMessage = {
                tokens: batch,
                notification: {
                    title,
                    body,
                },
                data: {
                    click_action: 'FLUTTER_NOTIFICATION_CLICK',
                    ...(data || {}),
                },
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        channelId: 'default',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                },
            };

            // Using admin.messaging().sendEachForMulticast(message)
            const response = await admin.messaging().sendEachForMulticast(message);
            totalSuccess += response.successCount;
            totalFailure += response.failureCount;

            // Collect invalid / unregistered tokens to deactivate them
            response.responses.forEach((resp: SendResponse, idx: number) => {
                if (!resp.success && resp.error) {
                    const code = resp.error.code;
                    if (
                        code === 'messaging/invalid-registration-token' ||
                        code === 'messaging/registration-token-not-registered'
                    ) {
                        invalidTokens.push(batch[idx]);
                    }
                }
            });
        }

        // Cleanup: deactivate stale/invalid tokens in background
        if (invalidTokens.length > 0) {
            prisma.deviceToken
                .updateMany({
                    where: { token: { in: invalidTokens } },
                    data: { isActive: false },
                })
                .catch((err) => {
                    console.error('[FCM] Error deactivating stale tokens:', err);
                });
        }

        console.log(`[FCM] Push notifications sent. Success: ${totalSuccess}, Failures: ${totalFailure}`);
        return {
            success: true,
            totalSuccess,
            totalFailure,
        };
    } catch (error: any) {
        console.error('[FCM] Error in sendPushNotification:', error);
        return {
            success: false,
            error: error.message || 'Unknown error occurred while sending push notifications',
        };
    }
}

export default admin;
