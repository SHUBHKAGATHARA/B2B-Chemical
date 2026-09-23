import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import { registerDeviceSchema } from '@/lib/validations/schemas';
import {
    successResponse,
    ErrorResponses,
    handleApiError,
} from '@/lib/utils/api-response';

// Force dynamic rendering and Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// POST - Register device token for push notifications
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            console.warn('[POST /api/devices] No session — returning 401');
            return ErrorResponses.unauthorized();
        }

        const body = await request.json();
        console.log('[POST /api/devices] Body received:', JSON.stringify(body));
        console.log('[POST /api/devices] Session userId:', session.userId);

        // Validate input
        const validation = registerDeviceSchema.safeParse(body);
        if (!validation.success) {
            console.warn('[POST /api/devices] Zod validation FAILED:', JSON.stringify(validation.error.errors));
            return ErrorResponses.validation(
                'Invalid device registration data',
                validation.error.errors
            );
        }

        const { token, platform, deviceInfo } = validation.data;
        console.log('[POST /api/devices] Validated — token length:', token.length, '| platform:', platform);

        // Upsert: if this exact token already belongs to this user → update it.
        // If it belongs to a DIFFERENT user (e.g. shared test token) → delete old, create new.
        // This fixes the bug where GET /api/devices returned [] because the token was
        // stored under a different userId after being "updated" by the old code.
        const existingToken = await prisma.deviceToken.findUnique({
            where: { token },
        });

        if (existingToken) {
            if (existingToken.userId !== session.userId) {
                // Token was registered by a different user — delete it so we can re-create
                // under the current user. (Common with test tokens like "fcm_token_here")
                console.log('[POST /api/devices] Token belongs to different user — reassigning to current user');
                await prisma.deviceToken.delete({ where: { token } });
            }
        }

        // Upsert for the current user (create or update)
        const deviceToken = await prisma.deviceToken.upsert({
            where: { token },
            update: {
                userId: session.userId,
                platform,
                isActive: true,
                deviceInfo: deviceInfo ?? undefined,
                lastUsed: new Date(),
            },
            create: {
                userId: session.userId,
                token,
                platform,
                isActive: true,
                deviceInfo: deviceInfo ?? undefined,
            },
        });

        console.log('[POST /api/devices] Token saved — id:', deviceToken.id, '| userId:', deviceToken.userId);

        const isNew = !existingToken || existingToken.userId !== session.userId;
        return successResponse(
            {
                deviceToken: {
                    id: deviceToken.id,
                    platform: deviceToken.platform,
                    isActive: deviceToken.isActive,
                    lastUsed: deviceToken.lastUsed.toISOString(),
                },
                message: isNew ? 'Device registered successfully' : 'Device token updated successfully',
            },
            isNew ? 201 : 200
        );
    } catch (error: any) {
        // Log full error so silent DB failures are visible in server logs
        console.error('[POST /api/devices] ERROR:', error?.message || error);
        console.error('[POST /api/devices] Prisma code:', error?.code);
        console.error('[POST /api/devices] Stack:', error?.stack);
        return handleApiError(error);
    }
}

// DELETE - Remove device token (logout)
export async function DELETE(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return ErrorResponses.unauthorized();
        }

        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return ErrorResponses.validation('Token is required', undefined, 'token');
        }

        // Deactivate or delete the token
        await prisma.deviceToken.deleteMany({
            where: {
                userId: session.userId,
                token,
            },
        });

        return successResponse({
            message: 'Device token removed successfully',
        });
    } catch (error) {
        return handleApiError(error);
    }
}

// GET - List user's device tokens
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return ErrorResponses.unauthorized();
        }

        const deviceTokens = await prisma.deviceToken.findMany({
            where: {
                userId: session.userId,
                isActive: true,
            },
            select: {
                id: true,
                platform: true,
                isActive: true,
                lastUsed: true,
                createdAt: true,
            },
            orderBy: {
                lastUsed: 'desc',
            },
        });

        return successResponse({
            deviceTokens: deviceTokens.map((dt) => ({
                id: dt.id,
                platform: dt.platform,
                isActive: dt.isActive,
                lastUsed: dt.lastUsed.toISOString(),
                createdAt: dt.createdAt.toISOString(),
            })),
        });
    } catch (error) {
        return handleApiError(error);
    }
}
