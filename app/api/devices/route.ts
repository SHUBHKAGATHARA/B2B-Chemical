import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { registerDeviceSchema, unregisterDeviceSchema } from '@/lib/validations/schemas';
import {
    successResponse,
    ErrorResponses,
    handleApiError,
} from '@/lib/utils/api-response';

// Force dynamic rendering and Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ---------------------------------------------------------------------------
// CORS helpers — mobile apps (Flutter) need these on every route
// NOTE: wildcard '*' cannot be used with credentials. We reflect the origin.
// ---------------------------------------------------------------------------
function getCorsHeaders(requestOrigin?: string | null): Record<string, string> {
    const allowedOrigin =
        requestOrigin ||
        process.env.NEXT_PUBLIC_APP_URL ||
        'http://localhost:3000';
    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
    };
}

/** Mask a FCM token for safe logging: show first 8 and last 4 chars */
function maskToken(token: string): string {
    if (token.length <= 12) return '****';
    return `${token.substring(0, 8)}****${token.substring(token.length - 4)}`;
}

// Handle CORS preflight so Flutter / native HTTP clients don't get blocked
export async function OPTIONS(request: NextRequest) {
    const origin = request.headers.get('origin');
    return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(origin),
    });
}

// ---------------------------------------------------------------------------
// POST /api/devices — Register or update a device FCM token
//
// Key design decisions:
//   • We upsert on (userId, deviceId) — NOT on token.
//     → Same device refreshing its FCM token updates ONE row.
//     → Same user on two phones creates TWO rows.
//   • If another user previously registered the same deviceId,
//     we reassign it to the current authenticated user.
//   • IsActive is always set to true on register (handles re-login after logout).
//   • The FCM token is updated separately if the device already exists
//     and the token has changed.
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
    const origin = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);

    try {
        const session = await getSession();
        if (!session) {
            const authHeader = request.headers.get('authorization');
            console.warn(
                '[POST /api/devices] No session — returning 401.',
                'Authorization header present:', !!authHeader,
                '| Value (first 20 chars):', authHeader?.substring(0, 20) ?? 'none',
            );
            return new NextResponse(
                JSON.stringify({
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Authentication required. Send Authorization: Bearer <token> header.',
                    },
                }),
                { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
            );
        }

        const body = await request.json();
        console.log('[POST /api/devices] Session userId:', session.userId);

        const validation = registerDeviceSchema.safeParse(body);
        if (!validation.success) {
            console.warn('[POST /api/devices] Zod validation FAILED:', JSON.stringify(validation.error.errors));
            return ErrorResponses.validation(
                'Invalid device registration data',
                validation.error.errors
            );
        }

        const { fcmToken, token: legacyToken, deviceId, platform, deviceName, appVersion, deviceInfo } = validation.data;

        // Resolve the actual FCM token (support both field names)
        const resolvedFcmToken = (fcmToken || legacyToken)!;

        console.log(
            '[POST /api/devices] Registering device —',
            '| userId:', session.userId,
            '| deviceId:', deviceId,
            '| platform:', platform,
            '| fcmToken:', maskToken(resolvedFcmToken),
        );

        // -----------------------------------------------------------------
        // Race condition fix: If this deviceId is registered to a DIFFERENT
        // user (e.g. another account logged into the same phone), deactivate
        // the old association. We cannot let User A's device receive User B's
        // notifications after a shared phone re-login.
        // -----------------------------------------------------------------
        const existingByDevice = await prisma.deviceToken.findFirst({
            where: { deviceId },
        });

        if (existingByDevice && existingByDevice.userId !== session.userId) {
            console.log(
                '[POST /api/devices] Device', deviceId,
                'was owned by userId', existingByDevice.userId,
                '— deactivating old association before reassigning to', session.userId,
            );
            await prisma.deviceToken.update({
                where: { id: existingByDevice.id },
                data: { isActive: false },
            });
        }

        // -----------------------------------------------------------------
        // Upsert on (userId, deviceId) — the stable composite key.
        // This handles:
        //   • New device registration → creates row
        //   • FCM token refresh on existing device → updates token
        //   • Re-login after logout → sets isActive = true again
        //   • Redundant call with same token → updates lastUsed only
        // -----------------------------------------------------------------
        const now = new Date();
        const deviceToken = await prisma.deviceToken.upsert({
            where: {
                userId_deviceId: {
                    userId: session.userId,
                    deviceId,
                },
            },
            update: {
                token:      resolvedFcmToken,
                platform,
                isActive:   true,
                lastUsed:   now,
                ...(deviceName   && { deviceName }),
                ...(appVersion   && { appVersion }),
                ...(deviceInfo   && { deviceInfo }),
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

        const isNew = !existingByDevice || existingByDevice.userId !== session.userId;
        const action = isNew ? 'Device registered' : 'Device token updated';

        console.log(
            `[POST /api/devices] ${action} —`,
            '| id:', deviceToken.id,
            '| userId:', deviceToken.userId,
            '| deviceId:', deviceId,
            '| platform:', platform,
        );

        return new NextResponse(
            JSON.stringify({
                success: true,
                data: {
                    deviceToken: {
                        id:        deviceToken.id,
                        deviceId,
                        platform:  deviceToken.platform,
                        isActive:  deviceToken.isActive,
                        lastUsed:  deviceToken.lastUsed.toISOString(),
                    },
                    message: isNew ? 'Device registered successfully' : 'Device token updated successfully',
                },
                meta: { timestamp: new Date().toISOString() },
            }),
            {
                status: isNew ? 201 : 200,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            },
        );
    } catch (error: any) {
        console.error('[POST /api/devices] ERROR:', error?.message || error);
        console.error('[POST /api/devices] Prisma code:', error?.code);
        console.error('[POST /api/devices] Stack:', error?.stack);
        return new NextResponse(
            JSON.stringify({
                success: false,
                error: { code: 'INTERNAL_ERROR', message: error?.message || 'Internal server error' },
            }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
        );
    }
}

// ---------------------------------------------------------------------------
// DELETE /api/devices — Soft-deactivate device on logout
//
// We set IsActive = false instead of deleting the row.
// This prevents accidental loss of other devices belonging to the same user.
// On next login, the POST endpoint reactivates the device.
//
// Accepts:
//   Body JSON: { "deviceId": "...", "token": "..." (optional legacy) }
//   OR Query param: ?token=<fcm_token>  (backward compat with old guide)
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest) {
    const origin = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);

    try {
        const session = await getSession();
        if (!session) {
            return new NextResponse(
                JSON.stringify({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }),
                { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
            );
        }

        // Support JSON body (new) or query param (legacy)
        let deviceId: string | null = null;
        let legacyToken: string | null = null;

        try {
            const body = await request.json();
            deviceId    = body?.deviceId || null;
            legacyToken = body?.token || null;
        } catch {
            // no JSON body — fall through to query param
        }

        if (!deviceId) {
            const { searchParams } = new URL(request.url);
            legacyToken = legacyToken || searchParams.get('token');
        }

        if (!deviceId && !legacyToken) {
            return new NextResponse(
                JSON.stringify({ success: false, error: { code: 'VALIDATION_ERROR', message: 'deviceId (or token) is required' } }),
                { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
            );
        }

        let updatedCount = 0;

        if (deviceId) {
            // Preferred: deactivate by (userId, deviceId)
            const result = await prisma.deviceToken.updateMany({
                where: { userId: session.userId, deviceId },
                data:  { isActive: false, lastUsed: new Date() },
            });
            updatedCount = result.count;
            console.log(
                '[DELETE /api/devices] Deactivated device',
                '| userId:', session.userId,
                '| deviceId:', deviceId,
                '| rows:', updatedCount,
            );
        } else if (legacyToken) {
            // Backward compat: deactivate by token
            const result = await prisma.deviceToken.updateMany({
                where: { userId: session.userId, token: legacyToken },
                data:  { isActive: false, lastUsed: new Date() },
            });
            updatedCount = result.count;
            console.log(
                '[DELETE /api/devices] Deactivated device by token',
                '| userId:', session.userId,
                '| maskedToken:', maskToken(legacyToken),
                '| rows:', updatedCount,
            );
        }

        return new NextResponse(
            JSON.stringify({
                success: true,
                data: { message: 'Device deactivated successfully' },
                meta: { timestamp: new Date().toISOString() },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
        );
    } catch (error: any) {
        console.error('[DELETE /api/devices] ERROR:', error?.message || error);
        return new NextResponse(
            JSON.stringify({ success: false, error: { code: 'INTERNAL_ERROR', message: error?.message || 'Internal server error' } }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
        );
    }
}

// ---------------------------------------------------------------------------
// GET /api/devices — List active devices for the authenticated user
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
    const origin = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);

    try {
        const session = await getSession();
        if (!session) {
            return ErrorResponses.unauthorized();
        }

        const deviceTokens = await prisma.deviceToken.findMany({
            where: {
                userId:   session.userId,
                isActive: true,
            },
            select: {
                id:         true,
                deviceId:   true,
                platform:   true,
                deviceName: true,
                appVersion: true,
                isActive:   true,
                lastUsed:   true,
                createdAt:  true,
            },
            orderBy: { lastUsed: 'desc' },
        });

        return successResponse({
            deviceTokens: deviceTokens.map((dt) => ({
                id:         dt.id,
                deviceId:   dt.deviceId,
                platform:   dt.platform,
                deviceName: dt.deviceName,
                appVersion: dt.appVersion,
                isActive:   dt.isActive,
                lastUsed:   dt.lastUsed.toISOString(),
                createdAt:  dt.createdAt.toISOString(),
            })),
        });
    } catch (error) {
        return handleApiError(error);
    }
}
