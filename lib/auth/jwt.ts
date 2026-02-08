import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRES_IN = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = '15d'; // 15 days

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    fullName?: string;
    type?: 'access' | 'refresh';
}

/**
 * Generate Access Token (15 minutes)
 */
export function generateAccessToken(userId: string, email: string, role: string, fullName?: string): string {
    const payload: JWTPayload = { userId, email, role, fullName, type: 'access' };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

/**
 * Generate Refresh Token (15 days)
 */
export function generateRefreshToken(userId: string): string {
    const payload = { userId, type: 'refresh' };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

/**
 * Legacy token generation (for backwards compatibility)
 */
export function generateToken(userId: string, email: string, role: string, fullName?: string): string {
    return generateAccessToken(userId, email, role, fullName);
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
