import { randomBytes, createHash } from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'csrf-secret-fallback';

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
    return randomBytes(32).toString('hex');
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, expectedToken: string): boolean {
    if (!token || !expectedToken) return false;

    // Constant-time comparison to prevent timing attacks
    const hash1 = createHash('sha256').update(token).digest('hex');
    const hash2 = createHash('sha256').update(expectedToken).digest('hex');

    return hash1 === hash2;
}
