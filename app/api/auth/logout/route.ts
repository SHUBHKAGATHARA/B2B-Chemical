import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering and Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


export async function POST(request: NextRequest) {
    try {
        // Get refresh token from cookie to invalidate
        const { cookies } = await import('next/headers');
        const cookieStore = cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;

        // Invalidate refresh token in database if it exists
        if (refreshToken) {
            const { prisma } = await import('@/lib/db');
            await prisma.refreshToken.updateMany({
                where: {
                    token: refreshToken,
                },
                data: {
                    isActive: false,
                },
            });
        }

        // Clear both auth and refresh token cookies
        const authCookieHeader = [
            `auth_token=`,
            `Max-Age=0`,
            `Expires=${new Date(0).toUTCString()}`,
            `Path=/`,
            `SameSite=Lax`,
            'HttpOnly',
            process.env.NODE_ENV === 'production' ? 'Secure' : '',
        ].filter(Boolean).join('; ');

        const refreshCookieHeader = [
            `refreshToken=`,
            `Max-Age=0`,
            `Expires=${new Date(0).toUTCString()}`,
            `Path=/`,
            `SameSite=Strict`,
            'HttpOnly',
            process.env.NODE_ENV === 'production' ? 'Secure' : '',
        ].filter(Boolean).join('; ');

        const response = NextResponse.json(
            {
                success: true,
                data: {
                    message: 'Logged out successfully',
                },
                meta: {
                    timestamp: new Date().toISOString(),
                },
            },
            { 
                status: 200,
            }
        );

        // Set multiple cookies using Headers
        response.headers.append('Set-Cookie', authCookieHeader);
        response.headers.append('Set-Cookie', refreshCookieHeader);

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'An error occurred during logout',
                },
            },
            { status: 500 }
        );
    }
}
