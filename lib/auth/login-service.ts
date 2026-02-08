import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { comparePassword, generateToken } from './jwt';
import { loginSchema } from '@/lib/validations/schemas';

export const AUTH_COOKIE_NAME = 'auth_token';
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface AuthenticatedUser {
    id: string;
    email: string;
    role: string;
    status: string;
    fullName?: string | null;
    lastLogin?: Date | null;
}

export interface LoginResult {
    user: AuthenticatedUser;
    token: string;
    expiresAt: Date;
}

export class LoginException extends Error {
    code: 'VALIDATION_ERROR' | 'INVALID_CREDENTIALS' | 'ACCOUNT_INACTIVE';
    status: number;
    field?: string;

    constructor(
        code: 'VALIDATION_ERROR' | 'INVALID_CREDENTIALS' | 'ACCOUNT_INACTIVE',
        message: string,
        status: number,
        field?: string,
    ) {
        super(message);
        this.code = code;
        this.status = status;
        this.field = field;
    }
}

export async function authenticateLogin(params: { email: string; password: string }): Promise<LoginResult> {
    console.log('[Auth Service] Starting authentication for:', params.email);
    
    // Trim inputs before validation
    const trimmedParams = {
        email: params.email?.trim() || '',
        password: params.password?.trim() || '',
    };

    console.log('[Auth Service] Validating input...');
    const parsed = loginSchema.safeParse(trimmedParams);
    if (!parsed.success) {
        const firstError = parsed.error.errors[0];
        throw new LoginException(
            'VALIDATION_ERROR',
            firstError?.message || 'Invalid input',
            400,
            firstError?.path?.[0] as string | undefined
        );
    }

    const { email, password } = parsed.data;

    console.log('[Auth Service] Looking up user in database...');
    const user = await prisma.user.findUnique({ where: { email } });
    console.log('[Auth Service] User found:', !!user);
    if (!user) {
        throw new LoginException('INVALID_CREDENTIALS', 'Invalid email or password', 401, 'email');
    }

    if (user.status !== 'ACTIVE') {
        throw new LoginException('ACCOUNT_INACTIVE', 'Account is inactive', 403);
    }

    console.log('[Auth Service] Comparing password...');
    const passwordOk = await comparePassword(password, user.passwordHash);
    console.log('[Auth Service] Password match:', passwordOk);
    
    if (!passwordOk) {
        throw new LoginException('INVALID_CREDENTIALS', 'Invalid email or password', 401, 'password');
    }

    console.log('[Auth Service] Generating JWT token...');
    const token = generateToken(user.id, user.email, user.role, user.fullName);
    console.log('[Auth Service] Token generated successfully');
    const expiresAt = new Date(Date.now() + AUTH_COOKIE_MAX_AGE_SECONDS * 1000);

    // Update last login asynchronously (don't wait for it to complete)
    prisma.user.update({ 
        where: { id: user.id }, 
        data: { lastLogin: new Date() } 
    }).catch((err: unknown) => console.error('[Auth Service] Failed to update lastLogin:', err));

    console.log('[Auth Service] Login successful for:', email);
    return {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            fullName: user.fullName,
            lastLogin: user.lastLogin,
        },
        token,
        expiresAt,
    };
}

export function buildAuthCookie(token: string) {
    const expiresDate = new Date(Date.now() + AUTH_COOKIE_MAX_AGE_SECONDS * 1000);
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    return {
        name: AUTH_COOKIE_NAME,
        value: token,
        options: {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax' as const,
            path: '/',
            // No maxAge or expires -> Session Cookie
        },
    };
}

export function persistAuthCookie(token: string) {
    const cookie = buildAuthCookie(token);
    const cookieStore = cookies();
    cookieStore.set(cookie.name, cookie.value, cookie.options);
}
