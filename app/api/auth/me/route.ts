import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';

// Force dynamic rendering and Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// CORS helper — reflects request origin so cookies work with credentials:include
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
    return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(request.headers.get('origin')),
    });
}

export async function GET(request: NextRequest) {
    const corsHeaders = getCorsHeaders(request.headers.get('origin'));
    try {
        const session = await requireAuth();

        return NextResponse.json(
            {
                success: true,
                data: {
                    user: {
                        id: session.userId,
                        email: session.email,
                        role: session.role,
                        fullName: session.fullName,
                    },
                },
                meta: {
                    timestamp: new Date().toISOString(),
                },
            },
            { 
                status: 200,
                headers: corsHeaders,
            }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: error.message || 'Not authenticated',
                },
            },
            { 
                status: 401,
                headers: corsHeaders,
            }
        );
    }
}
