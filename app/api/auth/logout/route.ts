import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime (bcryptjs not compatible with Edge Runtime)
export const runtime = 'nodejs';


export async function POST(_request: NextRequest) {
    try {
        // Build Set-Cookie header to clear the cookie
        const cookieHeader = [
            `auth_token=`,
            `Max-Age=0`,
            `Expires=${new Date(0).toUTCString()}`,
            `Path=/`,
            `SameSite=Lax`,
            'HttpOnly',
            process.env.NODE_ENV === 'production' ? 'Secure' : '',
        ].filter(Boolean).join('; ');

        const response = NextResponse.json(
            {
                success: true,
                data: {
                    message: 'Logged out successfully',
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
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'An error occurred during logout',
                },
            },
            { status: 500 }
        );
    }
}
