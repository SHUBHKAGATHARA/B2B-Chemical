import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

// Force dynamic rendering - this layout needs authentication
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    
    // Redirect to login if no session (shouldn't happen due to middleware, but safety check)
    if (!session) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar userRole={session.role} />
            <TopBar user={session} />
            <main className="ml-64 pt-16 p-6">
                {children}
            </main>
        </div>
    );
}
