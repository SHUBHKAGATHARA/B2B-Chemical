import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { getSession } from '@/lib/auth/session';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

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
