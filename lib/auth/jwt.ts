import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // 7 days

// Warn if using fallback secret in production
if ((process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') && !process.env.JWT_SECRET) {
    console.error('WARNING: JWT_SECRET environment variable is not set in production!');
}

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    fullName?: string;
}

/**
 * Generate JWT token for authenticated user
 */
export function generateToken(userId: string, email: string, role: string, fullName?: string): string {
    const payload: JWTPayload = { userId, email, role, fullName };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode JWT token
 * Uses jose for Edge Runtime compatibility
 * @throws Error if token is invalid or expired
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload as unknown as JWTPayload;
    } catch (error: any) {
        if (error.code === 'ERR_JWT_EXPIRED') {
            throw new Error('Token has expired');
        }
        // Generalize other errors
        throw new Error('Token verification failed');
    }
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

/**
 * Compare plain password with hashed password
 */
export async function comparePassword(
    plainPassword: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
}
