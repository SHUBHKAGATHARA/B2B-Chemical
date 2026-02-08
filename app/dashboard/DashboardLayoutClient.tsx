'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import AlertBanner from '@/components/alerts/AlertBanner';
import { AlertPopup } from '@/components/alerts/AlertPopup';

interface DashboardLayoutClientProps {
    session: {
        userId: string;
        email: string;
        fullName: string | null;
        role: string;
    };
    userAvatar?: string;
    children: React.ReactNode;
}

export function DashboardLayoutClient({ session, userAvatar, children }: DashboardLayoutClientProps) {
    const [showAlertPopup, setShowAlertPopup] = useState(false);

    useEffect(() => {
        // Show alert popup for distributors after a short delay
        if (session.role === 'DISTRIBUTOR') {
            const timer = setTimeout(() => {
                setShowAlertPopup(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [session.role]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar userRole={session.role} />
            <Header
                userName={session.fullName || session.email}
                userRole={session.role === 'ADMIN' ? 'Super Admin' : 'Distributor'}
                userAvatar={userAvatar}
            />
            <main className="ml-64 pt-16 p-8">
                {session.role === 'DISTRIBUTOR' && <AlertBanner />}
                {children}
            </main>

            {/* Alert Popup for Distributors */}
            {session.role === 'DISTRIBUTOR' && showAlertPopup && (
                <AlertPopup onClose={() => setShowAlertPopup(false)} />
            )}
        </div>
    );
}
