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
            return ErrorResponses.unauthorized();
        }

        const body = await request.json();

        // Validate input
        const validation = registerDeviceSchema.safeParse(body);
        if (!validation.success) {
            return ErrorResponses.validation(
                'Invalid device registration data',
                validation.error.errors
            );
        }

        const { token, platform, deviceInfo } = validation.data;

        // Check if token already exists
        const existingToken = await prisma.deviceToken.findUnique({
            where: { token },
        });

        if (existingToken) {
            // Update existing token
            const updated = await prisma.deviceToken.update({
                where: { token },
                data: {
                    userId: session.userId,
                    platform,
                    isActive: true,
                    deviceInfo: deviceInfo || undefined,
                    lastUsed: new Date(),
                },
            });

            return successResponse({
                deviceToken: {
                    id: updated.id,
                    platform: updated.platform,
                    isActive: updated.isActive,
                    lastUsed: updated.lastUsed.toISOString(),
                },
                message: 'Device token updated successfully',
            });
        }

        // Create new token
        const deviceToken = await prisma.deviceToken.create({
            data: {
                userId: session.userId,
                token,
                platform,
                deviceInfo: deviceInfo || undefined,
            },
        });

        return successResponse(
            {
                deviceToken: {
                    id: deviceToken.id,
                    platform: deviceToken.platform,
                    isActive: deviceToken.isActive,
                    lastUsed: deviceToken.lastUsed.toISOString(),
                },
                message: 'Device registered successfully',
            },
            201
        );
    } catch (error) {
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
