import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { verifyToken, generateAccessToken } from '@/lib/auth/jwt';
import { successResponse } from '@/lib/utils/api-response';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        // Get refresh token from cookie
        const cookieStore = cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'No refresh token provided' } },
                { status: 401 }
            );
        }

        // Verify refresh token
        let payload;
        try {
            payload = await verifyToken(refreshToken);
        } catch (error) {
            return NextResponse.json(
                { success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired refresh token' } },
                { status: 401 }
            );
        }

        // Check if refresh token exists and is active in database
        const storedToken = await prisma.refreshToken.findFirst({
            where: {
                token: refreshToken,
                isActive: true,
                expiresAt: {
                    gt: new Date(),
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        fullName: true,
                        status: true,
                    },
                },
            },
        });

        if (!storedToken) {
            return NextResponse.json(
                { success: false, error: { code: 'INVALID_TOKEN', message: 'Refresh token not found or expired' } },
                { status: 401 }
            );
        }

        // Check if user is still active
        if (storedToken.user.status !== 'ACTIVE') {
            // Deactivate the refresh token
            await prisma.refreshToken.update({
                where: { id: storedToken.id },
                data: { isActive: false },
            });

            return NextResponse.json(
                { success: false, error: { code: 'ACCOUNT_INACTIVE', message: 'User account is not active' } },
                { status: 403 }
            );
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(
            storedToken.user.id,
            storedToken.user.email,
            storedToken.user.role,
            storedToken.user.fullName
        );

        // Set new access token in cookie
        const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
        const accessCookieHeader = [
            `auth-token=${newAccessToken}`,
            `Path=/`,
            `SameSite=Lax`,
            `HttpOnly`,
            isProduction ? 'Secure' : '',
            `Max-Age=900`, // 15 minutes
        ].filter(Boolean).join('; ');

        return NextResponse.json(
            successResponse(
                {
                    token: newAccessToken,
                    user: {
                        id: storedToken.user.id,
                        email: storedToken.user.email,
                        role: storedToken.user.role,
                        fullName: storedToken.user.fullName,
                    },
                }
            ),
            {
                headers: {
                    'Set-Cookie': accessCookieHeader,
                },
            }
        );
    } catch (error: any) {
        console.error('Error refreshing token:', error);
        return NextResponse.json(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to refresh token', details: error.message } },
            { status: 500 }
        );
    }
}
