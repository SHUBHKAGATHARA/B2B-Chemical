/**
 * Authentication Token Storage Utility
 * Manages JWT tokens in localStorage for Bearer token authentication
 */

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const authStorage = {
    /**
     * Get the stored JWT token
     */
    getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(TOKEN_KEY);
    },

    /**
     * Store the JWT token
     */
    setToken(token: string): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(TOKEN_KEY, token);
    },

    /**
     * Remove the JWT token
     */
    removeToken(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    /**
     * Check if a token exists
     */
    hasToken(): boolean {
        return !!this.getToken();
    },

    /**
     * Store user data (optional, for quick access)
     */
    setUser(user: any): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    /**
     * Get stored user data
     */
    getUser(): any | null {
        if (typeof window === 'undefined') return null;
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    /**
     * Clear all auth data
     */
    clearAll(): void {
        this.removeToken();
    },
};
