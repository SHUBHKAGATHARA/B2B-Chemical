import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

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

    // Fetch user's profile picture
    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { profilePicture: true },
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar userRole={session.role} />
            <Header
                userName={session.fullName || session.email}
                userRole={session.role === 'ADMIN' ? 'Super Admin' : 'Distributor'}
                userAvatar={user?.profilePicture || undefined}
            />
            <main className="ml-64 pt-16 p-8">
                {children}
            </main>
        </div>
    );
}
