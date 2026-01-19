import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
    authenticateLogin,
    buildAuthCookie,
    LoginException,
} from '@/lib/auth/login-service';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = await authenticateLogin(body);

        const cookie = buildAuthCookie(result.token);

        // Build Set-Cookie header manually for better control
        // Build Set-Cookie header manually
        // We REMOVE Max-Age and Expires to make this a Session Cookie
        // The browser will delete it when the session ends (browser closed)
        const cookieHeader = [
            `${cookie.name}=${cookie.value}`,
            `Path=/`,
            `SameSite=Lax`,
            cookie.options.httpOnly ? 'HttpOnly' : '',
            cookie.options.secure ? 'Secure' : '',
        ].filter(Boolean).join('; ');

        console.log('[Login] Setting session cookie (no stats/persist)');

        const response = NextResponse.json(
            {
                success: true,
                data: {
                    user: result.user,
                    token: result.token,
                    expiresAt: result.expiresAt.toISOString(),
                },
                meta: {
                    timestamp: new Date().toISOString(),
                },
            },
            {
                status: 200,
                headers: {
                    'Set-Cookie': cookieHeader,
                },
            }
        );

        return response;
    } catch (error: any) {
        if (error instanceof LoginException) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: error.code,
                        message: error.message,
                        field: error.field,
                    },
                },
                { status: error.status }
            );
        }

        console.error('Login error:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'An error occurred during login',
                },
            },
            { status: 500 }
        );
    }
}
