import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
    authenticateLogin,
    buildAuthCookie,
    LoginException,
} from '@/lib/auth/login-service';

// Force dynamic rendering and Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// CORS headers for mobile app support
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

// Handle preflight requests for mobile apps
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: CORS_HEADERS,
    });
}

export async function POST(request: NextRequest) {
    try {
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
                    ...CORS_HEADERS,
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
                { 
                    status: error.status,
                    headers: CORS_HEADERS,
                }
            );
        }

        console.error('[Login] Unexpected error:', error.message || error);
        console.error('[Login] Error stack:', error.stack);
        
        // Identify specific error types for better debugging
        let errorMessage = 'An error occurred during login.';
        let errorCode = 'INTERNAL_ERROR';
        
        if (error.code === 'P1001' || error.message?.includes('connect')) {
            errorMessage = 'Database connection failed. Please try again.';
            errorCode = 'DB_CONNECTION_ERROR';
            console.error('[Login] DATABASE_URL configured:', !!process.env.DATABASE_URL);
        } else if (error.code === 'P2021' || error.message?.includes('table')) {
            errorMessage = 'Database not properly set up.';
            errorCode = 'DB_SCHEMA_ERROR';
        } else if (error.message?.includes('JWT') || error.message?.includes('secret')) {
            errorMessage = 'Authentication configuration error.';
            errorCode = 'AUTH_CONFIG_ERROR';
            console.error('[Login] JWT_SECRET configured:', !!process.env.JWT_SECRET);
        }
        
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: errorCode,
                    message: errorMessage,
                },
            },
            { 
                status: 500,
                headers: CORS_HEADERS,
            }
        );
    }
}
