import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth/jwt';

// Strictly public routes (always accessible without authentication)
const PUBLIC_ROUTES = [
    '/login',
    '/api/auth/login',
];

// Public API routes (GET requests only)
const PUBLIC_API_ROUTES = [
    '/api/news',
];

// Public page routes (no auth required)
const PUBLIC_PAGE_ROUTES = [
    '/',
    '/news',
];

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

/**
 * Check if this request is for a public page route
 */
function isPublicPageRoute(pathname: string): boolean {
    if (pathname === '/') return true;
    return PUBLIC_PAGE_ROUTES.filter(route => route !== '/').some(route => pathname === route || pathname.startsWith(route + '/'));
}

/**
 * Check if this request is for a public API route (GET only)
 */
function isPublicApiRoute(pathname: string, method: string): boolean {
    if (method !== 'GET') return false;
    return PUBLIC_API_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
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

    // 1. Handle Strictly Public Routes (always allowed)
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
        const response = NextResponse.next();
        if (pathname.startsWith('/api')) {
            Object.entries(CORS_HEADERS).forEach(([key, value]) => {
                response.headers.set(key, value);
            });
        }
        return response;
    }

    // 2. Handle Public Page Routes (no auth required - e.g. /news, /news/[id])
    if (isPublicPageRoute(pathname)) {
        return NextResponse.next();
    }

    // 3. Handle Public API Routes (GET only - e.g. GET /api/news, GET /api/news/[id])
    if (isPublicApiRoute(pathname, request.method)) {
        const response = NextResponse.next();
        Object.entries(CORS_HEADERS).forEach(([key, value]) => {
            response.headers.set(key, value);
        });
        return response;
    }

    // 4. Enforce Authentication for EVERYTHING else (Deny by Default)
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
        // If it's a page navigation, redirect to login
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // 5. Verify Token Validity
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
        // Match everything EXCEPT Next.js internals, static assets, and public images
        '/((?!_next/static|_next/image|favicon.ico|uploads|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|otf|eot)).*)',
    ],
};
