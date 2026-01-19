import { cookies } from 'next/headers';
import { verifyToken } from './jwt';

export interface Session {
    userId: string;
    email: string;
    role: string;
    fullName?: string;
}

/**
 * Get current session from JWT token stored in auth_token cookie
 */
export async function getSession(): Promise<Session | null> {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('auth_token')?.value;

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
