import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { DashboardLayoutClient } from '@/app/dashboard/DashboardLayoutClient';

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
        <DashboardLayoutClient
            session={{
                ...session,
                fullName: session.fullName ?? null,
            }}
            userAvatar={user?.profilePicture || undefined}
        >
            {children}
        </DashboardLayoutClient>
    );
}
