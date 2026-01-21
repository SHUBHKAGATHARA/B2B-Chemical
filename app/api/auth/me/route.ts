import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';

// Force dynamic rendering and Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


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
            { status: 200 }
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
            { status: 401 }
        );
    }
}
