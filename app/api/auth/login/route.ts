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
        console.log('[Login] Environment check:', {
            hasJwtSecret: !!process.env.JWT_SECRET,
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            nodeEnv: process.env.NODE_ENV,
        });

        const result = await authenticateLogin(body);

        const cookie = buildAuthCookie(result.token);

        // Generate refresh token
        const { generateRefreshToken } = await import('@/lib/auth/jwt');
        const refreshToken = generateRefreshToken(result.user.id);

        // Calculate expiry (15 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 15);

        // Store refresh token in database
        const { prisma } = await import('@/lib/db');
        await prisma.refreshToken.create({
            data: {
                userId: result.user.id,
                token: refreshToken,
                expiresAt: expiresAt,
            },
        });

        // Build Set-Cookie headers
        const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

        // Access token cookie (15 minutes)
        const accessCookieHeader = [
            `${cookie.name}=${cookie.value}`,
            `Path=/`,
            `SameSite=Lax`,
            cookie.options.httpOnly ? 'HttpOnly' : '',
            isProduction ? 'Secure' : '',
            `Max-Age=900`, // 15 minutes
        ].filter(Boolean).join('; ');

        // Refresh token cookie (15 days, HttpOnly, Secure)
        const refreshCookieHeader = [
            `refreshToken=${refreshToken}`,
            `Path=/`,
            `SameSite=Strict`,
            `HttpOnly`,
            isProduction ? 'Secure' : '',
            `Max-Age=1296000`, // 15 days
        ].filter(Boolean).join('; ');

        console.log('[Login] Setting access and refresh tokens', { isProduction });

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
            }
        );

        // Set multiple cookies using Headers
        response.headers.append('Set-Cookie', accessCookieHeader);
        response.headers.append('Set-Cookie', refreshCookieHeader);

        // Add CORS headers
        Object.entries(CORS_HEADERS).forEach(([key, value]) => {
            response.headers.set(key, value);
        });

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

        console.error('[Login] Unexpected error:', error);
        console.error('[Login] Error type:', error?.constructor?.name);
        console.error('[Login] Error message:', error?.message);
        console.error('[Login] Error code:', error?.code);
        console.error('[Login] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        console.error('[Login] Error stack:', error?.stack);

        // Identify specific error types for better debugging and user feedback
        let errorMessage = 'Unable to complete login. Please try again or contact support.';
        let errorCode = 'INTERNAL_ERROR';

        // Database connection errors
        if (error.code === 'P1001' || error.code === 'ECONNREFUSED' || error.message?.includes('connect') || error.message?.includes('ECONNREFUSED')) {
            errorMessage = 'Cannot connect to database. Please check your internet connection and try again.';
            errorCode = 'DB_CONNECTION_ERROR';
            console.error('[Login] DATABASE_URL configured:', !!process.env.DATABASE_URL);
            console.error('[Login] DATABASE_URL value:', process.env.DATABASE_URL?.substring(0, 30) + '...');
        }
        // Database schema errors
        else if (error.code === 'P2021' || error.code === 'P2025' || error.message?.includes('table') || error.message?.includes('relation')) {
            errorMessage = 'Database schema error. Please contact the administrator.';
            errorCode = 'DB_SCHEMA_ERROR';
        }
        // Prisma client not generated
        else if (error.message?.includes('PrismaClient') || error.message?.includes('prisma generate')) {
            errorMessage = 'Database client not initialized. Please contact the administrator.';
            errorCode = 'PRISMA_CLIENT_ERROR';
        }
        // JWT/Auth configuration errors
        else if (error.message?.includes('JWT') || error.message?.includes('secret') || error.message?.includes('token')) {
            errorMessage = 'Authentication system error. Please contact the administrator.';
            errorCode = 'AUTH_CONFIG_ERROR';
            console.error('[Login] JWT_SECRET configured:', !!process.env.JWT_SECRET);
        }
        // Password hashing errors
        else if (error.message?.includes('bcrypt') || error.message?.includes('hash')) {
            errorMessage = 'Password verification error. Please try again.';
            errorCode = 'PASSWORD_HASH_ERROR';
        }
        // Network/timeout errors
        else if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
            errorMessage = 'Request timed out. Please check your connection and try again.';
            errorCode = 'TIMEOUT_ERROR';
        }

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: errorCode,
                    message: errorMessage,
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
                },
            },
            {
                status: 500,
                headers: CORS_HEADERS,
            }
        );
    }
}
