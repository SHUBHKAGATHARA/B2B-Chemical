import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';

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

export async function GET(request: NextRequest) {
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
                headers: CORS_HEADERS,
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
                headers: CORS_HEADERS,
            }
        );
    }
}
