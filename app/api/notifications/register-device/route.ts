/**
 * POST /api/notifications/register-device
 *
 * Authenticated endpoint for mobile applications to register or refresh
 * an FCM device token. The user identity is always taken from the JWT claim
 * — the mobile app NEVER sends a userId in the body.
 *
 * This is the canonical "register device" endpoint described in the
 * requirements. The existing POST /api/devices also works and is kept
 * for backward compatibility.
 *
 * Request body:
 * {
 *   "deviceId":   "unique-hardware-device-id",
 *   "fcmToken":   "firebase-token-string",
 *   "platform":   "android" | "ios" | "web",
 *   "deviceName": "Samsung Galaxy S23",  // optional
 *   "appVersion": "1.0.0"               // optional
 * }
 *
 * Response:
 * { "success": true, "message": "Device registered successfully" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { registerDeviceSchema } from '@/lib/validations/schemas';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ---------------------------------------------------------------------------
// CORS — mobile clients require this on every route
// ---------------------------------------------------------------------------
function getCorsHeaders(origin?: string | null): Record<string, string> {
    return {
        'Access-Control-Allow-Origin':      origin || process.env.NEXT_PUBLIC_APP_URL || '*',
        'Access-Control-Allow-Methods':     'POST, OPTIONS',
        'Access-Control-Allow-Headers':     'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
    };
}

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(request.headers.get('origin')),
    });
}

/** Mask FCM token for safe logging */
function maskToken(token: string): string {
    if (token.length <= 12) return '****';
    return `${token.substring(0, 8)}****${token.substring(token.length - 4)}`;
}

export async function POST(request: NextRequest) {
    const origin     = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);

    try {
        // ─── Authentication ────────────────────────────────────────────────
        // SECURITY: UserId ALWAYS comes from the verified JWT. The mobile app
        // must NEVER pass userId in the request body.
        const session = await getSession();
        if (!session) {
            return new NextResponse(
                JSON.stringify({
                    success: false,
                    error: {
                        code:    'UNAUTHORIZED',
                        message: 'Authentication required. Include Authorization: Bearer <jwt> header.',
                    },
                }),
                { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
            );
        }

        const body = await request.json().catch(() => ({}));

        // ─── Validation ────────────────────────────────────────────────────
        const validation = registerDeviceSchema.safeParse(body);
        if (!validation.success) {
            console.warn(
                '[register-device] Validation failed for userId:', session.userId,
                '| errors:', JSON.stringify(validation.error.errors),
            );
            return new NextResponse(
                JSON.stringify({
                    success: false,
                    error: {
                        code:    'VALIDATION_ERROR',
                        message: 'Invalid request body',
                        details: validation.error.errors,
                    },
                }),
                { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
            );
        }

        const {
            fcmToken,
            token: legacyToken,
            deviceId,
            platform,
            deviceName,
            appVersion,
            deviceInfo,
        } = validation.data;

        const resolvedFcmToken = (fcmToken || legacyToken)!;

        console.log(
            '[register-device]',
            '| userId:', session.userId,
            '| deviceId:', deviceId,
            '| platform:', platform,
            '| fcmToken:', maskToken(resolvedFcmToken),
            '| deviceName:', deviceName ?? '—',
            '| appVersion:', appVersion ?? '—',
        );

        // ─── Race condition: device previously owned by another user ───────
        // If another user was logged in on this physical device and this new
        // user is now logging in, we deactivate the old device association.
        // This prevents User A receiving User B's notifications.
        const previousDevice = await prisma.deviceToken.findFirst({
            where: { deviceId },
        });

        if (previousDevice && previousDevice.userId !== session.userId) {
            console.log(
                '[register-device] DeviceId', deviceId,
                'was owned by userId', previousDevice.userId,
                '— deactivating (phone logged into different account)',
            );
            await prisma.deviceToken.update({
                where: { id: previousDevice.id },
                data:  { isActive: false },
            });
        }

        // ─── Upsert on (userId, deviceId) ─────────────────────────────────
        // This is the stable composite key that represents ONE physical device
        // belonging to ONE user. The FCM token may change but this key stays.
        const now = new Date();
        const deviceToken = await prisma.deviceToken.upsert({
            where: {
                userId_deviceId: {
                    userId:   session.userId,
                    deviceId,
                },
            },
            update: {
                token:      resolvedFcmToken,   // token may have refreshed
                platform,
                isActive:   true,               // reactivate on re-login
                lastUsed:   now,
                ...(deviceName && { deviceName }),
                ...(appVersion && { appVersion }),
                ...(deviceInfo && { deviceInfo }),
            },
            create: {
                userId:     session.userId,
                deviceId,
                token:      resolvedFcmToken,
                platform,
                isActive:   true,
                lastUsed:   now,
                deviceName: deviceName ?? null,
                appVersion: appVersion ?? null,
                deviceInfo: deviceInfo ?? undefined,
            },
        });

        const isNew      = !previousDevice || previousDevice.userId !== session.userId;
        const wasRefresh = previousDevice?.userId === session.userId && previousDevice.token !== resolvedFcmToken;

        if (wasRefresh) {
            console.log('[register-device] FCM token refresh detected for deviceId:', deviceId);
        } else if (isNew) {
            console.log('[register-device] Device registered | id:', deviceToken.id);
        } else {
            console.log('[register-device] Device updated (lastUsed) | id:', deviceToken.id);
        }

        return new NextResponse(
            JSON.stringify({
                success: true,
                message: isNew ? 'Device registered successfully' : 'Device token updated successfully',
                data: {
                    id:        deviceToken.id,
                    deviceId,
                    platform:  deviceToken.platform,
                    isActive:  deviceToken.isActive,
                    lastUsed:  deviceToken.lastUsed.toISOString(),
                },
            }),
            {
                status: isNew ? 201 : 200,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            },
        );
    } catch (error: any) {
        console.error('[register-device] ERROR:', error?.message);
        console.error('[register-device] Prisma code:', error?.code);
        return new NextResponse(
            JSON.stringify({
                success: false,
                error: { code: 'INTERNAL_ERROR', message: error?.message || 'Internal server error' },
            }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
        );
    }
}
