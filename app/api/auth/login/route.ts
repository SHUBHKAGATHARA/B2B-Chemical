import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
    authenticateLogin,
    buildAuthCookie,
    LoginException,
} from '@/lib/auth/login-service';

// Force Node.js runtime (bcryptjs not compatible with Edge Runtime)
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        console.log('[Login] Environment check:', {
            hasJWT: !!process.env.JWT_SECRET,
            hasDB: !!process.env.DATABASE_URL,
            nodeEnv: process.env.NODE_ENV,
            isVercel: process.env.VERCEL,
        });
        
        const body = await request.json();
        console.log('[Login] Attempting login for:', body.email);
        
        const result = await authenticateLogin(body);

        const cookie = buildAuthCookie(result.token);

        // Build Set-Cookie header manually for better control
        // Build Set-Cookie header manually
        // We REMOVE Max-Age and Expires to make this a Session Cookie
        // The browser will delete it when the session ends (browser closed)
        const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
        const cookieHeader = [
            `${cookie.name}=${cookie.value}`,
            `Path=/`,
            `SameSite=Lax`,
            cookie.options.httpOnly ? 'HttpOnly' : '',
            isProduction ? 'Secure' : '',
        ].filter(Boolean).join('; ');

        console.log('[Login] Setting session cookie (no stats/persist)', { isProduction });

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
            console.log('[Login] Authentication failed:', error.code, error.message);
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

        console.error('[Login] Unexpected error:', error);
        
        // Check for common production issues
        if (error.message?.includes('JWT') && !process.env.JWT_SECRET) {
            console.error('[Login] JWT_SECRET is not configured!');
        }
        if (error.message?.includes('database') || error.code === 'P1001') {
            console.error('[Login] Database connection issue!');
        }
        
        const isDev = process.env.NODE_ENV === 'development';
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: isDev ? error.message : 'An error occurred during login. Please check server logs.',
                    details: isDev ? error.stack : undefined,
                },
            },
            { status: 500 }
        );
    }
}
