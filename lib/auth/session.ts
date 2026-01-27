import { cookies, headers } from 'next/headers';
import { verifyToken } from './jwt';

export interface Session {
    userId: string;
    email: string;
    role: string;
    fullName?: string;
}

/**
 * Get token from request - supports both cookie and Authorization header
 * Mobile apps use Authorization: Bearer <token>
 * Web apps use auth_token cookie
 */
function getTokenFromRequest(): string | null {
    // First check Authorization header (for mobile apps)
    const headerStore = headers();
    const authHeader = headerStore.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    
    // Fallback to cookie (for web apps)
    const cookieStore = cookies();
    return cookieStore.get('auth_token')?.value || null;
}

/**
 * Get current session from JWT token stored in auth_token cookie or Authorization header
 */
export async function getSession(): Promise<Session | null> {
    try {
        const token = getTokenFromRequest();

        if (!token) {
            return null;
        }

        const payload = await verifyToken(token);

        return {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            fullName: payload.fullName,
        };
    } catch (error) {
        console.error('Session error:', error);
        return null;
    }
}

/**
 * Require authenticated user
 */
export async function requireAuth(): Promise<Session> {
    const session = await getSession();

    if (!session) {
        throw new Error('Unauthorized: Please login');
    }

    return session;
}

/**
 * Require admin role
 */
export async function requireAdmin(): Promise<Session> {
    const session = await requireAuth();

    if (session.role !== 'ADMIN') {
        throw new Error('Forbidden: Admin access required');
    }

    return session;
}

/**
 * Require distributor role
 */
export async function requireDistributor(): Promise<Session> {
    const session = await requireAuth();

    if (session.role !== 'DISTRIBUTOR') {
        throw new Error('Forbidden: Distributor access required');
    }

    return session;
}
