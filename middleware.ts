import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth/jwt';

// strictly public routes
const PUBLIC_ROUTES = ['/login', '/api/auth/login'];

// CORS headers for mobile app support
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
};

/**
 * Create a JSON response with CORS headers for mobile apps
 */
function createApiResponse(body: object, status: number) {
    return NextResponse.json(body, {
        status,
        headers: CORS_HEADERS,
    });
}

/**
 * Extract token from request - supports both cookie and Authorization header
 * Mobile apps use Authorization: Bearer <token>
 * Web apps use auth_token cookie
 */
function getTokenFromRequest(request: NextRequest): string | null {
    // First check Authorization header (for mobile apps)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    
    // Fallback to cookie (for web apps)
    return request.cookies.get('auth_token')?.value || null;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Handle CORS preflight requests for mobile apps
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 204,
            headers: CORS_HEADERS,
        });
    }
    
    const token = getTokenFromRequest(request);

    console.log(`[Middleware] ${request.method} ${pathname} - Token: ${!!token}`);

    // 1. Handle Public Routes
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
        // We do NOT redirect to dashboard even if token exists.
        // User wants to always see login page when visiting /login
        const response = NextResponse.next();
        // Add CORS headers to public API routes too
        if (pathname.startsWith('/api')) {
            Object.entries(CORS_HEADERS).forEach(([key, value]) => {
                response.headers.set(key, value);
            });
        }
        return response;
    }

    // 2. Enforce Authentication for EVERYTHING else (Deny by Default)
    // If no token is present
    if (!token) {
        // If it's an API route, return 401 JSON with CORS headers for mobile
        if (pathname.startsWith('/api')) {
            return createApiResponse(
                { 
                    success: false,
                    error: { 
                        message: 'Unauthorized: Please login', 
                        code: 'UNAUTHORIZED' 
                    } 
                },
                401
            );
        }
        // If it's a page navigation (including root '/'), redirect to login
        const loginUrl = new URL('/login', request.url);
        // Optional: save the return url? loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 3. Verify Token Validity
    try {
        await verifyToken(token);
        // Token is valid, allow access
        const response = NextResponse.next();
        // Add CORS headers to all API responses for mobile apps
        if (pathname.startsWith('/api')) {
            Object.entries(CORS_HEADERS).forEach(([key, value]) => {
                response.headers.set(key, value);
            });
        }
        return response;
    } catch (error: any) {
        // Token is invalid/expired
        console.error(`[Middleware] Token verification failed for ${pathname}:`, error);

        // If API, return 401 with specific error code for mobile apps
        if (pathname.startsWith('/api')) {
            const isExpired = error.message?.includes('expired');
            return createApiResponse(
                { 
                    success: false,
                    error: { 
                        message: isExpired ? 'Token has expired' : 'Invalid token', 
                        code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN' 
                    } 
                },
                401
            );
        }

        // If Page, redirect to login and clear bad cookie
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_token');
        return response;
    }
}

export const config = {
    matcher: [
        // Match everything except static files and images
        '/((?!_next/static|_next/image|favicon.ico|uploads).*)',
    ],
};
