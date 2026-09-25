/**
 * POST /api/notifications/unregister-device
 *
 * Soft-deactivates a device on logout (sets IsActive = false).
 * Does NOT delete the row — this preserves the device association so
 * the user can simply reactivate it on next login via register-device.
 *
 * Important: Only the CURRENT device is deactivated. Other devices
 * belonging to the same user remain fully active.
 *
 * Request body:
 * {
 *   "deviceId": "unique-hardware-device-id"
 * }
 *
 * Response:
 * { "success": true, "message": "Device deactivated successfully" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

export async function POST(request: NextRequest) {
    const origin      = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);

    try {
        // Authentication — userId always from JWT
        const session = await getSession();
        if (!session) {
            return new NextResponse(
                JSON.stringify({
                    success: false,
                    error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
                }),
                { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
            );
        }

        const body = await request.json().catch(() => ({}));
        const { deviceId, token: legacyToken } = body as { deviceId?: string; token?: string };

        if (!deviceId && !legacyToken) {
            return new NextResponse(
                JSON.stringify({
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: 'deviceId is required in request body.' },
                }),
                { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
            );
        }

        let deactivatedCount = 0;

        if (deviceId) {
            // Preferred: soft-delete by (userId, deviceId)
            const result = await prisma.deviceToken.updateMany({
                where: { userId: session.userId, deviceId },
                data:  { isActive: false, lastUsed: new Date() },
            });
            deactivatedCount = result.count;
            console.log(
                '[unregister-device] Deactivated |',
                'userId:', session.userId,
                '| deviceId:', deviceId,
                '| rows:', deactivatedCount,
            );
        } else if (legacyToken) {
            // Backward compat: deactivate by FCM token
            const result = await prisma.deviceToken.updateMany({
                where: { userId: session.userId, token: legacyToken },
                data:  { isActive: false, lastUsed: new Date() },
            });
            deactivatedCount = result.count;
            console.log(
                '[unregister-device] Deactivated by token |',
                'userId:', session.userId,
                '| rows:', deactivatedCount,
            );
        }

        return new NextResponse(
            JSON.stringify({
                success: true,
                message: 'Device deactivated successfully',
                data:    { deactivatedCount },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
        );
    } catch (error: any) {
        console.error('[unregister-device] ERROR:', error?.message);
        return new NextResponse(
            JSON.stringify({
                success: false,
                error: { code: 'INTERNAL_ERROR', message: error?.message || 'Internal server error' },
            }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
        );
    }
}
