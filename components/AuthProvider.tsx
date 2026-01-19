'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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
                try {
                    const response = await fetch('/api/auth/me', {
                        method: 'GET',
                        credentials: 'include', // Important: include cookies
                        headers: {
                            'Cache-Control': 'no-cache',
                        },
                    });

                    if (!response.ok) {
                        // Not authenticated, redirect to login
                        router.push('/login');
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    // On error, redirect to login to be safe
                    router.push('/login');
                }
            }
            
            setIsChecking(false);
        };

        checkAuth();
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
