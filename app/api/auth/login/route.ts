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

// Allowed origins for CORS (mobile apps + web)
// NOTE: Wildcard '*' cannot be used with credentials:include (cookies).
// We reflect the request origin for trusted clients, falling back to the app URL.
function getCorsHeaders(requestOrigin?: string | null): Record<string, string> {
    const allowedOrigin =
        requestOrigin ||
        process.env.NEXT_PUBLIC_APP_URL ||
        'http://localhost:3000';
    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
    };
}

// Handle preflight requests for mobile apps
export async function OPTIONS(request: NextRequest) {
    const origin = request.headers.get('origin');
    return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(origin),
    });
}

export async function POST(request: NextRequest) {
    const origin = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);

    try {
        const body = await request.json();
        console.log('[Login] Attempting login for:', body.email);
        
        const result = await authenticateLogin(body);

        const cookie = buildAuthCookie(result.token);

        // Build Set-Cookie header with MaxAge so the token persists across page reloads.
        // Without MaxAge/Expires the browser treats it as a session cookie and drops it
        // on a hard reload (window.location.href), which is why the middleware could not
        // find the token after the post-login redirect.
        const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
        const maxAge = 60 * 60 * 24 * 7; // 7 days, matches JWT expiry
        const cookieHeader = [
            `${cookie.name}=${cookie.value}`,
            `Path=/`,
            `Max-Age=${maxAge}`,
            `SameSite=Lax`,
            cookie.options.httpOnly ? 'HttpOnly' : '',
            isProduction ? 'Secure' : '',
        ].filter(Boolean).join('; ');

        console.log('[Login] Setting persistent auth cookie', { isProduction, maxAge });

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
                    ...corsHeaders,
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
                    headers: corsHeaders,
                }
            );
        }

        console.error('[Login] Unexpected error:', error.message || error);
        console.error('[Login] Error type:', error.name);
        console.error('[Login] Error code:', error.code);
        console.error('[Login] Error stack:', error.stack);
        
        // Identify specific error types for better debugging
        let errorMessage = 'Unable to complete login. Please try again.';
        let errorCode = 'INTERNAL_ERROR';
        
        // Database connection errors (Neon sleep mode)
        if (error.name === 'PrismaClientInitializationError' || 
            error.code === 'P1001' || 
            error.message?.includes('Can\'t reach database') ||
            error.message?.includes('connect ECONNREFUSED') ||
            error.message?.includes('timed out')) {
            errorMessage = 'Database is waking up. Please wait 5 seconds and try again.';
            errorCode = 'DB_CONNECTION_ERROR';
            console.error('[Login] DATABASE_URL configured:', !!process.env.DATABASE_URL);
        } else if (error.code === 'P2021' || error.message?.includes('table')) {
            errorMessage = 'Database not properly configured. Please contact support.';
            errorCode = 'DB_SCHEMA_ERROR';
        } else if (error.message?.includes('JWT') || error.message?.includes('secret')) {
            errorMessage = 'Authentication system error. Please contact support.';
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
                headers: corsHeaders,
            }
        );
    }
}
