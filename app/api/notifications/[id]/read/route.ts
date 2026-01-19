import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireDistributor } from '@/lib/auth/session';

// PATCH - Mark notification as read
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await requireDistributor();
        const { id } = params;

        // Get distributor ID
        const distributor = await prisma.distributor.findUnique({
            where: { email: session.email },
            select: { id: true },
        });

        if (!distributor) {
            return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
        }

        // Update notification (only if it belongs to this distributor)
        const notification = await prisma.notification.updateMany({
            where: {
                id,
                distId: distributor.id,
            },
            data: {
                readFlag: true,
            },
        });

        if (notification.count === 0) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Notification marked as read' });
    } catch (error: any) {
        if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('Mark notification read error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
