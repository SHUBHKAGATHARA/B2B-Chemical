'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authStorage } from '@/lib/auth-storage';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Check authentication status on mount and route changes
        const checkAuth = async () => {
            // Skip check on public routes
            if (pathname === '/login' || pathname.startsWith('/api/')) {
                setIsChecking(false);
                return;
            }

            // Only check for dashboard routes
            if (pathname.startsWith('/dashboard')) {
                // First check if we have a token in localStorage (quick check)
                const hasLocalToken = authStorage.hasToken();
                
                if (!hasLocalToken) {
                    // No token at all, redirect immediately
                    router.push('/login');
                    setIsChecking(false);
                    return;
                }
                
                try {
                    const response = await fetch('/api/auth/me', {
                        method: 'GET',
                        credentials: 'include', // Important: include cookies
                        headers: {
                            'Cache-Control': 'no-cache',
                            // Also send Bearer token for redundancy
                            ...(hasLocalToken && { 'Authorization': `Bearer ${authStorage.getToken()}` }),
                        },
                    });

                    if (!response.ok) {
                        // Token invalid, clear storage and redirect to login
                        authStorage.clearAll();
                        router.push('/login');
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    // On network error, don't redirect - let user continue
                    // The middleware will handle actual auth failures
                }
            }
            
            setIsChecking(false);
        };

        // Small delay to allow cookies to be set after login redirect
        const timer = setTimeout(checkAuth, 50);
        return () => clearTimeout(timer);
    }, [pathname, router]);

    // Show nothing while checking auth (middleware will handle the redirect)
    if (isChecking && pathname.startsWith('/dashboard')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
